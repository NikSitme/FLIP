import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import {
  ContactSection,
  FAQ,
  PriceOptions,
} from "@/components/ContentSections";
import { money, site } from "@/lib/site";
export const metadata: Metadata = {
  title: `Цены на ремонт: работы от ${money(site.prices.basic)} ₽/м²`,
  description: `Базовые работы от ${money(site.prices.basic)} ₽/м², ремонт по дизайн-проекту от ${money(site.prices.designed)} ₽/м², дизайн-проект от ${money(site.prices.design)} ₽/м². Материалы отдельно. Квартиры от ${site.minimumArea} м².`,
};
export default function PricesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Цены"
        title="Понятная отправная точка."
        text="Стартовые цены помогают оценить порядок расходов. Финальный состав и стоимость ремонта согласуем после встречи и замера."
      />
      <section className="container prices-page">
        <PriceOptions />
        <div className="budget-start">
          <span className="eyebrow">
            Минимальный объект — {site.minimumArea} м²
          </span>
          <h2>
            От {money(site.minimumArea * site.prices.basic)} ₽<br />
            <span>за работы.</span>
          </h2>
          <p>
            {site.minimumArea} м² × {money(site.prices.basic)} ₽/м². Это
            стартовый ориентир базовых работ, а не цена всей квартиры с
            материалами.
          </p>
        </div>
        <div className="cost-breakdown">
          <article>
            <span className="eyebrow">В цене за метр</span>
            <h3>Ремонтные работы</h3>
            <p>
              Согласованный комплекс работ на всей квартире: подготовка,
              инженерные работы и отделка. Конкретный состав — в смете.
            </p>
          </article>
          <article>
            <span className="eyebrow">Отдельный бюджет</span>
            <h3>Материалы и дополнения</h3>
            <p>
              Черновые и чистовые материалы, разработка дизайн-проекта, мебель и
              техника оплачиваются отдельно. Объём определим для вашего объекта.
            </p>
          </article>
        </div>
      </section>
      <section className="payment-band">
        <div className="container">
          <span className="eyebrow">Порядок оплаты</span>
          <h2>Работы — без предоплаты.</h2>
          <p>
            Принимаете завершённый этап, затем оплачиваете работы. Этапы и
            график оплаты согласуем в договоре.
          </p>
        </div>
      </section>
      <FAQ />
      <ContactSection title="От ориентира — к вашей смете." />
    </>
  );
}
