"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { type Book, type Topic } from "@/lib/data";
import BookDetailModal from "@/components/BookDetailModal";

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
        <header className="plaque" aria-label="Identidad">
          <div className="plaque__crest">C</div>
          <div className="plaque__text">
            <div className="plaque__name">Codex</div>
            <div className="plaque__sub">Biblioteca · 9 secciones · 27 libros</div>
          </div>
        </header>
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
