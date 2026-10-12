import { site } from "@/lib/site";
import { LeadError, validateLead } from "@/lib/lead-core.mts";
import { submitLead } from "@/lib/leads.mts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function boundedJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new LeadError("Заявка не содержит данных.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 16384) {
      await reader.cancel();
      throw new LeadError("Заявка слишком большая.", 413);
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    throw new LeadError("Не удалось прочитать данные заявки.");
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const expected = new URL(process.env.SITE_URL || request.url).origin;
    if (!origin || origin !== expected)
      throw new LeadError("Отправьте заявку через форму на сайте.", 403);
    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("application/json")
    )
      throw new LeadError("Некорректный формат заявки.", 415);
    const lead = validateLead(await boundedJson(request));
    await submitLead(lead);
    return Response.json(
      { ok: true, requestId: lead.requestId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof LeadError)
      return Response.json(
        {
          ok: false,
          error: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    // Do not log request bodies, database URLs or Telegram token-bearing error objects.
    console.error(
      "Lead submission failed: database or delivery storage unavailable.",
    );
    return Response.json(
      {
        ok: false,
        error: `Не удалось отправить заявку. Данные сохранены в форме; попробуйте позже или позвоните ${site.phone}.`,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
