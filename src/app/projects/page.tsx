import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ContactSection, ProjectPreview } from "@/components/ContentSections";
import { money, site } from "@/lib/site";
export const metadata: Metadata = {
  title: `Проекты: квартира ${site.project.area} м² до и после`,
  description: `Реальный ремонт двухкомнатной квартиры ${site.project.area} м² в Санкт-Петербурге. ${money(site.project.price)} ₽ с мебелью и техникой, ${site.project.durationMonths} месяца с меблировкой. Фотографии результата.`,
};
export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Проекты"
        title="Результат, который можно увидеть."
        text="Показываем реальную квартиру: фотографии, площадь, стоимость и срок. Так проще понять, какой результат обсудить для вашего объекта."
      />
      <ProjectPreview />
      <ContactSection title="Обсудим похожую задачу?" />
    </>
  );
}
