"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";

type Intent = "estimate" | "measure" | "meeting";
type Fields = Record<string, string>;
const titles: Record<Intent, string> = {
  estimate: "Рассчитаем ваш ремонт",
  measure: "Начнём с замера квартиры",
  meeting: "Встретимся на вашем объекте",
};
const LeadContext = createContext<
  ((intent: Intent, context?: string) => void) | null
>(null);

// The course VPS uses HTTP. randomUUID is restricted to secure contexts;
// getRandomValues remains available and provides the same random v4 identifier.
function newRequestId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function captureUtm(): Record<string, string> {
  const result: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ]) {
    const value = params.get(key);
    if (value) result[key] = value.slice(0, 200);
  }
  try {
    if (Object.keys(result).length)
      sessionStorage.setItem("renovation-utm", JSON.stringify(result));
    else return JSON.parse(sessionStorage.getItem("renovation-utm") || "{}");
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return result;
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [intent, setIntent] = useState<Intent>("estimate");
  const [source, setSource] = useState("/");
  const titleId = useId();
  useEffect(() => {
    captureUtm();
  }, []);
  function open(next: Intent, context?: string) {
    setIntent(next);
    setSource(
      window.location.pathname +
        (context ? `#${encodeURIComponent(context)}` : ""),
    );
    captureUtm();
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
  }
  function close() {
    dialog.current?.close();
    document.body.style.overflow = "";
  }
  return (
    <LeadContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className="lead-dialog"
        aria-labelledby={titleId}
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
      >
        <div className="lead-dialog-body">
          <button
            type="button"
            className="dialog-close"
            aria-label="Закрыть форму"
            onClick={close}
          >
            ×
          </button>
          <p className="eyebrow">Первый шаг к готовой квартире</p>
          <h2 id={titleId}>{titles[intent]}</h2>
          <p className="form-intro">
            Оставьте телефон. Обсудим объект, состав ремонта и договоримся о
            следующем шаге.
          </p>
          <LeadForm
            key={`${intent}:${source}`}
            intent={intent}
            source={source}
          />
        </div>
      </dialog>
    </LeadContext.Provider>
  );
}

export function LeadButton({
  children,
  intent = "estimate",
  context,
  className = "button button-primary",
}: {
  children: ReactNode;
  intent?: Intent;
  context?: string;
  className?: string;
}) {
  const open = useContext(LeadContext);
  return (
    <button
      type="button"
      className={className}
      onClick={() => open?.(intent, context)}
    >
      {children}
    </button>
  );
}

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 10 && !value.trim().startsWith("+"))
    digits = "7" + digits;
  else if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7") && digits.length) digits = "7" + digits;
  digits = digits.slice(0, 11);
  if (!digits.length) return "";
  let formatted = "+7";
  if (digits.length > 1) formatted += " (" + digits.slice(1, 4);
  if (digits.length >= 4) formatted += ")";
  if (digits.length > 4) formatted += " " + digits.slice(4, 7);
  if (digits.length > 7) formatted += "-" + digits.slice(7, 9);
  if (digits.length > 9) formatted += "-" + digits.slice(9, 11);
  return formatted;
}

export function LeadForm({
  intent = "estimate",
  source,
}: {
  intent?: Intent;
  source?: string;
}) {
  const path = usePathname();
  const id = useId();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [fields, setFields] = useState<Fields>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const utm = useRef<Record<string, string> | null>(null);
  function changed() {
    requestId.current = null;
    setError("");
    setFields({});
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const nextFields: Fields = {};
    if (!/^7\d{10}$/.test(phone.replace(/\D/g, "")))
      nextFields.phone = "Укажите российский номер из 11 цифр, начиная с +7.";
    if (
      area &&
      (!Number.isFinite(Number(area)) || Number(area) < site.minimumArea)
    )
      nextFields.area = `Берём в работу квартиры площадью от ${site.minimumArea} м².`;
    if (!consent) nextFields.consent = "Для отправки нужно ваше согласие.";
    setFields(nextFields);
    if (Object.keys(nextFields).length) {
      if (nextFields.phone) phoneInput.current?.focus();
      return;
    }
    requestId.current ??= newRequestId();
    utm.current ??= captureUtm();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          requestId: requestId.current,
          phone,
          name,
          area: area ? Number(area) : null,
          comment,
          consent,
          intent,
          source: source || path,
          utm: utm.current,
          website: new FormData(form).get("website") || "",
        }),
      });
      const body = await response.json();
      if (response.ok && body.ok === true) {
        setSuccess(requestId.current);
        return;
      }
      if (body.fields) setFields(body.fields);
      setError(
        typeof body.error === "string"
          ? body.error
          : "Не удалось подтвердить отправку. Попробуйте ещё раз или позвоните нам.",
      );
    } catch {
      setError(
        "Не удалось подтвердить отправку. Данные сохранены в форме — попробуйте ещё раз или позвоните нам.",
      );
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="form-success" role="status">
        <span className="success-mark" aria-hidden="true">
          ✓
        </span>
        <h3>Заявка отправлена</h3>
        <p>Свяжемся с вами, чтобы обсудить объект и договориться о встрече.</p>
        <p className="form-note">
          Ваш номер обращения: <span>{success.slice(0, 8)}</span>
        </p>
      </div>
    );
  const errorNode = (field: string) =>
    fields[field] ? (
      <span className="field-error" id={`${id}-${field}-error`}>
        {fields[field]}
      </span>
    ) : null;
  return (
    <form className="lead-form" onSubmit={submit} noValidate>
      <fieldset disabled={busy} className="form-fields">
        <div className="field-grid">
          <div className="form-field">
            <label htmlFor={`${id}-phone`}>
              Телефон <span aria-hidden="true">*</span>
            </label>
            <input
              ref={phoneInput}
              id={`${id}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+7 (999) 000-00-00"
              required
              value={phone}
              onChange={(e) => {
                changed();
                setPhone(formatPhone(e.target.value));
              }}
              aria-invalid={!!fields.phone}
              aria-describedby={fields.phone ? `${id}-phone-error` : undefined}
            />
            {errorNode("phone")}
          </div>
          <div className="form-field">
            <label htmlFor={`${id}-name`}>Как к вам обращаться</label>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="given-name"
              placeholder="Ваше имя"
              maxLength={80}
              value={name}
              onChange={(e) => {
                changed();
                setName(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-area`}>
            Площадь квартиры, м² <span className="optional">необязательно</span>
          </label>
          <input
            id={`${id}-area`}
            name="area"
            type="number"
            inputMode="decimal"
            min={site.minimumArea}
            step="0.1"
            placeholder="Например, 52"
            value={area}
            onChange={(e) => {
              changed();
              setArea(e.target.value);
            }}
            aria-invalid={!!fields.area}
            aria-describedby={`${id}-area-note${fields.area ? ` ${id}-area-error` : ""}`}
          />
          <span className="form-note" id={`${id}-area-note`}>
            Полный ремонт квартир от {site.minimumArea} м² в Санкт-Петербурге.
          </span>
          {errorNode("area")}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-comment`}>
            Расскажите об объекте{" "}
            <span className="optional">необязательно</span>
          </label>
          <textarea
            id={`${id}-comment`}
            name="comment"
            rows={3}
            maxLength={1000}
            placeholder="Новостройка или вторичка? Что хотите обсудить?"
            value={comment}
            onChange={(e) => {
              changed();
              setComment(e.target.value);
            }}
          />
        </div>
        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Ваш сайт</label>
          <input
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <label className="consent-label">
          <input
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              changed();
              setConsent(e.target.checked);
            }}
            required
            aria-invalid={!!fields.consent}
            aria-describedby={
              fields.consent ? `${id}-consent-error` : undefined
            }
          />
          <span>
            Даю{" "}
            <Link href="/consent" target="_blank">
              согласие на обработку данных
            </Link>{" "}
            и ознакомлен(а) с{" "}
            <Link href="/privacy" target="_blank">
              политикой
            </Link>
            .
          </span>
        </label>
        {errorNode("consent")}
        <button type="submit" className="button button-primary form-submit">
          {busy
            ? "Отправляем заявку…"
            : intent === "measure"
              ? "Записаться на замер"
              : intent === "meeting"
                ? "Договориться о встрече"
                : "Получить расчёт ремонта"}
          <span aria-hidden="true">↗</span>
        </button>
      </fieldset>
      {error && (
        <div className="form-error" role="alert">
          <p>{error}</p>
          <a href={site.phoneHref}>Позвонить: {site.phone}</a>
        </div>
      )}
      <p className="form-note">
        Итоговую смету подготовим после обсуждения и замера. Отправка заявки ни
        к чему не обязывает.
      </p>
    </form>
  );
}
