"use client";
import Image from "next/image";
import { useId, useState } from "react";
export function BeforeAfter() {
  const [value, setValue] = useState(50);
  const id = useId();
  return (
    <div className="before-after">
      <div className="comparison-frame">
        <Image
          src="/photos/after.webp"
          alt="После ремонта: светлая кухня с новой отделкой и мебелью"
          width={900}
          height={1200}
          sizes="(max-width: 767px) 100vw, 85vw"
        />
        <div
          className="comparison-before"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <Image
            src="/photos/before.webp"
            alt="До ремонта: прежняя отделка и кухонный гарнитур"
            width={720}
            height={960}
            sizes="(max-width: 767px) 100vw, 85vw"
          />
        </div>
        <span className="comparison-label before-label">До</span>
        <span className="comparison-label after-label">После</span>
        <div
          className="comparison-line"
          style={{ left: `${value}%` }}
          aria-hidden="true"
        >
          <span>↔</span>
        </div>
        <input
          id={id}
          className="comparison-range"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Сравнить кухню до и после ремонта"
        />
      </div>
      <label className="comparison-caption" htmlFor={id}>
        Переместите разделитель, чтобы сравнить кухню до и после.
        <span aria-hidden="true">← →</span>
      </label>
    </div>
  );
}
