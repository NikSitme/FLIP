"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/lib/site";
import { LeadButton } from "@/components/LeadForm";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  function close() {
    menu.current?.close();
    setOpen(false);
  }
  useEffect(() => {
    menu.current?.close();
  }, [path]);
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link className="wordmark" href="/" aria-label="Ремонт — главная">
          РЕМОНТ<span>.</span>
          <small>{site.city}</small>
        </Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={path.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={site.phoneHref}>
            {site.phone}
          </a>
          <LeadButton intent="estimate" className="button button-small">
            Обсудить ремонт <span aria-hidden="true">↗</span>
          </LeadButton>
          <button
            className="menu-toggle"
            aria-label="Открыть меню"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              menu.current?.showModal();
              setOpen(true);
            }}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
      <dialog
        id="mobile-menu"
        className="mobile-menu"
        ref={menu}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="mobile-menu-inner">
          <div className="mobile-menu-top">
            <span className="wordmark">
              РЕМОНТ<span>.</span>
            </span>
            <button
              className="icon-button"
              aria-label="Закрыть меню"
              onClick={close}
            >
              ×
            </button>
          </div>
          <nav aria-label="Мобильная навигация">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={close}>
                {item.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
          <a className="mobile-phone" href={site.phoneHref}>
            {site.phone}
          </a>
          <p>
            Квартиры под ключ.
            <br />
            Санкт-Петербург.
          </p>
        </div>
      </dialog>
    </header>
  );
}
