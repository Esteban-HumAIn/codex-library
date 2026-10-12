"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { TOPICS, type Book, type Topic } from "@/lib/data";
import BookDetailModal from "@/components/BookDetailModal";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

const COLORS: Record<string, string> = {
  fisica: "#C73E1D",
  matematicas: "#1E40AF",
  biologia: "#15803D",
  economia: "#B8860B",
  filosofia: "#7C3AED",
  computacion: "#0E7490",
  historia: "#9A3412",
  psicologia: "#BE185D",
  sistemas: "#475569",
};

export default function Page() {
  const [selected, setSelected] = useState<{ topic: Topic; book: Book } | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const visibleTopics = useMemo(() => {
    return TOPICS.filter((t) => {
      if (filter !== "all" && t.id !== filter) return false;
      if (!query) return true;
      const h = JSON.stringify(t).toLowerCase();
      return h.includes(query.toLowerCase());
    });
  }, [filter, query]);

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

        <div className="notebook">
          <input
            type="search"
            placeholder="Buscar título, autor, tema…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar"
          />
        </div>

        <div className="legend__hint">
          Arrastrá para girar la cámara · pasá el cursor sobre un libro y hacé clic
        </div>

        <div className="legend">
          <button
            className="legend__chip"
            data-active={filter === "all" ? "true" : "false"}
            onClick={() => setFilter("all")}
          >
            <span className="legend__dot" style={{ background: "#B8860B" }} />
            Todos
          </button>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              className="legend__chip"
              data-active={filter === t.id ? "true" : "false"}
              onClick={() => setFilter(t.id)}
            >
              <span
                className="legend__dot"
                style={{ ["--c" as any]: COLORS[t.id], background: COLORS[t.id] }}
              />
              {t.title}
            </button>
          ))}
        </div>
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
