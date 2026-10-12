import Image from "next/image";
import Link from "next/link";
import { LeadButton } from "@/components/LeadForm";
import {
  ContactSection,
  FAQ,
  PriceOptions,
  Process,
  ProjectPreview,
  ServicesList,
} from "@/components/ContentSections";
import { money, site } from "@/lib/site";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <i className="status-dot" />
            {site.city} / Квартиры под ключ
          </span>
          <h1>
            Красивый ремонт.
            <br />
            Разумный <span className="accent-word">бюджет.</span>
          </h1>
          <p className="hero-description">
            Подготовьте квартиру к продаже без лишних расходов. Берём на себя
            весь ремонт — от черновых работ до чистовой отделки.
          </p>
          <div className="hero-cta">
            <LeadButton intent="estimate" className="button">
              Рассчитать ремонт <span aria-hidden="true">↗</span>
            </LeadButton>
            <Link href="/projects" className="text-link">
              Посмотреть результат <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="hero-price">
            <strong>
              от {money(site.prices.basic)} <span>₽/м²</span>
            </strong>
            <p>
              За работы · от {site.minimumArea} м²
              <br />
              Материалы отдельно
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/photos/hero.webp"
            alt="Результат ремонта: светлая гостиная с деревянными панелями и телевизором"
            width={1200}
            height={900}
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
          />
          <span className="hero-photo-caption">Наш проект / {site.project.area} м²</span>
          <div className="hero-seal">
            <span>
              Двухкомнатная
              <br />
              квартира за
            </span>
            <strong>{site.durationMonths}</strong>
            <span>месяца</span>
          </div>
        </div>
      </section>
      <div className="promise-strip">
        <div className="container">
          <p>
            <span aria-hidden="true">↗</span>Вся квартира под ключ
          </p>
          <p>
            <span aria-hidden="true">↗</span>Без предоплаты за работы
          </p>
          <p>
            <span aria-hidden="true">↗</span>Оплата после каждого этапа
          </p>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Для квартир с новой задачей</span>
            <h2>
              Чтобы ремонт
              <br />
              работал на ваш объект.
            </h2>
          </div>
          <p>
            Купили квартиру для перепродажи?
            <br />
            Начнём с понятного бюджета и решений,
            <br />
            которые нужны именно вашему объекту.
          </p>
        </div>
        <div className="benefit-grid">
          <article>
            <span className="benefit-icon" aria-hidden="true">
              ₽
            </span>
            <h3>
              Расходы понятны
              <br />
              до начала работ
            </h3>
            <p>
              Согласуем смету на всю квартиру. Поможем учесть ремонт в расходах
              на подготовку к продаже.
            </p>
          </article>
          <article>
            <span className="benefit-icon" aria-hidden="true">
              ↗
            </span>
            <h3>
              Красиво
              <br />в пределах бюджета
            </h3>
            <p>
              Подбираем отделку и материалы под задачу. Дизайн-проект можно
              заказать отдельно.
            </p>
          </article>
          <article>
            <span className="benefit-icon" aria-hidden="true">
              ◎
            </span>
            <h3>
              Один подрядчик
              <br />
              на весь ремонт
            </h3>
            <p>
              Стены, полы, потолки и коммуникации — в одной смете. Этапы и
              оплату согласуем в договоре.
            </p>
          </article>
        </div>
      </section>
      <ProjectPreview />
      <section className="section prices-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Выберите подход</span>
              <h2>
                Цена открыта.
                <br />
                Детали обсудим.
              </h2>
            </div>
            <Link href="/prices" className="text-link">
              Что входит в стоимость ↗
            </Link>
          </div>
          <PriceOptions />
          <div className="price-note">
            <strong>
              От {money(site.minimumArea * site.prices.basic)} ₽ за работы
            </strong>
            <p>
              Стартовый ориентир для квартиры {site.minimumArea} м². Материалы и
              дополнительные услуги отдельно. Итоговая смета — после замера.
            </p>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">От подготовки до отделки</span>
            <h2>
              Берём на себя
              <br />
              весь объём.
            </h2>
          </div>
          <Link href="/services" className="text-link">
            Все услуги ↗
          </Link>
        </div>
        <ServicesList compact />
        <p className="small-note section-note">
          Новостройки с черновой или предчистовой отделкой и вторичные квартиры.
          Санкт-Петербург. Только полный ремонт от {site.minimumArea} м².
        </p>
      </section>
      <Process />
      <FAQ />
      <ContactSection />
    </>
  );
}
