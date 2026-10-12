import { createHash } from "node:crypto";
import { site } from "./site.ts";

export type Lead = {
  requestId: string;
  phone: string;
  name: string;
  area: number | null;
  comment: string;
  consent: true;
  intent: "estimate" | "measure" | "meeting";
  source: string;
  utm: Record<string, string>;
};
export class LeadError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status = 400, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function validateLead(input: unknown): Lead {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new LeadError("Некорректные данные заявки.");
  const data = input as Record<string, unknown>;
  if (data.website !== undefined && data.website !== "")
    throw new LeadError("Не удалось отправить заявку. Позвоните нам.", 400);
  const fields: Record<string, string> = {};
  const requestId =
    typeof data.requestId === "string" ? data.requestId.toLowerCase() : "";
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      requestId,
    )
  )
    fields.requestId = "Обновите страницу и попробуйте снова.";
  const rawPhone = typeof data.phone === "string" ? data.phone.trim() : "";
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) digits = "7" + digits;
  if (digits.startsWith("8") && digits.length === 11)
    digits = "7" + digits.slice(1);
  if (
    !/^[+\d\s().-]+$/.test(rawPhone) ||
    !/^7\d{10}$/.test(digits) ||
    rawPhone.length > 40
  )
    fields.phone = "Введите российский номер телефона: +7 и 10 цифр.";
  function optionalText(key: string, limit: number) {
    if (data[key] === undefined || data[key] === null) return "";
    if (typeof data[key] !== "string") {
      fields[key] = "Введите текст.";
      return "";
    }
    const value = (data[key] as string).trim();
    if (value.length > limit) fields[key] = `Не больше ${limit} символов.`;
    return value;
  }
  const name = optionalText("name", 100);
  const comment = optionalText("comment", 1000);
  let area: number | null = null;
  if (data.area !== undefined && data.area !== null && data.area !== "") {
    if (typeof data.area !== "number" && typeof data.area !== "string")
      fields.area = "Укажите площадь числом.";
    else {
      area =
        typeof data.area === "number"
          ? data.area
          : Number(data.area.replace(",", "."));
      if (!Number.isFinite(area) || area < site.minimumArea)
        fields.area = `Принимаем квартиры от ${site.minimumArea} м². Исправьте площадь или оставьте поле пустым.`;
    }
  }
  if (data.consent !== true)
    fields.consent = "Нужно согласие на обработку введённых данных.";
  if (!["estimate", "measure", "meeting"].includes(String(data.intent)))
    fields.intent = "Выберите цель обращения.";
  const source = optionalText("source", 500) || "/";
  if (
    !source.startsWith("/") ||
    source.startsWith("//") ||
    /[\r\n]/.test(source)
  )
    fields.source = "Некорректная страница обращения.";
  const utm: Record<string, string> = {};
  if (data.utm !== undefined) {
    if (!data.utm || typeof data.utm !== "object" || Array.isArray(data.utm))
      fields.utm = "Некорректные метки обращения.";
    else
      for (const key of [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
      ]) {
        const value = (data.utm as Record<string, unknown>)[key];
        if (value !== undefined) {
          if (typeof value !== "string" || value.length > 200)
            fields.utm = "Метка обращения слишком длинная.";
          else if (value.trim()) utm[key] = value.trim();
        }
      }
  }
  if (Object.keys(fields).length)
    throw new LeadError("Проверьте поля формы.", 400, fields);
  return {
    requestId,
    phone: "+" + digits,
    name,
    area,
    comment,
    consent: true,
    intent: data.intent as Lead["intent"],
    source,
    utm,
  };
}

export function payloadHash(lead: Lead) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        ...lead,
        utm: Object.fromEntries(Object.entries(lead.utm).sort()),
      }),
    )
    .digest("hex");
}

export function retryDecision(
  row: {
    payload_hash: string;
    status: string;
    attempts: number;
    updated_at: Date;
  },
  hash: string,
  now = Date.now(),
): "delivered" | "retry" {
  if (row.payload_hash !== hash)
    throw new LeadError(
      "Данные этой заявки изменились. Откройте форму заново.",
      409,
    );
  if (row.status === "delivered") return "delivered";
  if (row.status === "sending" || row.status === "uncertain")
    throw new LeadError(
      `Подтверждение доставки ещё не получено. Чтобы избежать повторной заявки, позвоните нам: ${site.phone}.`,
      503,
    );
  if (row.attempts >= 5)
    throw new LeadError(
      `Не удалось подтвердить доставку. Позвоните нам: ${site.phone}.`,
      503,
    );
  if (row.status === "failed" && now - row.updated_at.getTime() < 5000)
    throw new LeadError(
      "Подождите несколько секунд перед повторной отправкой.",
      429,
    );
  if (row.status !== "pending" && row.status !== "failed")
    throw new LeadError(
      "Не удалось подтвердить состояние заявки. Позвоните нам.",
      503,
    );
  return "retry";
}

export function telegramText(lead: Lead, date = new Date()) {
  const intent = {
    estimate: "Расчёт ремонта",
    measure: "Замер квартиры",
    meeting: "Встреча на объекте",
  }[lead.intent];
  return [
    "Новая заявка на ремонт",
    `ID: ${lead.requestId}`,
    `Время: ${date.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (Москва)`,
    `Цель: ${intent}`,
    `Телефон: ${lead.phone}`,
    lead.name && `Имя: ${lead.name}`,
    lead.area !== null && `Площадь: ${lead.area} м²`,
    lead.comment && `Комментарий: ${lead.comment}`,
    `Страница: ${lead.source}`,
    ...Object.entries(lead.utm).map(([key, value]) => `${key}: ${value}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export type TelegramResult =
  | { status: "delivered"; messageId: number }
  | { status: "failed" | "uncertain" };
export async function sendTelegram(
  lead: Lead,
  config: { token: string; chatId: string },
  fetcher: typeof fetch = fetch,
): Promise<TelegramResult> {
  try {
    const response = await fetcher(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: telegramText(lead),
          link_preview_options: { is_disabled: true },
        }),
        signal: AbortSignal.timeout(12000),
      },
    );
    const body = (await response.json()) as {
      ok?: boolean;
      result?: { message_id?: number };
      error_code?: number;
    };
    if (
      response.ok &&
      body.ok === true &&
      Number.isSafeInteger(body.result?.message_id)
    )
      return { status: "delivered", messageId: body.result!.message_id! };
    // Only a definite Telegram rejection is safe to retry. Transport/5xx outcomes might have delivered.
    if (
      body.ok === false &&
      response.status < 500 &&
      typeof body.error_code === "number"
    )
      return { status: "failed" };
    return { status: "uncertain" };
  } catch {
    return { status: "uncertain" };
  }
}
