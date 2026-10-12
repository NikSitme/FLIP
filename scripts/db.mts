import { readFile } from "node:fs/promises";
import { getPool, closePool } from "../src/lib/db.mts";
import { createHmac } from "node:crypto";
import { validateLead, payloadHash } from "../src/lib/lead-core.mts";

const command = process.argv[2];
try {
  if (command !== "init" && command !== "seed")
    throw new Error(
      "Use: node --env-file-if-exists=.env scripts/db.mts init|seed",
    );
  const file = new URL(
    command === "init" ? "../sql/schema.sql" : "../sql/seed.sql",
    import.meta.url,
  );
  const sql = await readFile(file, "utf8");
  if (command === "init") await getPool().query(sql);
  else {
    const secret = process.env.LEAD_HASH_SECRET;
    if (!secret || secret.length < 32)
      throw new Error("LEAD_HASH_SECRET required for seed.");
    const lead = validateLead({
      requestId: "8eb73df9-cb90-48e3-81ab-e7c66d82a1e2",
      phone: "+79990000000",
      name: "Seed demo",
      area: 21,
      comment: "Тестовая запись seed, не отправлять клиенту",
      consent: true,
      intent: "estimate",
      source: "/__seed__",
    });
    await getPool().query(sql, [
      lead.requestId,
      lead,
      payloadHash(lead),
      createHmac("sha256", secret).update(lead.phone).digest("hex"),
    ]);
  }
  console.log(
    command === "init"
      ? "Renovation schema initialized without dropping existing data."
      : "Private demo lead seeded without sending Telegram messages; existing entries preserved.",
  );
} catch (error) {
  console.error(
    error instanceof Error && error.message.startsWith("Use:")
      ? error.message
      : "Database command failed. Check DATABASE_URL, PostgreSQL access and schema; credentials are not printed.",
  );
  process.exitCode = 1;
} finally {
  await closePool();
}
