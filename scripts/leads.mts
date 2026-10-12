import { readFile } from "node:fs/promises";
import { createHmac } from "node:crypto";
import { getPool, closePool } from "../src/lib/db.mts";
import { validateLead, payloadHash, LeadError } from "../src/lib/lead-core.mts";
import { leadConfig, submitLead } from "../src/lib/leads.mts";

const [command, id, extra] = process.argv.slice(2);
class CommandError extends Error {}
function validId(value: string | undefined) {
  if (
    !value ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new CommandError("Supply an explicit valid UUID.");
  return value;
}
try {
  switch (command) {
    case "list": {
      const result = await getPool().query(
        "SELECT request_id,status,attempts,created_at,staff_note FROM renovation.leads ORDER BY created_at DESC LIMIT 100",
      );
      console.table(result.rows);
      break;
    }
    case "show": {
      const result = await getPool().query(
        "SELECT * FROM renovation.leads WHERE request_id=$1",
        [validId(id)],
      );
      if (!result.rowCount) throw new CommandError("Lead not found.");
      console.log(JSON.stringify(result.rows[0], null, 2));
      break;
    }
    case "create": {
      if (!id)
        throw new CommandError(
          "Supply a JSON filename with the same fields as the website form.",
        );
      const lead = validateLead(JSON.parse(await readFile(id, "utf8")));
      const secret = process.env.LEAD_HASH_SECRET;
      if (!secret || secret.length < 32)
        throw new CommandError(
          "Set LEAD_HASH_SECRET (at least 32 characters).",
        );
      await getPool().query(
        "INSERT INTO renovation.leads(request_id,payload,payload_hash,phone_hash) VALUES($1,$2,$3,$4)",
        [
          lead.requestId,
          lead,
          payloadHash(lead),
          createHmac("sha256", secret).update(lead.phone).digest("hex"),
        ],
      );
      console.log(
        `Created pending lead ${lead.requestId}. No Telegram message sent.`,
      );
      break;
    }
    case "update": {
      if (!extra || extra.length > 2000)
        throw new CommandError("Supply a staff note (1–2000 characters).");
      const result = await getPool().query(
        "UPDATE renovation.leads SET staff_note=$2,updated_at=now() WHERE request_id=$1 RETURNING request_id",
        [validId(id), extra],
      );
      if (!result.rowCount) throw new CommandError("Lead not found.");
      console.log(
        `Updated staff note for ${id}. Original submission preserved.`,
      );
      break;
    }
    case "delete": {
      if (extra !== "--confirm")
        throw new CommandError(
          "Deletion requires an explicit UUID followed by --confirm.",
        );
      const result = await getPool().query(
        "DELETE FROM renovation.leads WHERE request_id=$1 AND status <> 'sending' RETURNING request_id",
        [validId(id)],
      );
      if (!result.rowCount)
        throw new CommandError("Lead not found or delivery is in progress.");
      console.log(`Deleted ${id}.`);
      break;
    }
    case "retry": {
      leadConfig();
      const result = await getPool().query(
        "SELECT payload FROM renovation.leads WHERE request_id=$1",
        [validId(id)],
      );
      if (!result.rowCount) throw new CommandError("Lead not found.");
      await submitLead(validateLead(result.rows[0].payload));
      console.log(`Delivery confirmed for ${id}.`);
      break;
    }
    case "confirm-delivery": {
      const messageId = Number(extra);
      if (!Number.isSafeInteger(messageId) || messageId < 1)
        throw new CommandError(
          "After checking Telegram manually, supply the confirmed Telegram message ID.",
        );
      const result = await getPool().query(
        "UPDATE renovation.leads SET status='delivered',telegram_message_id=$2,delivered_at=now(),updated_at=now() WHERE request_id=$1 AND status IN ('sending','uncertain') RETURNING request_id",
        [validId(id), messageId],
      );
      if (!result.rowCount)
        throw new CommandError("No uncertain/sending lead with this UUID.");
      console.log(`Manually recorded confirmed delivery for ${id}.`);
      break;
    }
    default:
      throw new CommandError(
        'Use: leads list | show UUID | create FILE.json | update UUID "staff note" | delete UUID --confirm | retry UUID | confirm-delivery UUID TELEGRAM_MESSAGE_ID',
      );
  }
} catch (error) {
  const safe =
    error instanceof CommandError || error instanceof LeadError
      ? error.message
      : "Database operation failed. Check the connection and schema; no credentials printed.";
  // Raw pg errors may contain SQL details; connection errors might embed host configuration.
  console.error(
    safe.startsWith("connect ") ||
      safe.includes("postgres://") ||
      safe.includes("postgresql://")
      ? "Database unavailable."
      : safe,
  );
  process.exitCode = 1;
} finally {
  await closePool();
}
