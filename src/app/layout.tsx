import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeadProvider } from "@/components/LeadForm";
import { money, site } from "@/lib/site";
export const metadata: Metadata = {
  title: {
    default: "Ремонт квартир под ключ в Санкт-Петербурге",
    template: `%s · ${site.name}`,
  },
  description: `Полный ремонт квартир в Санкт-Петербурге от ${money(site.prices.basic)} ₽/м² за работы. От ${site.minimumArea} м². Без предоплаты за работы, оплата по этапам. Заявка на расчёт и замер.`,
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main">
          Перейти к содержимому
        </a>
        <LeadProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </LeadProvider>
      </body>
    </html>
  );
}
