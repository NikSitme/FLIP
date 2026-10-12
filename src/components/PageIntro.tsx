import Link from "next/link";
export function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <section className="page-intro container">
      <div className="eyebrow">
        <Link href="/">Главная</Link>
        <span aria-hidden="true">/</span>
        {eyebrow}
      </div>
      <h1>{title}</h1>
      {text && <p className="intro-text">{text}</p>}
    </section>
  );
}
