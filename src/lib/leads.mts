import { site } from "./site.ts";
import { createHmac } from "node:crypto";
import { getPool } from "./db.mts";
import {
  LeadError,
  payloadHash,
  retryDecision,
  sendTelegram,
  type Lead,
} from "./lead-core.mts";

export function leadConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const hashSecret = process.env.LEAD_HASH_SECRET;
  if (
    !process.env.DATABASE_URL ||
    !token ||
    !chatId ||
    !hashSecret ||
    hashSecret.length < 32
  ) {
    throw new LeadError(
      `Отправка заявок пока не настроена. Позвоните нам: ${site.phone}.`,
      503,
    );
  }
  return { token, chatId, hashSecret };
}

type StoredLead = {
  payload_hash: string;
  status: string;
  attempts: number;
  updated_at: Date;
};
export async function submitLead(lead: Lead) {
  const config = leadConfig();
  const hash = payloadHash(lead);
  const phoneHash = createHmac("sha256", config.hashSecret)
    .update(lead.phone)
    .digest("hex");
  const client = await getPool().connect();
  let claimed = false;
  try {
    await client.query("BEGIN");
    // Lock the UUID too, including simultaneous attempts that supply different phones for one ID.
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      ["renovation:request:" + lead.requestId],
    );
    // Serialize submissions for a phone; retries use the existing row and do not consume another quota.
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      ["renovation:phone:" + phoneHash],
    );
    const existing = await client.query<StoredLead>(
      "SELECT payload_hash, status, attempts, updated_at FROM renovation.leads WHERE request_id=$1 FOR UPDATE",
      [lead.requestId],
    );
    if (existing.rows[0]) {
      const row = existing.rows[0];
      if (retryDecision(row, hash) === "delivered") {
        await client.query("COMMIT");
        return;
      }
    } else {
      // Global minute limit is serialized independently of spoofable IP headers.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended('renovation:global-rate', 0))",
      );
      const rate = await client.query<{
        phone_count: string;
        minute_count: string;
      }>(
        `SELECT count(*) FILTER (WHERE phone_hash=$1 AND created_at > now()-interval '1 hour') AS phone_count,
                count(*) FILTER (WHERE created_at > now()-interval '1 minute') AS minute_count
         FROM renovation.leads WHERE created_at > now()-interval '1 hour'`,
        [phoneHash],
      );
      if (
        Number(rate.rows[0].phone_count) >= 3 ||
        Number(rate.rows[0].minute_count) >= 60
      )
        throw new LeadError(
          "Слишком много обращений. Попробуйте позже или позвоните нам.",
          429,
        );
      await client.query(
        "INSERT INTO renovation.leads(request_id,payload,payload_hash,phone_hash) VALUES($1,$2,$3,$4)",
        [lead.requestId, lead, hash, phoneHash],
      );
    }
    await client.query(
      "UPDATE renovation.leads SET status='sending', attempts=attempts+1, updated_at=now() WHERE request_id=$1",
      [lead.requestId],
    );
    // Commit the claim BEFORE contacting Telegram: a crash can never erase a possibly delivered attempt.
    await client.query("COMMIT");
    claimed = true;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  if (!claimed) return;
  const result = await sendTelegram(lead, config);
  await getPool().query(
    `UPDATE renovation.leads SET status=$2, telegram_message_id=$3,
     delivered_at=CASE WHEN $2='delivered' THEN now() ELSE NULL END, updated_at=now() WHERE request_id=$1 AND status='sending'`,
    [
      lead.requestId,
      result.status,
      result.status === "delivered" ? result.messageId : null,
    ],
  );
  if (result.status !== "delivered")
    throw new LeadError(
      result.status === "failed"
        ? "Telegram не принял заявку. Данные сохранены в форме; повторите отправку или позвоните нам."
        : `Не удалось подтвердить доставку. Чтобы избежать повторной заявки, позвоните нам: ${site.phone}.`,
      503,
    );
}
