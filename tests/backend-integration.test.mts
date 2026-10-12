import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomInt } from "node:crypto";
import { readFile } from "node:fs/promises";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getPool, closePool } from "../src/lib/db.mts";
import { validateLead, LeadError, type Lead } from "../src/lib/lead-core.mts";
import { leadConfig, submitLead } from "../src/lib/leads.mts";

// Explicit test database opt-in. Never uses an existing production DATABASE_URL.
const enabled = Boolean(process.env.TEST_DATABASE_URL);
const ids: string[] = [];
const originalFetch = globalThis.fetch;
const testConfig = { skip: !enabled };
const exec = promisify(execFile);
before(async () => {
  if (!enabled) return;
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.TELEGRAM_BOT_TOKEN = "mock-test-only";
  process.env.TELEGRAM_CHAT_ID = "mock-test-only";
  process.env.LEAD_HASH_SECRET =
    "backend-integration-test-secret-not-production";
  await getPool().query(
    await readFile(new URL("../sql/schema.sql", import.meta.url), "utf8"),
  );
});
after(async () => {
  globalThis.fetch = originalFetch;
  if (enabled && ids.length)
    await getPool().query(
      "DELETE FROM renovation.leads WHERE request_id=ANY($1::uuid[])",
      [ids],
    );
  await closePool();
});
function newLead(): Lead {
  const requestId = randomUUID();
  ids.push(requestId);
  return validateLead({
    requestId,
    phone: "+7999" + String(randomInt(1000000, 9999999)),
    area: 21,
    consent: true,
    intent: "estimate",
    source: "/__backend_test__",
  });
}
function mockTelegram(body: unknown, status = 200, delay = 0) {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
  return () => calls;
}
test(
  "SQL persistence: simultaneous same-ID requests produce exactly one Telegram attempt",
  testConfig,
  async () => {
    const lead = newLead();
    const calls = mockTelegram(
      { ok: true, result: { message_id: 101 } },
      200,
      80,
    );
    const outcomes = await Promise.allSettled([
      submitLead(lead),
      submitLead(lead),
    ]);
    assert.equal(calls(), 1);
    assert.equal(
      outcomes.filter((item) => item.status === "fulfilled").length,
      1,
    );
    const stored = await getPool().query(
      "SELECT status,attempts,telegram_message_id FROM renovation.leads WHERE request_id=$1",
      [lead.requestId],
    );
    assert.equal(stored.rows[0].status, "delivered");
    assert.equal(stored.rows[0].attempts, 1);
    await submitLead(lead);
    assert.equal(calls(), 1);
    await assert.rejects(
      submitLead({ ...lead, comment: "edited" }),
      (error: unknown) => error instanceof LeadError && error.status === 409,
    );
  },
);
test(
  "SQL persistence: ambiguous response is durable and retry does not duplicate",
  testConfig,
  async () => {
    const lead = newLead();
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      throw new Error("simulated transport loss after possible delivery");
    }) as typeof fetch;
    await assert.rejects(
      submitLead(lead),
      (error: unknown) => error instanceof LeadError && error.status === 503,
    );
    await assert.rejects(
      submitLead(lead),
      (error: unknown) => error instanceof LeadError && error.status === 503,
    );
    assert.equal(calls, 1);
    const stored = await getPool().query(
      "SELECT status FROM renovation.leads WHERE request_id=$1",
      [lead.requestId],
    );
    assert.equal(stored.rows[0].status, "uncertain");
  },
);
test(
  "SQL persistence: known Telegram rejection permits safe same-ID retry",
  testConfig,
  async () => {
    const lead = newLead();
    mockTelegram({ ok: false, error_code: 400 }, 400);
    await assert.rejects(submitLead(lead));
    await getPool().query(
      "UPDATE renovation.leads SET updated_at=now()-interval '6 seconds' WHERE request_id=$1",
      [lead.requestId],
    );
    const calls = mockTelegram({ ok: true, result: { message_id: 102 } });
    await submitLead(lead);
    assert.equal(calls(), 1);
    const stored = await getPool().query(
      "SELECT status,attempts FROM renovation.leads WHERE request_id=$1",
      [lead.requestId],
    );
    assert.equal(stored.rows[0].status, "delivered");
    assert.equal(stored.rows[0].attempts, 2);
  },
);
test(
  "SQL persistence: phone rate limit permits retries but refuses a fourth new lead",
  testConfig,
  async () => {
    const first = newLead();
    const calls = mockTelegram({ ok: true, result: { message_id: 103 } });
    for (let index = 0; index < 3; index++) {
      const lead = index === 0 ? first : { ...first, requestId: randomUUID() };
      if (index) ids.push(lead.requestId);
      await submitLead(lead);
    }
    await submitLead(first);
    const fourth = { ...first, requestId: randomUUID() };
    ids.push(fourth.requestId);
    await assert.rejects(
      submitLead(fourth),
      (error: unknown) => error instanceof LeadError && error.status === 429,
    );
    assert.equal(calls(), 3);
  },
);

test(
  "missing Telegram configuration fails closed before creating a database row",
  testConfig,
  async () => {
    const lead = newLead();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_BOT_TOKEN;
    try {
      assert.throws(
        () => leadConfig(),
        (error: unknown) => error instanceof LeadError && error.status === 503,
      );
      await assert.rejects(
        submitLead(lead),
        (error: unknown) => error instanceof LeadError && error.status === 503,
      );
      const result = await getPool().query(
        "SELECT request_id FROM renovation.leads WHERE request_id=$1",
        [lead.requestId],
      );
      assert.equal(result.rowCount, 0);
    } finally {
      process.env.TELEGRAM_BOT_TOKEN = token;
    }
  },
);

test(
  "actual CLI schema/seed are idempotent and lead create/read/update/delete persists",
  testConfig,
  async () => {
    const seedId = "8eb73df9-cb90-48e3-81ab-e7c66d82a1e2";
    const preexistingSeed = await getPool().query(
      "SELECT request_id FROM renovation.leads WHERE request_id=$1",
      [seedId],
    );
    if (!preexistingSeed.rowCount) ids.push(seedId);
    const folder = await mkdtemp(join(tmpdir(), "flip-backend-test-"));
    const cli = (script: string, ...args: string[]) =>
      exec(process.execPath, [script, ...args], {
        cwd: new URL("..", import.meta.url),
        env: process.env,
      });
    const lead = newLead();
    try {
      await cli("scripts/db.mts", "init");
      await cli("scripts/db.mts", "init");
      await cli("scripts/db.mts", "seed");
      await cli("scripts/db.mts", "seed");
      const seed = await getPool().query(
        "SELECT status,attempts,payload FROM renovation.leads WHERE request_id=$1",
        [seedId],
      );
      assert.equal(seed.rowCount, 1);
      if (!preexistingSeed.rowCount) {
        assert.equal(seed.rows[0].status, "pending");
        assert.equal(seed.rows[0].attempts, 0);
        assert.match(seed.rows[0].payload.comment, /Тестовая запись seed/);
      }
      const filename = join(folder, "lead.json");
      await writeFile(filename, JSON.stringify(lead));
      const created = await cli("scripts/leads.mts", "create", filename);
      assert.match(created.stdout, /No Telegram message sent/);
      const shown = await cli("scripts/leads.mts", "show", lead.requestId);
      assert.equal(JSON.parse(shown.stdout).payload.phone, lead.phone);
      await cli(
        "scripts/leads.mts",
        "update",
        lead.requestId,
        "Contact scheduled in test",
      );
      const updated = await cli("scripts/leads.mts", "show", lead.requestId);
      assert.equal(
        JSON.parse(updated.stdout).staff_note,
        "Contact scheduled in test",
      );
      await assert.rejects(cli("scripts/leads.mts", "delete", lead.requestId));
      await cli("scripts/leads.mts", "delete", lead.requestId, "--confirm");
      const gone = await getPool().query(
        "SELECT request_id FROM renovation.leads WHERE request_id=$1",
        [lead.requestId],
      );
      assert.equal(gone.rowCount, 0);
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  },
);
