import test from "node:test";
import assert from "node:assert/strict";
import {
  validateLead,
  payloadHash,
  retryDecision,
  sendTelegram,
  telegramText,
  LeadError,
} from "../src/lib/lead-core.mts";

const input = {
  requestId: "14f28dbd-6130-44c3-beb7-f3b1aa81bf2b",
  phone: "+7 (999) 202-79-99",
  consent: true,
  intent: "estimate",
  source: "/prices",
};
const lead = validateLead(input);
const config = { token: "unit-test-only", chatId: "unit-test-chat" };
function failureStatus(fn: () => unknown, expected: number) {
  assert.throws(
    fn,
    (error) => error instanceof LeadError && error.status === expected,
  );
}

test("normalizes Russian phones and preserves optional unknown area", () => {
  assert.equal(lead.phone, "+79992027999");
  assert.equal(lead.area, null);
  assert.equal(
    validateLead({ ...input, phone: "8 999 202 7999", area: "21" }).area,
    21,
  );
  assert.equal(
    validateLead({ ...input, phone: "9992027999", area: "21,5" }).area,
    21.5,
  );
});
test("rejects invalid consent, under-minimum area, overlong comments, non-numeric phones and honeypot", () => {
  for (const changes of [
    { consent: false },
    { area: 20.9 },
    { area: "NaN" },
    { comment: "x".repeat(1001) },
    { phone: "abc79992027999" },
    { website: "spam" },
    { requestId: "bad" },
    { source: "//evil.example" },
  ]) {
    failureStatus(() => validateLead({ ...input, ...changes }), 400);
  }
});
test("hash is stable across UTM key order and changes with edited payload", () => {
  const a = validateLead({
    ...input,
    utm: { utm_source: "source", utm_campaign: "campaign" },
  });
  const b = validateLead({
    ...input,
    utm: { utm_campaign: "campaign", utm_source: "source" },
  });
  assert.equal(payloadHash(a), payloadHash(b));
  assert.notEqual(payloadHash(a), payloadHash({ ...a, comment: "edited" }));
});
test("delivered same-ID retry succeeds without new send; edits conflict and uncertain attempts cannot resend", () => {
  const row = {
    payload_hash: "same",
    status: "delivered",
    attempts: 1,
    updated_at: new Date(0),
  };
  assert.equal(retryDecision(row, "same"), "delivered");
  failureStatus(() => retryDecision(row, "different"), 409);
  for (const status of ["sending", "uncertain"])
    failureStatus(() => retryDecision({ ...row, status }, "same"), 503);
  assert.equal(retryDecision({ ...row, status: "failed" }, "same"), "retry");
  failureStatus(
    () =>
      retryDecision(
        { ...row, status: "failed", updated_at: new Date() },
        "same",
      ),
    429,
  );
  failureStatus(
    () => retryDecision({ ...row, status: "failed", attempts: 5 }, "same"),
    503,
  );
});
test("message contains real context and Moscow date without HTML parsing", () => {
  const text = telegramText(
    { ...lead, name: "<test>", area: 21 },
    new Date("2026-01-01T00:00:00Z"),
  );
  assert.match(text, /03:00:00/);
  assert.match(text, /Площадь: 21 м²/);
  assert.match(text, /<test>/);
  assert.match(text, /Страница: \/prices/);
});
test("Telegram confirms success only with explicit message ID; known rejections remain retryable", async () => {
  const fake = (status: number, body: unknown) =>
    (async (_url: unknown, init?: RequestInit) => {
      const sent = JSON.parse(init?.body as string);
      assert.equal(sent.chat_id, config.chatId);
      assert.equal(sent.parse_mode, undefined);
      return new Response(JSON.stringify(body), { status });
    }) as typeof fetch;
  assert.deepEqual(
    await sendTelegram(
      lead,
      config,
      fake(200, { ok: true, result: { message_id: 42 } }),
    ),
    { status: "delivered", messageId: 42 },
  );
  assert.deepEqual(
    await sendTelegram(lead, config, fake(400, { ok: false, error_code: 400 })),
    { status: "failed" },
  );
  for (const [status, body] of [
    [500, { ok: false, error_code: 500 }],
    [200, { ok: true }],
    [200, { ok: false }],
  ] as const)
    assert.deepEqual(await sendTelegram(lead, config, fake(status, body)), {
      status: "uncertain",
    });
});
test("transport loss and unreadable Telegram response remain uncertain", async () => {
  const offline = (async () => {
    throw new Error("network lost");
  }) as typeof fetch;
  const malformed = (async () =>
    new Response("<html>proxy</html>")) as typeof fetch;
  assert.deepEqual(await sendTelegram(lead, config, offline), {
    status: "uncertain",
  });
  assert.deepEqual(await sendTelegram(lead, config, malformed), {
    status: "uncertain",
  });
});
