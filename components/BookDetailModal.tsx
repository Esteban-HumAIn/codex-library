"use client";

import { type Book, type Topic } from "@/lib/data";

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

export default function BookDetailModal({
  topic,
  book,
  onClose,
}: {
  topic: Topic;
  book: Book;
  onClose: () => void;
}) {
  const c = COLORS[topic.id] || "#B8860B";
  const isMarcoAurelio = book.id === "aurelius-meditations";

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <button
          className="modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div
          className="modal__page modal__page--left"
          style={{ ["--c" as any]: c }}
        >
          <div className="modal__eyebrow">
            <span className="pip" />
            <span>{topic.title}</span>
          </div>
          <h1 className="modal__title">{book.title}</h1>
          <p className="modal__author">
            {book.author} · {book.year}
          </p>

          <div className="modal__section">
            <h3 className="modal__section-label">Por qué este libro</h3>
            <p className="modal__body">{book.why_this_book}</p>
          </div>

          <div className="modal__section">
            <h3 className="modal__section-label">Conceptos clave</h3>
            <div className="modal__concepts">
              {(book.key_concepts || []).map((c) => (
                <span key={c} className="concept">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="modal__meta">
            {book.depth && <span>{book.depth}</span>}
            {book.language && <span>{book.language}</span>}
            {book.isbn && <span>ISBN {book.isbn}</span>}
            {book.jades_pick && <span>★ JADES Pick</span>}
          </div>

          {isMarcoAurelio && (
            <a
              className="modal__pdf-btn"
              href="/assets/marco_aurelio_cansancio.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir cosechá completa (PDF)
            </a>
          )}

          <div className="modal__page-num modal__page-num--left">— i —</div>
        </div>

        <div className="modal__page modal__page--right">
          <div className="modal__section">
            <h3 className="modal__section-label">Síntesis</h3>
            <p className="modal__body">{book.synthesis}</p>
          </div>

          <div className="modal__section">
            <h3 className="modal__section-label">Plan de lectura</h3>
            <p className="modal__plan">
              <strong>Ritmo sugerido.</strong> {book.reading_plan}
            </p>
          </div>

          <div className="modal__page-num modal__page-num--right">— ii —</div>
        </div>
      </div>
    </div>
  );
}
