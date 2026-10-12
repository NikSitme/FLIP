import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import {
  ContactSection,
  Process,
  ServicesList,
} from "@/components/ContentSections";
import { LeadButton } from "@/components/LeadForm";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  title: "Услуги по ремонту квартир под ключ",
  description:
    "Полный ремонт квартиры в Санкт-Петербурге: электрика, сантехника, стены, полы и потолки. Дизайн-проект, перепланировка и комплектация по согласованию.",
};
export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Услуги"
        title="Весь ремонт. Один подрядчик."
        text="От состояния «нужен ремонт» до готовой квартиры. Состав работ обсуждаем на объекте и фиксируем в общей смете."
      />
      <section className="container services-page">
        <div className="scope-banner">
          <span className="eyebrow">Наш формат</span>
          <h2>
            Вся квартира.
            <br />
            От {site.minimumArea} м².
          </h2>
          <p>
            Новостройка с черновой или предчистовой отделкой, вторичная квартира
            — в Санкт-Петербурге. Отдельные комнаты и самостоятельные мелкие
            работы не берём.
          </p>
        </div>
        <ServicesList />
      </section>
      <section className="section container two-column">
        <div>
          <span className="eyebrow">Под ваш результат</span>
          <h2>
            Бюджетная отделка
            <br />
            или свой проект.
          </h2>
        </div>
        <div className="prose">
          <p>
            Практичный ремонт помогает подготовить квартиру к продаже без
            ненужных расходов. Подбираем отделку и материалы под задачу объекта.
          </p>
          <p>
            Если важен индивидуальный интерьер, обсудим дизайн-проект.
            Перепланировку, согласование, мебель и технику включаем в
            согласованный объём отдельно.
          </p>
          <LeadButton intent="meeting" className="button">
            Обсудить состав работ ↗
          </LeadButton>
        </div>
      </section>
      <Process />
      <ContactSection title="Что нужно вашей квартире?" />
    </>
  );
}
