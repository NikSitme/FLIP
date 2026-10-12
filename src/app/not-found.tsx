import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="eyebrow">404 / Страница не найдена</span>
      <h1>
        Здесь пока
        <br />
        ничего нет.
      </h1>
      <p>Начните с главной страницы или посмотрите услуги и цены.</p>
      <Link href="/" className="button">
        На главную ↗
      </Link>
    </section>
  );
}
