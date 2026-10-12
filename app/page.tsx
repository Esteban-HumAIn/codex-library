"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { type Book, type Topic } from "@/lib/data";
import BookDetailModal from "@/components/BookDetailModal";
import { generateCoffeeCoupon } from "@/components/CoffeeCoupon";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function Page() {
  const [selected, setSelected] = useState<{ topic: Topic; book: Book } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <div className="stage">
        <Scene onSelect={setSelected} isMobile={isMobile} />
      </div>

      <div className="overlay">
        <header className="plaque plaque--glass" aria-label="Identidad">
          <div className="plaque__crest">E</div>
          <div className="plaque__text">
            <div className="plaque__name">Librería personal de Esteban</div>
            <div className="plaque__sub">9 secciones · 27 libros · 5 cosechás</div>
          </div>
        </header>

        <aside className="controls-hint" aria-label="Cómo moverte en la librería">
          <div className="controls-hint__title">Cómo moverte</div>
          <div className="controls-hint__row">
            <span className="controls-hint__icon" aria-hidden="true">⤴</span>
            <span>Arrastrá para girar la librería</span>
          </div>
          <div className="controls-hint__row">
            <span className="controls-hint__icon" aria-hidden="true">⊕</span>
            <span>Scroll o pinch para hacer zoom</span>
          </div>
          <div className="controls-hint__row">
            <span className="controls-hint__icon" aria-hidden="true">▸</span>
            <span>Click en un libro para abrirlo</span>
          </div>
          <div className="controls-hint__row">
            <span className="controls-hint__icon" aria-hidden="true">↓</span>
            <span>Desde la ficha podés descargar el PDF</span>
          </div>
        </aside>

        <aside className="coffee-cta" aria-label="Invitación a café">
          <div className="coffee-cta__text">
            ¿Leíste un libro de la lista?
            <strong> Te invito un café.</strong>
          </div>
          <button
            type="button"
            className="coffee-cta__btn"
            onClick={generateCoffeeCoupon}
            aria-label="Generar cupón descargable por un café con Esteban"
          >
            <span className="coffee-cta__cup" aria-hidden="true">☕</span>
            Generar cupón
          </button>
        </aside>
      </div>

      {selected && (
        <BookDetailModal
          topic={selected.topic}
          book={selected.book}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
