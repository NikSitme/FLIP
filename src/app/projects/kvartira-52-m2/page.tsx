import type { Metadata } from "next";
import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ContactSection } from "@/components/ContentSections";
import { money, site } from "@/lib/site";
export const metadata: Metadata = {
  title: `Двухкомнатная квартира ${site.project.area} м² — ремонт за ${money(site.project.price)} ₽`,
  description: `Фотографии квартиры ${site.project.area} м² до и после ремонта. Стоимость конкретного объекта — ${money(site.project.price)} ₽ с мебелью и техникой, срок с меблировкой — ${site.project.durationMonths} месяца.`,
};
export default function ProjectPage() {
  return (
    <>
      <section className="page-intro container project-intro">
        <div className="eyebrow">
          <Link href="/projects">Проекты</Link>
          <span>/</span>Санкт-Петербург
        </div>
        <h1>
          {site.project.area} м².
          <br />
          Совсем другая квартира.
        </h1>
        <p className="intro-text">
          Полный ремонт двухкомнатной квартиры с мебелью и техникой. От прежней
          отделки — к светлому интерьеру.
        </p>
        <dl className="case-facts">
          <div>
            <dt>Площадь квартиры</dt>
            <dd>{site.project.area} м²</dd>
          </div>
          <div>
            <dt>С мебелью и техникой</dt>
            <dd>{money(site.project.price)} ₽</dd>
          </div>
          <div>
            <dt>Срок с меблировкой</dt>
            <dd>{site.project.durationMonths} месяца</dd>
          </div>
        </dl>
      </section>
      <section className="container">
        <BeforeAfter />
        <p className="small-note section-note">
          До и после: кухня одного объекта. Сравните отделку, мебель и внешний
          вид помещения.
        </p>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Детали результата</span>
            <h2>Посмотрите ближе.</h2>
          </div>
          <p>
            Фотографии готовой квартиры.
            <br />
            Нажмите на кадр, чтобы увеличить.
          </p>
        </div>
        <ProjectGallery />
      </section>
      <section className="case-note container">
        <span className="eyebrow">О стоимости и сроке</span>
        <p>
          {money(site.project.price)} ₽ и {site.project.durationMonths} месяца — показатели конкретного объекта {site.project.area} м², включая
          мебель, технику и меблировку. Стоимость вашей квартиры зависит от
          состояния и согласованного состава ремонта.
        </p>
        <p>
          Наше общее предложение для двухкомнатной квартиры — ремонт за {site.durationMonths}
          месяца. Состав, срок и стоимость фиксируем в договоре.
        </p>
      </section>
      <ContactSection title="У вашей квартиры своя задача." />
    </>
  );
}
