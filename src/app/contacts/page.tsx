import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { LeadButton, LeadForm } from "@/components/LeadForm";
import { TelegramIcon } from "@/components/SiteFooter";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  title: "Контакты и заявка на замер",
  description: `Обсудите ремонт квартиры в Санкт-Петербурге: ${site.phone}. Оставьте заявку на расчёт, замер или встречу на объекте.`,
};
export default function ContactsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Контакты"
        title="Поговорим о вашей квартире."
        text="Позвоните или оставьте заявку. Обсудим задачу, договоримся о встрече на объекте и подготовим смету."
      />
      <section className="container contacts-page">
        <div className="contact-details">
          <div className="contact-detail">
            <span className="eyebrow">Позвонить</span>
            <a className="contact-phone" href={site.phoneHref}>
              {site.phone}
            </a>
          </div>
          <div className="contact-detail">
            <span className="eyebrow">Написать</span>
            {site.telegram ? (
              <a
                className="text-link"
                href={site.telegram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TelegramIcon />
                Написать в Telegram ↗
              </a>
            ) : (
              <>
                <LeadButton intent="meeting" className="text-link">
                  <TelegramIcon />
                  Оставить контакт для связи ↗
                </LeadButton>
                <p className="small-note">
                  Можно оставить заявку или позвонить нам.
                </p>
              </>
            )}
            <a className="contact-email" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            {site.email === "hello@example.com" && (
              <p className="small-note">
                Временная почта. Для обращения используйте телефон или форму.
              </p>
            )}
          </div>
          <div className="contact-detail">
            <span className="eyebrow">Где работаем</span>
            <h2>{site.city}</h2>
            <p>
              Квартиры от {site.minimumArea} м². Полный ремонт всей квартиры —
              новостройки и вторичное жильё.
            </p>
            <LeadButton intent="measure" className="button measure-button">
              Записаться на замер ↗
            </LeadButton>
          </div>
        </div>
        <div className="form-panel">
          <h2>Оставить заявку</h2>
          <p className="form-intro">
            Телефона достаточно, чтобы начать разговор. Остальное заполните,
            если удобно.
          </p>
          <LeadForm intent="meeting" />
        </div>
      </section>
    </>
  );
}
