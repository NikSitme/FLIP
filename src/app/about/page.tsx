import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/PageIntro";
import { ContactSection, Process } from "@/components/ContentSections";
export const metadata: Metadata = {
  title: "Наш подход к бюджетному ремонту",
  description:
    "Красивый ремонт квартиры в согласованном бюджете: один подрядчик, понятная смета, поэтапная оплата после выполнения работ. Санкт-Петербург.",
};
export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="Подход"
        title="Красиво — не значит избыточно."
        text="Помогаем подготовить квартиру к следующему этапу: продаже, сдаче или жизни. Наш фокус — разумный бюджет, качественная отделка и полный ремонт у одного подрядчика."
      />
      <section className="about-feature container">
        <Image
          src="/photos/living.webp"
          alt="Меблированная гостиная после ремонта"
          width={900}
          height={1200}
          sizes="(max-width: 767px) 100vw, 45vw"
        />
        <div>
          <span className="eyebrow">Наш принцип</span>
          <h2>
            Решения,
            <br />
            которые нужны
            <br />
            вашему объекту.
          </h2>
          <p>
            Для квартиры под продажу важно понимать расходы и получить
            привлекательный результат. Мы начинаем с задачи и состояния объекта,
            затем обсуждаем отделку и материалы под бюджет.
          </p>
          <p>
            Работаем со всей квартирой — от подготовки и коммуникаций до
            чистовой отделки. Дополнительные услуги, мебель и технику согласуем
            отдельно.
          </p>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Договорённости, а не догадки</span>
            <h2>На чём строится работа.</h2>
          </div>
        </div>
        <div className="benefit-grid">
          <article>
            <span className="row-number">01</span>
            <h3>Согласованная смета</h3>
            <p>
              Обсуждаем состав работ и стоимость всего объекта до начала
              ремонта.
            </p>
          </article>
          <article>
            <span className="row-number">02</span>
            <h3>Понятные этапы</h3>
            <p>
              Фиксируем этапы, срок и график оплаты в договоре. Предоплаты за
              работы нет.
            </p>
          </article>
          <article>
            <span className="row-number">03</span>
            <h3>Полный результат</h3>
            <p>
              Выполняем комплексный ремонт квартиры. Вы принимаете завершённые
              этапы.
            </p>
          </article>
        </div>
      </section>
      <Process />
      <ContactSection title="Начнём с разговора об объекте." />
    </>
  );
}
