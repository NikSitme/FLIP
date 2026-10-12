import Link from "next/link";
import { navigation, site } from "@/lib/site";
import { LeadButton } from "@/components/LeadForm";
export function TelegramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m21 4-3.6 16-5.6-4.2-3 2.4.6-5L18 6.7l-11 5L3 10.4 21 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Link className="wordmark" href="/">
            РЕМОНТ<span>.</span>
            <small>Квартиры под ключ</small>
          </Link>
          <a className="footer-phone" href={site.phoneHref}>
            {site.phone}
          </a>
          <div className="footer-contact">
            {site.telegram ? (
              <a
                href={site.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                <TelegramIcon />
                Telegram ↗
              </a>
            ) : (
              <LeadButton intent="meeting" className="text-link">
                <TelegramIcon />
                Связаться
              </LeadButton>
            )}
            <span>{site.city}</span>
          </div>
        </div>
        <div className="footer-middle">
          <p>
            Полный ремонт квартир от {site.minimumArea} м².
            <br />
            Работы без предоплаты, оплата по этапам.
          </p>
          <nav aria-label="Навигация в подвале">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ремонт квартир</span>
          <Link href="/privacy">Политика обработки данных</Link>
          <Link href="/consent">Согласие на обработку данных</Link>
        </div>
      </div>
    </footer>
  );
}
