"use client";

// CoffeeCoupon · client-side PDF generator
// Estética: cream FEFAE0 + dorado DDA15E + warm cream F5EDDC
// Genera cupón único con serial aleatorio + fecha emisión + expiración

import { jsPDF } from "jspdf";

// Paleta canónica de la librería
const COLORS = {
  cream: "#FEFAE0",
  creamWarm: "#F5EDDC",
  gold: "#DDA15E",
  goldDark: "#B8860B",
  ink: "#3C260C",
  inkSoft: "#7A5A30",
};

function randomSerial(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin I/O/0/1
  let block = "";
  for (let i = 0; i < 6; i++) {
    block += chars[Math.floor(Math.random() * chars.length)];
  }
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `COA-${block}-${y}${m}${day}`;
}

function formatDate(d: Date): string {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export function generateCoffeeCoupon(): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [180, 100], // cupón ancho, tipo voucher
  });

  const w = 180;
  const h = 100;

  // === Fondo cream ===
  doc.setFillColor(COLORS.cream);
  doc.rect(0, 0, w, h, "F");

  // === Borde dorado ===
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.6);
  doc.rect(4, 4, w - 8, h - 8);
  doc.setLineWidth(0.2);
  doc.rect(6, 6, w - 12, h - 12);

  // === Banda izquierda (cupón) ===
  doc.setFillColor(COLORS.creamWarm);
  doc.rect(8, 8, 56, h - 16, "F");

  // Cup emoji (unicode not reliable in jsPDF default fonts, usar texto estilizado)
  doc.setFont("times", "normal");
  doc.setFontSize(48);
  doc.setTextColor(COLORS.goldDark);
  doc.text("C", 36, 50, { align: "center" });

  // Label vertical "CUPÓN"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.inkSoft);
  doc.text("CUPÓN  ·  REDEEMABLE", 36, 80, { align: "center" });

  // === Header derecho ===
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.inkSoft);
  doc.text("LIBRERÍA PERSONAL DE ESTEBAN", 75, 18);

  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(COLORS.ink);
  doc.text("1 Café con Esteban", 75, 32);

  // === Línea separadora dorada ===
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(75, 38, 168, 38);

  // === Body ===
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.ink);
  doc.text("Válido por un virtual coffee para conversar", 75, 48);
  doc.text("el libro conmigo. Te escribo, vos me decís", 75, 54);
  doc.text("cuándo y dónde (Zoom, Meet, o lo que prefieras).", 75, 60);

  // === Footer block (datos del cupón) ===
  // Cuadros para serial + fechas
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.2);
  doc.line(75, 70, 168, 70);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.inkSoft);
  doc.text("SERIAL", 75, 76);
  doc.text("EMITIDO", 110, 76);
  doc.text("VÁLIDO HASTA", 145, 76);

  const serial = randomSerial();
  const issued = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.ink);
  doc.text(serial, 75, 84);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(formatDate(issued).replace(" de ", "/").replace(" de ", "/"), 110, 84);
  doc.text(formatDate(expires).replace(" de ", "/").replace(" de ", "/"), 145, 84);

  // === Cómo canjear ===
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.inkSoft);
  doc.text("Canje: escribime por WhatsApp con el serial · agendamos virtual coffee", 75, 92);

  // === Filigrana ===
  doc.setFont("times", "italic");
  doc.setFontSize(6);
  doc.setTextColor(COLORS.gold);
  doc.text("codex-library · cosecha personal", w - 8, h - 6, { align: "right" });

  // === Descargar ===
  const fileName = `cupon-cafe-esteban-${serial}.pdf`;
  doc.save(fileName);
}
