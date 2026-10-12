"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/lib/site";
const photos = [
  {
    src: "/photos/hero.webp",
    alt: "Гостиная с деревянными панелями и зоной для телевизора",
  },
  { src: "/photos/after.webp", alt: "Кухня после ремонта" },
  { src: "/photos/bedroom.webp", alt: "Спальня после ремонта" },
  { src: "/photos/living.webp", alt: "Меблированная гостиная" },
  { src: "/photos/bathroom.webp", alt: "Санузел с обновлённой отделкой" },
];
export function ProjectGallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(0);
  function show(index: number) {
    setSelected(index);
    dialog.current?.showModal();
  }
  function move(by: number) {
    setSelected((current) => (current + by + photos.length) % photos.length);
  }
  return (
    <>
      <div className="project-gallery">
        {photos.map((photo, index) => (
          <button
            className="gallery-tile"
            key={photo.src}
            onClick={() => show(index)}
            aria-label={`Открыть фото: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={index === 0 ? 1200 : 900}
              height={index === 0 ? 900 : 1200}
              sizes={
                index === 0
                  ? "(max-width: 767px) 100vw, 60vw"
                  : "(max-width: 767px) 50vw, 35vw"
              }
            />
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-label={`Фотографии квартиры ${site.project.area} м²`}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") move(-1);
          if (e.key === "ArrowRight") move(1);
        }}
      >
        <div className="gallery-modal">
          <button
            className="icon-button gallery-close"
            aria-label="Закрыть галерею"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
          <Image
            src={photos[selected].src}
            alt={photos[selected].alt}
            loading="eager"
            width={selected === 0 ? 1200 : 900}
            height={selected === 0 ? 900 : 1200}
            sizes="95vw"
          />
          <div className="gallery-controls">
            <button
              className="icon-button"
              aria-label="Предыдущее фото"
              onClick={() => move(-1)}
            >
              ←
            </button>
            <p>
              {photos[selected].alt}
              <span>
                {selected + 1} / {photos.length}
              </span>
            </p>
            <button
              className="icon-button"
              aria-label="Следующее фото"
              onClick={() => move(1)}
            >
              →
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
