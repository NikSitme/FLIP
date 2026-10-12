import Link from "next/link";
import { LeadButton, LeadForm } from "@/components/LeadForm";
import { money, questions, services, site, steps } from "@/lib/site";
import Image from "next/image";
export function PriceOptions() {
  return (
    <div className="price-options">
      <article id="basic" className="price-option">
        <span className="eyebrow">01 / Практичный ремонт</span>
        <h3>
          Красиво.
          <br />В пределах бюджета.
        </h3>
        <div className="price">
          от {money(site.prices.basic)} <span>₽/м²</span>
        </div>
        <p>
          Работы по полному ремонту квартиры. Решения и материалы под вашу
          задачу.
        </p>
        <LeadButton intent="estimate" context="basic" className="text-link">
          Рассчитать ремонт <span aria-hidden="true">↗</span>
        </LeadButton>
      </article>
      <article id="designed" className="price-option">
        <span className="eyebrow">02 / Индивидуальный интерьер</span>
        <h3>
          Ремонт
          <br />
          по дизайн-проекту.
        </h3>
        <div className="price">
          от {money(site.prices.designed)} <span>₽/м²</span>
        </div>
        <p>
          Ремонтные работы по проекту. Сам проект и материалы оплачиваются
          отдельно.
        </p>
        <LeadButton intent="estimate" context="designed" className="text-link">
          Обсудить проект <span aria-hidden="true">↗</span>
        </LeadButton>
      </article>
      <article id="design" className="price-option design-option">
        <span className="eyebrow">03 / Дизайн-проект</span>
        <h3>
          Сначала
          <br />
          продумать детали.
        </h3>
        <div className="price">
          от {money(site.prices.design)} <span>₽/м²</span>
        </div>
        <p>
          Разработка дизайн-проекта. Отдельная услуга, не стоимость ремонта.
        </p>
        <LeadButton intent="meeting" context="design" className="text-link">
          Обсудить дизайн <span aria-hidden="true">↗</span>
        </LeadButton>
      </article>
    </div>
  );
}
export function ServicesList({ compact = false }: { compact?: boolean }) {
  return (
    <div className="services-list">
      {services.slice(0, compact ? 3 : undefined).map((item, i) => (
        <article className="service-row" key={item.title}>
          <span className="row-number">0{i + 1}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <span className="row-plus" aria-hidden="true">
            +
          </span>
        </article>
      ))}
    </div>
  );
}
export function Process() {
  return (
    <section className="section process-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">От первого звонка до приёмки</span>
            <h2>
              Понятный план.
              <br />
              На каждом этапе.
            </h2>
          </div>
          <p>
            Сначала согласуем смету и договор.
            <br />
            Работы оплачиваете после завершения этапов.
          </p>
        </div>
        <ol className="process-list">
          {steps.map((step, i) => (
            <li key={step.title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
export function FAQ() {
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Без мелкого шрифта</span>
          <h2>До первого звонка.</h2>
        </div>
        <p>
          Ответы на вопросы о цене,
          <br />
          сроках и формате работ.
        </p>
      </div>
      <div className="faq-list">
        {questions.map((question) => (
          <details key={question.title}>
            <summary>
              {question.title}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{question.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
export function ContactSection({
  title = "Начнём с вашей квартиры.",
}: {
  title?: string;
}) {
  return (
    <section className="contact-section section">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow">Расчёт • Замер • Встреча</span>
          <h2>{title}</h2>
          <p className="contact-text">
            Оставьте телефон — обсудим объект, договоримся о встрече и
            подготовим смету.
          </p>
          <a className="contact-phone" href={site.phoneHref}>
            {site.phone}
          </a>
          <p className="small-note">
            Санкт-Петербург · Вся квартира от {site.minimumArea} м²
            <br />
            Без предоплаты за работы. Материалы отдельно.
          </p>
          <div className="contact-orbit" aria-hidden="true">
            <span>↗</span>
          </div>
        </div>
        <div className="form-panel">
          <h3>Обсудить ремонт</h3>
          <LeadForm intent="estimate" />
        </div>
      </div>
    </section>
  );
}
export function ProjectPreview() {
  return (
    <section className="section project-section container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Вместо обещаний — результат</span>
          <h2>
            Одна квартира.
            <br />
            Большая перемена.
          </h2>
        </div>
        <Link className="text-link" href="/projects">
          Наши проекты <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <Link className="project-preview" href="/projects/kvartira-52-m2">
        <div className="project-photo">
          <Image
            src="/photos/after.webp"
            alt={`Обновлённая кухня в квартире ${site.project.area} м²`}
            width={900}
            height={1200}
            sizes="(max-width: 767px) 100vw, 65vw"
          />
          <span className="photo-tag">Реальный проект</span>
          <span className="project-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="project-summary">
          <span className="eyebrow">Санкт-Петербург / Двухкомнатная</span>
          <h3>
            Готова к следующей
            <br />
            главе.
          </h3>
          <dl className="project-facts">
            <div>
              <dt>Площадь</dt>
              <dd>{site.project.area} м²</dd>
            </div>
            <div>
              <dt>С мебелью и техникой</dt>
              <dd>{money(site.project.price)} ₽</dd>
            </div>
            <div>
              <dt>Ремонт с меблировкой</dt>
              <dd>{site.project.durationMonths} месяца</dd>
            </div>
          </dl>
          <span className="text-link">Посмотреть проект ↗</span>
        </div>
      </Link>
      <p className="small-note project-note">
        Стоимость и срок этого объекта — пример конкретного ремонта. Общее
        предложение для двухкомнатной квартиры — {site.durationMonths} месяца.
      </p>
    </section>
  );
}
