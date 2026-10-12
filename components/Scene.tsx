"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { TOPICS, SHELVES, type Book, type Topic } from "@/lib/data";
import {
  makeGoldTextTexture,
  makePaperTexture,
  makeFabricTexture,
  makeLeatherTexture,
  makeBrassTexture,
  makeOakPanelTexture,
  makeHerringboneTexture,
} from "@/lib/textures";

/* =========================================================
   ACADEMIC LIBRARY · Oxford/Harvard/Yale aesthetic
   - Dark oak paneling (walls, floor, bookcase, ceiling)
   - Coffered ceiling with brass chandeliers
   - Long reading table with green-shaded banker's lamps
   - Leather chesterfield chairs
   - Marble columns
   - Multi-tier bookcase with cornices
   - Warm candlelight glow
   ========================================================= */

export const SCENE_TOPICS = TOPICS;
export const SCENE_SHELVES = SHELVES;

// Paleta clásica de librería: cuero, oxblood, verde botella, azul marino
const COLORS: Record<string, string> = {
  fisica: "#5C2A1A",        // cuero oxblood
  matematicas: "#1E3A6E",   // azul marino clásico
  biologia: "#2A4A2A",      // verde botella
  economia: "#4A2818",      // cuero marrón oscuro
  filosofia: "#3A1E2A",     // vino oscuro / burdeos
  computacion: "#1E2A4A",   // azul medianoche
  historia: "#3D2817",      // cuero antiguo
  psicologia: "#4A2A1E",    // siena tostado
  sistemas: "#2A2A2E",      // gris grafito
};

function getBookColor(book: Book, topic: Topic): string {
  if (book.jades_pick) return "#C49B30";
  return COLORS[topic.id] || "#5C3A1E";
}

// Darken a hex color by a factor (0-1)
function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = (v: number) => Math.max(0, Math.floor(v * (1 - amount)));
  return `#${f(r).toString(16).padStart(2, "0")}${f(g).toString(16).padStart(2, "0")}${f(b).toString(16).padStart(2, "0")}`;
}

// Create a classic leather-bound book spine texture (CanvasTexture)
// Used on the +z face of each book (the face the viewer sees)
function createSpineTexture(book: Book, color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Background: base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 256);

  // Horizontal gradient for depth (darker on edges)
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, "rgba(0,0,0,0.35)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 256);

  // Top and bottom darker bands (cap of the spine)
  const cap = darken(color, 0.3);
  ctx.fillStyle = cap;
  ctx.fillRect(0, 0, 128, 14);
  ctx.fillRect(0, 242, 128, 14);

  // Gold horizontal raised bands (classic leather-bound)
  const gold = "#C49B30";
  const goldDark = "#8B6914";
  ctx.fillStyle = gold;
  ctx.fillRect(0, 36, 128, 2);
  ctx.fillRect(0, 60, 128, 2);
  ctx.fillRect(0, 196, 128, 2);
  ctx.fillRect(0, 220, 128, 2);
  // Shadow under bands
  ctx.fillStyle = goldDark;
  ctx.fillRect(0, 38, 128, 1);
  ctx.fillRect(0, 62, 128, 1);
  ctx.fillRect(0, 198, 128, 1);
  ctx.fillRect(0, 222, 128, 1);

  // Small decorative gold diamond at top and bottom (classic leather detail)
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.lineTo(70, 24);
  ctx.lineTo(64, 30);
  ctx.lineTo(58, 24);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(64, 226);
  ctx.lineTo(70, 232);
  ctx.lineTo(64, 238);
  ctx.lineTo(58, 232);
  ctx.closePath();
  ctx.fill();

  // Title text (vertical, gold serif)
  ctx.save();
  ctx.translate(64, 128);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = gold;
  ctx.font = "bold 11px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Truncate long titles
  const title = book.title.length > 22 ? book.title.slice(0, 20) + "…" : book.title;
  ctx.fillText(title, 0, -2);
  // Author below title (smaller)
  ctx.font = "italic 8px Georgia, 'Times New Roman', serif";
  ctx.fillText(book.author.split(" ").slice(-1)[0] || "", 0, 14);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

// ============== UNIVERSITY CRESTS & GENIUS PORTRAITS ==============

type University = {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  symbol: "book" | "lamp" | "tree" | "cross" | "shield" | "beaver";
  founded: number;
  city: string;
};

const UNIVERSITIES: University[] = [
  { id: "mit", name: "Massachusetts Institute of Technology", shortName: "MIT", primaryColor: "#8A1538", secondaryColor: "#A2AAAD", symbol: "book", founded: 1861, city: "Cambridge, MA" },
  { id: "stanford", name: "Stanford University", shortName: "STANFORD", primaryColor: "#8C1515", secondaryColor: "#B83A3A", symbol: "tree", founded: 1885, city: "Stanford, CA" },
  { id: "oxford", name: "University of Oxford", shortName: "OXFORD", primaryColor: "#002147", secondaryColor: "#C5C9C4", symbol: "book", founded: 1096, city: "Oxford, UK" },
];

type Genius = {
  id: string;
  name: string;
  years: string;
  field: string;
  symbol: "atom" | "apple" | "telescope" | "circle" | "radiation" | "tree" | "owl" | "lightning" | "tape" | "rocket";
  hair: "wild" | "wig" | "bald" | "bun" | "short" | "long" | "curly";
  beard: "none" | "goatee" | "full" | "mustache" | "long";
};

const GENIUSES: Genius[] = [
  { id: "einstein", name: "Albert Einstein", years: "1879–1955", field: "Física", symbol: "atom", hair: "wild", beard: "mustache" },
  { id: "galilei", name: "Galileo Galilei", years: "1564–1642", field: "Astronomía", symbol: "telescope", hair: "long", beard: "long" },
  { id: "musk", name: "Elon Musk", years: "1971–", field: "Ingeniería", symbol: "rocket", hair: "short", beard: "none" },
  { id: "newton", name: "Isaac Newton", years: "1643–1727", field: "Física & Math", symbol: "apple", hair: "wig", beard: "none" },
  { id: "davinci", name: "Leonardo da Vinci", years: "1452–1519", field: "Polímata", symbol: "circle", hair: "long", beard: "long" },
  { id: "curie", name: "Marie Curie", years: "1867–1934", field: "Química", symbol: "radiation", hair: "bun", beard: "none" },
  { id: "darwin", name: "Charles Darwin", years: "1809–1882", field: "Biología", symbol: "tree", hair: "curly", beard: "full" },
  { id: "aristotle", name: "Aristóteles", years: "384–322 BC", field: "Filosofía", symbol: "owl", hair: "curly", beard: "full" },
  { id: "tesla", name: "Nikola Tesla", years: "1856–1943", field: "Ingeniería", symbol: "lightning", hair: "short", beard: "mustache" },
  { id: "turing", name: "Alan Turing", years: "1912–1954", field: "Computación", symbol: "tape", hair: "short", beard: "none" },
];

function createUniversityCrestTexture(u: University): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Parchment background
  ctx.fillStyle = "#F5E6D3";
  ctx.fillRect(0, 0, 256, 256);

  // Heraldic shield shape (pointed bottom, rounded top)
  ctx.beginPath();
  ctx.moveTo(48, 60);
  ctx.lineTo(208, 60);
  ctx.lineTo(208, 140);
  ctx.quadraticCurveTo(208, 200, 128, 230);
  ctx.quadraticCurveTo(48, 200, 48, 140);
  ctx.closePath();
  ctx.fillStyle = u.primaryColor;
  ctx.fill();
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Inner border
  ctx.beginPath();
  ctx.moveTo(58, 70);
  ctx.lineTo(198, 70);
  ctx.lineTo(198, 138);
  ctx.quadraticCurveTo(198, 192, 128, 220);
  ctx.quadraticCurveTo(58, 192, 58, 138);
  ctx.closePath();
  ctx.strokeStyle = u.secondaryColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Symbol
  ctx.save();
  ctx.translate(128, 120);
  ctx.fillStyle = u.secondaryColor;
  ctx.strokeStyle = u.secondaryColor;
  ctx.lineWidth = 2;

  if (u.symbol === "book") {
    // Open book
    ctx.beginPath();
    ctx.moveTo(-25, -10);
    ctx.quadraticCurveTo(0, -15, 25, -10);
    ctx.lineTo(25, 10);
    ctx.quadraticCurveTo(0, 5, -25, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(0, 7);
    ctx.stroke();
  } else if (u.symbol === "tree") {
    // Simple tree
    ctx.beginPath();
    ctx.arc(0, -5, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = u.primaryColor;
    ctx.fillRect(-2, 10, 4, 15);
  } else if (u.symbol === "shield") {
    // Inner shield
    ctx.beginPath();
    ctx.moveTo(-15, -15);
    ctx.lineTo(15, -15);
    ctx.lineTo(15, 5);
    ctx.quadraticCurveTo(15, 18, 0, 25);
    ctx.quadraticCurveTo(-15, 18, -15, 5);
    ctx.closePath();
    ctx.stroke();
    // Cross
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 15);
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();
  } else if (u.symbol === "lamp") {
    // Lamp
    ctx.beginPath();
    ctx.arc(0, -5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = u.primaryColor;
    ctx.fillRect(-1, 5, 2, 12);
  } else if (u.symbol === "beaver") {
    // Stylized beaver (simplified)
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15, -3, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Banner at bottom
  ctx.fillStyle = u.secondaryColor;
  ctx.fillRect(38, 195, 180, 22);
  ctx.strokeStyle = u.primaryColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 195, 180, 22);

  // University name
  ctx.fillStyle = u.primaryColor;
  ctx.font = "bold 13px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(u.shortName, 128, 206);

  // Founded year at top
  ctx.font = "italic 10px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = u.primaryColor;
  ctx.fillText(`Est. ${u.founded}`, 128, 45);

  // City below name
  ctx.font = "9px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#3A2818";
  ctx.fillText(u.city, 128, 238);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createGeniusPortraitTexture(g: Genius): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;

  // Sepia background
  ctx.fillStyle = "#E8D5B7";
  ctx.fillRect(0, 0, 256, 320);

  // Vignette
  const grad = ctx.createRadialGradient(128, 110, 30, 128, 110, 140);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(60,30,10,0.3)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 320);

  // Cameo frame (oval)
  ctx.beginPath();
  ctx.ellipse(128, 110, 70, 85, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#F5E6D3";
  ctx.fill();
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Profile silhouette (facing right)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(128, 110, 70, 85, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#1A0A05";
  ctx.beginPath();
  // Head shape (oval, slightly turned right)
  ctx.moveTo(90, 80);
  ctx.quadraticCurveTo(85, 50, 115, 35);
  ctx.quadraticCurveTo(140, 30, 155, 45);
  // Nose bump
  ctx.quadraticCurveTo(165, 65, 158, 80);
  // Mouth
  ctx.quadraticCurveTo(152, 90, 155, 100);
  // Chin
  ctx.quadraticCurveTo(150, 120, 140, 130);
  // Neck
  ctx.quadraticCurveTo(135, 140, 130, 160);
  ctx.lineTo(100, 160);
  ctx.quadraticCurveTo(95, 140, 88, 120);
  ctx.closePath();
  ctx.fill();

  // Hair style variations
  ctx.fillStyle = "#0A0500";
  if (g.hair === "wild") {
    // Einstein wild hair
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 1.5 - Math.PI * 0.2;
      const x = 115 + Math.cos(a) * 38;
      const y = 55 + Math.sin(a) * 35;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (g.hair === "wig") {
    // Newton-style wig
    ctx.beginPath();
    ctx.ellipse(125, 50, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(80, 45, 12, 50);
    ctx.fillRect(158, 45, 12, 50);
  } else if (g.hair === "long") {
    // Da Vinci / Galileo long hair
    ctx.beginPath();
    ctx.ellipse(125, 50, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(85, 50, 15, 80);
    ctx.fillRect(150, 50, 15, 80);
  } else if (g.hair === "bun") {
    // Marie Curie bun
    ctx.beginPath();
    ctx.arc(115, 40, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(125, 55, 35, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.hair === "curly") {
    // Darwin / Aristotle curly
    for (let i = 0; i < 10; i++) {
      const x = 90 + (i % 4) * 20;
      const y = 35 + Math.floor(i / 4) * 12;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (g.hair === "short") {
    // Musk / Tesla / Turing short hair
    ctx.beginPath();
    ctx.ellipse(125, 50, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Beard variations
  if (g.beard === "full") {
    ctx.beginPath();
    ctx.ellipse(140, 115, 18, 22, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.beard === "long") {
    ctx.beginPath();
    ctx.ellipse(140, 120, 16, 30, 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.beard === "mustache") {
    ctx.beginPath();
    ctx.ellipse(152, 88, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.beard === "goatee") {
    ctx.beginPath();
    ctx.ellipse(142, 115, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Name
  ctx.fillStyle = "#1A0A05";
  ctx.font = "bold 16px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(g.name.toUpperCase(), 128, 225);

  // Years
  ctx.font = "italic 12px Georgia, 'Times New Roman', serif";
  ctx.fillText(g.years, 128, 248);

  // Field
  ctx.font = "10px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#3A2818";
  ctx.fillText(g.field, 128, 265);

  // Field symbol
  ctx.save();
  ctx.translate(128, 290);
  ctx.strokeStyle = "#3A2818";
  ctx.fillStyle = "#3A2818";
  ctx.lineWidth = 1.5;

  if (g.symbol === "atom") {
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.symbol === "apple") {
    ctx.beginPath();
    ctx.arc(-3, 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1A0A05";
    ctx.fillRect(-1, -8, 2, 6);
  } else if (g.symbol === "telescope") {
    ctx.save();
    ctx.rotate(-Math.PI / 4);
    ctx.fillRect(-12, -2, 24, 4);
    ctx.fillRect(10, -4, 6, 8);
    ctx.restore();
  } else if (g.symbol === "circle") {
    // Vitruvian circle
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.stroke();
  } else if (g.symbol === "radiation") {
    // Trefoil
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * 2 * Math.PI) / 3);
      ctx.beginPath();
      ctx.arc(0, -7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.symbol === "tree") {
    ctx.beginPath();
    ctx.arc(0, -4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1, 4, 2, 10);
  } else if (g.symbol === "owl") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E8D5B7";
    ctx.beginPath();
    ctx.arc(-4, -3, 3, 0, Math.PI * 2);
    ctx.arc(4, -3, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.symbol === "lightning") {
    ctx.beginPath();
    ctx.moveTo(2, -14);
    ctx.lineTo(-4, 0);
    ctx.lineTo(1, 0);
    ctx.lineTo(-3, 14);
    ctx.lineTo(4, -2);
    ctx.lineTo(-1, -2);
    ctx.closePath();
    ctx.fill();
  } else if (g.symbol === "tape") {
    // Turing tape (two parallel lines with marks)
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(14, -6);
    ctx.moveTo(-14, 6);
    ctx.lineTo(14, 6);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const x = -12 + i * 6;
      ctx.beginPath();
      ctx.moveTo(x, -6);
      ctx.lineTo(x, 6);
      ctx.stroke();
    }
  } else if (g.symbol === "rocket") {
    // Simple rocket
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(4, 0);
    ctx.lineTo(4, 10);
    ctx.lineTo(-4, 10);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-8, 12);
    ctx.lineTo(-4, 12);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(8, 12);
    ctx.lineTo(4, 12);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function UniversityCrest({ position, university }: { position: [number, number, number]; university: University }) {
  const tex = useMemo(() => createUniversityCrestTexture(university), [university]);
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 1.2, 0.08]} />
        <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}

function GeniusPortrait({ position, genius }: { position: [number, number, number]; genius: Genius }) {
  const tex = useMemo(() => createGeniusPortraitTexture(genius), [genius]);
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.0, 1.25, 0.08]} />
        <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.82, 1.07]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}
// ============== COFFERED CEILING ==============
function CofferedCeiling({ tex }: { tex: THREE.Texture }) {
  return (
    <group position={[0, 7.5, 0]}>
      {/* Cielo raso base (techo plano) */}
      <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial
          map={tex}
          color="#3A2818"
          roughness={0.7}
        />
      </mesh>
      {/* Vigas transversales (coffered look) */}
      {Array.from({ length: 7 }).map((_, i) => {
        const z = -7 + (i * 14) / 6;
        return (
          <mesh key={`beam-z-${i}`} position={[0, 7.45, z]} castShadow>
            <boxGeometry args={[28, 0.4, 0.4]} />
            <meshStandardMaterial color="#2A1A0E" roughness={0.6} />
          </mesh>
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = -12 + (i * 24) / 9;
        return (
          <mesh key={`beam-x-${i}`} position={[x, 7.45, 0]} castShadow>
            <boxGeometry args={[0.4, 0.4, 14]} />
            <meshStandardMaterial color="#2A1A0E" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// ============== BRASS CHANDELIER ==============
function Chandelier({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  // 6 brazos con velas (candles)
  const arms = 6;
  return (
    <group position={position} scale={scale}>
      {/* Cadena de suspensión */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
        <meshStandardMaterial color="#8B6914" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Cuerpo central (esfera) */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Anillos decorativos */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.5, 0.04, 8, 32]} />
        <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.04, 8, 32]} />
        <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Brazos con velas */}
      {Array.from({ length: arms }).map((_, i) => {
        const angle = (i / arms) * Math.PI * 2;
        const x = Math.cos(angle) * 0.7;
        const z = Math.sin(angle) * 0.7;
        return (
          <group key={i}>
            {/* Brazo curvo (cilindro acostado) */}
            <mesh position={[x * 0.7, 0, z * 0.7]} rotation={[0, -angle, Math.PI / 2 - 0.4]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
              <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Candelabro (candle holder) */}
            <mesh position={[x, 0.1, z]} castShadow>
              <cylinderGeometry args={[0.05, 0.08, 0.08, 8]} />
              <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Vela (candle) */}
            <mesh position={[x, 0.2, z]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.18, 8]} />
              <meshStandardMaterial color="#F5E6D3" roughness={0.8} />
            </mesh>
            {/* Luz puntual cálida (vela apagada, luz decorativa) */}
            <pointLight
              position={[x, 0.4, z]}
              intensity={3}
              color="#FFB070"
              distance={6}
              decay={1.5}
            />
          </group>
        );
      })}
    </group>
  );
}

// ============== BANKER'S LAMP (lámpara verde de mesa) ==============
function BankersLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base circular */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.05, 16]} />
        <meshStandardMaterial color="#2A1A0E" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Poste */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Pantalla verde (semicírculo) */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.18, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#1F4A2A"
          emissive="#3A8050"
          emissiveIntensity={0.6}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bombilla (luz verde) */}
      <pointLight
        position={[0, 0.45, 0.05]}
        intensity={2.5}
        color="#7AB070"
        distance={3}
        decay={1.5}
      />
    </group>
  );
}

// ============== LONG READING TABLE (mesa larga de lectura) ==============
function ReadingTable({ tex }: { tex: THREE.Texture }) {
  return (
    <group position={[0, 0.01, 2.5]}>
      {/* Tablero (mesa larga) */}
      <mesh position={[0, 0.75, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.1, 1.4]} />
        <meshStandardMaterial
          map={tex}
          color="#5C3A1E"
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>
      {/* Borde decorativo superior */}
      <mesh position={[0, 0.81, 0]} receiveShadow>
        <boxGeometry args={[6.05, 0.02, 1.45]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
      {/* Patas (4) talladas */}
      {[[-2.7, -0.55], [2.7, -0.55], [-2.7, 0.55], [2.7, 0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} castShadow>
          <boxGeometry args={[0.15, 0.7, 0.15]} />
          <meshStandardMaterial color="#3D2817" roughness={0.5} />
        </mesh>
      ))}
      {/* Travesaño (refuerzo) entre patas */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[5.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ============== LEATHER CHESTERFIELD CHAIR ==============
function LeatherChair({ position, rotation = [0, 0, 0] }: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Asiento */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.12, 0.7]} />
        <meshStandardMaterial
          color="#5C0F1A"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {/* Respaldo alto (chesterfield) */}
      <mesh position={[0, 0.9, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.9, 0.12]} />
        <meshStandardMaterial
          color="#5C0F1A"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {/* Brazos */}
      <mesh position={[0.42, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.7]} />
        <meshStandardMaterial color="#5C0F1A" roughness={0.55} />
      </mesh>
      <mesh position={[-0.42, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.7]} />
        <meshStandardMaterial color="#5C0F1A" roughness={0.55} />
      </mesh>
      {/* Patas */}
      {[[0.32, 0.32], [-0.32, 0.32], [0.32, -0.32], [-0.32, -0.32]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#2A1A0E" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ============== MARBLE COLUMN ==============
function MarbleColumn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.2, 16]} />
        <meshStandardMaterial color="#D8D0C0" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Shaft (columna) */}
      <mesh position={[0, 3.7, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.46, 7, 24]} />
        <meshStandardMaterial color="#E0D8C8" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Capitel (cap) */}
      <mesh position={[0, 7.3, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.42, 0.3, 16]} />
        <meshStandardMaterial color="#D8D0C0" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

// ============== ROOM (dark oak paneling + wood floor) ==============
function Room({ tex }: { tex: TexCache }) {
  return (
    <group>
      {/* Piso de madera (herringbone) */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial
          map={tex.woodFloor}
          color="#5C3A1E"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Pared trasera (wood paneling) */}
      <mesh position={[0, 3.5, -7]} receiveShadow>
        <planeGeometry args={[28, 8]} />
        <meshStandardMaterial
          map={tex.woodPanel}
          color="#3D2817"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      {/* Pared izquierda */}
      <mesh position={[-12, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          map={tex.woodPanel}
          color="#3D2817"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      {/* Pared derecha */}
      <mesh position={[12, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial
          map={tex.woodPanel}
          color="#3D2817"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Wainscoting (zócalo de madera oscuro en la base) */}
      <mesh position={[0, 0.5, -6.95]}>
        <boxGeometry args={[24, 1, 0.1]} />
        <meshStandardMaterial color="#2A1A0E" roughness={0.5} />
      </mesh>

      {/* Cornice (moldura superior) */}
      <mesh position={[0, 7.0, -6.95]}>
        <boxGeometry args={[24, 0.25, 0.15]} />
        <meshStandardMaterial color="#2A1A0E" roughness={0.5} />
      </mesh>
      <mesh position={[-11.9, 7.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.25, 0.15]} />
        <meshStandardMaterial color="#2A1A0E" roughness={0.5} />
      </mesh>
      <mesh position={[11.9, 7.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.25, 0.15]} />
        <meshStandardMaterial color="#2A1A0E" roughness={0.5} />
      </mesh>

      {/* Cielo raso (techo artesonado) */}
      <CofferedCeiling tex={tex.woodPanel} />

      {/* Stained glass window (trasera) */}
      <StainedGlass position={[3, 4.5, -6.9]} />
      <StainedGlass position={[-3, 4.5, -6.9]} />
    </group>
  );
}

// ============== STAINED GLASS WINDOW ==============
function StainedGlass({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Frame de bronce */}
      <mesh>
        <boxGeometry args={[2.2, 3.5, 0.1]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
      {/* Vidrio central (emerald green con luz) */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.0, 3.3]} />
        <meshStandardMaterial
          color="#1F4A2A"
          emissive="#3A8050"
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Cruz de bronce sobre el vidrio */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.08, 3.3, 0.02]} />
        <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.0, 0.08, 0.02]} />
        <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Luz exterior (luz del stained glass) */}
      <pointLight
        position={[0, 0, 1.5]}
        intensity={3}
        color="#7AB070"
        distance={6}
        decay={1.5}
      />
    </group>
  );
}

// ============== BOOKCASE (multi-tier con paneles de madera) ==============
function BookcaseShelf({
  shelf,
  topics,
  onBookClick,
  tex,
}: {
  shelf: { num: string; label: string; ids: string[] };
  topics: Topic[];
  onBookClick: (topic: Topic, book: Book) => void;
  tex: TexCache;
}) {
  const shelfY = useMemo(() => {
    const idx = SHELVES.findIndex((s) => s.num === shelf.num);
    return idx * 0.5;
  }, [shelf.num]);

  const shelfBooks = useMemo(() => {
    const books: { book: Book; topic: Topic }[] = [];
    shelf.ids.forEach((id) => {
      const t = topics.find((x) => x.id === id);
      if (t) t.books.forEach((b) => books.push({ book: b, topic: t }));
    });
    return books;
  }, [shelf, topics]);

  const totalWidth = useMemo(() => {
    let w = 0;
    shelfBooks.forEach(({ book }) => {
      w += bookWidth(book) + 0.08;
    });
    return Math.max(w, 6);
  }, [shelfBooks]);

  const bookPositions = useMemo(() => {
    const positions: { book: Book; topic: Topic; pos: [number, number, number] }[] = [];
    let x = -totalWidth / 2;
    shelfBooks.forEach(({ book, topic }) => {
      const w = bookWidth(book);
      positions.push({
        book,
        topic,
        pos: [x + w / 2, shelfY + 0.08, 0.15],
      });
      x += w + 0.08;
    });
    return positions;
  }, [shelfBooks, totalWidth, shelfY]);

  return (
    <group>
      <group position={[0, shelfY, -0.5]}>
        <RoundedShelf totalWidth={totalWidth} />
        <BooksLayer positions={bookPositions} onBookClick={onBookClick} tex={tex} />
      </group>
    </group>
  );
}

function RoundedShelf({ totalWidth }: { totalWidth: number }) {
  return (
    <group>
      {/* Tablero del estante (madera oscura con vetas) */}
      <RoundedBox
        args={[totalWidth + 0.4, 0.12, 0.7]}
        radius={0.02}
        smoothness={3}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#3D2817"
          roughness={0.6}
          metalness={0.05}
        />
      </RoundedBox>
      {/* Panel trasero (madera) */}
      <mesh position={[0, 0.55, -0.32]} receiveShadow>
        <boxGeometry args={[totalWidth + 0.4, 1.2, 0.05]} />
        <meshStandardMaterial color="#2A1A0E" roughness={0.7} />
      </mesh>
      {/* Cornice superior (moldura decorativa) */}
      <mesh position={[0, 1.15, -0.05]} receiveShadow>
        <boxGeometry args={[totalWidth + 0.5, 0.08, 0.1]} />
        <meshStandardMaterial color="#1F0F08" roughness={0.6} />
      </mesh>
      {/* Cornice inferior */}
      <mesh position={[0, -0.04, -0.05]} receiveShadow>
        <boxGeometry args={[totalWidth + 0.5, 0.06, 0.1]} />
        <meshStandardMaterial color="#1F0F08" roughness={0.6} />
      </mesh>
    </group>
  );
}

function BooksLayer({
  positions,
  onBookClick,
  tex,
}: {
  positions: { book: Book; topic: Topic; pos: [number, number, number] }[];
  onBookClick: (topic: Topic, book: Book) => void;
  tex: TexCache;
}) {
  return (
    <group>
      {positions.map(({ book, topic, pos }, i) => (
        <Book3D
          key={book.id}
          book={book}
          topic={topic}
          position={pos}
          onClick={() => onBookClick(topic, book)}
        />
      ))}
    </group>
  );
}

function Book3D({
  book,
  topic,
  position,
  onClick,
}: {
  book: Book;
  topic: Topic;
  position: [number, number, number];
  onClick: () => void;
}) {
  const w = bookWidth(book);
  const h = bookHeight(book);
  const d = 0.22;
  const color = getBookColor(book, topic);
  const spineTexture = useMemo(() => createSpineTexture(book, color), [book, color]);
  const coverColor = darken(color, 0.15);
  const pageColor = darken(color, 0.45);
  const [hover, setHover] = useState(false);

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        {/* Face order: 0=+x, 1=-x, 2=+y, 3=-y, 4=+z (spine), 5=-z */}
        {/* Spine (face 4) — viewer sees this */}
        <meshStandardMaterial attach="material-4" map={spineTexture} roughness={0.85} metalness={0.05} />
        {/* Side covers (faces 0,1) */}
        <meshStandardMaterial attach="material-0" color={coverColor} roughness={0.9} metalness={0.03} />
        <meshStandardMaterial attach="material-1" color={coverColor} roughness={0.9} metalness={0.03} />
        {/* Top/bottom page edges (faces 2,3) — visible as paper */}
        <meshStandardMaterial attach="material-2" color={pageColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-3" color={pageColor} roughness={0.95} metalness={0} />
        {/* Back cover (face 5) */}
        <meshStandardMaterial attach="material-5" color={coverColor} roughness={0.9} metalness={0.03} />
      </mesh>
      {book.jades_pick && (
        <mesh position={[0, 0, d / 2 + 0.005]}>
          <planeGeometry args={[w * 0.5, h * 0.3]} />
          <meshStandardMaterial
            color="#C49B30"
            emissive="#C49B30"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

function bookWidth(book: Book): number {
  return 0.18 + ((hash(book.id) * 5) % 6) / 100;
}

function bookHeight(book: Book): number {
  return 0.35 + ((hash(book.id) * 5) % 8) / 100;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ============== PROPS (WINDOW + BUST + PORTRAIT + CLOCK + GLOBE) ==============
function Window({ tex }: { tex: TexCache }) {
  return (
    <group>
      {/* Ya está reemplazado por StainedGlass en Room */}
    </group>
  );
}

// ============== MARCUS AURELIUS EQUESTRIAN STATUE ==============
// Réplica simplificada de la estatua ecuestre de Marco Aurelio (original en Museos Capitolinos, Roma, ~175 d.C.)
// Construida con primitivos: caballo parado con pata delantera derecha levantada, jinete con brazo derecho extendido, pedestal de mármol
function MarcusAureliusStatue({ position }: { position: [number, number, number] }) {
  // Material bronze (color del original)
  const bronze = "#8B6914";
  const bronzeDark = "#5C3A1E";
  const marble = "#D5C9A8";

  return (
    <group position={position}>
      {/* ============ PEDESTAL (mármol) ============ */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.6, 1.2]} />
        <meshStandardMaterial color={marble} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Placa de inscripción (dorado) */}
      <mesh position={[0, 0.3, 0.61]}>
        <planeGeometry args={[1.6, 0.2]} />
        <meshStandardMaterial color={bronze} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* ============ CABALLO ============ */}
      <group position={[0, 0.6, 0]}>
        {/* Cuerpo principal */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.7, 0.85, 1.9]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Pecho (más ancho) */}
        <mesh position={[0, 0.9, 0.75]} castShadow>
          <boxGeometry args={[0.8, 0.75, 0.4]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Grupa (trasera) */}
        <mesh position={[0, 1.15, -0.75]} castShadow>
          <boxGeometry args={[0.75, 0.7, 0.5]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>

        {/* 4 patas (3 apoyadas + 1 levantada) */}
        {/* Pata delantera izquierda (apoyada) */}
        <mesh position={[-0.28, 0.3, 0.6]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.7, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Pata delantera derecha — LEVANTADA (pose original) */}
        <mesh position={[0.28, 0.7, 0.85]} rotation={[0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.7, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Pata trasera izquierda */}
        <mesh position={[-0.28, 0.3, -0.6]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.7, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Pata trasera derecha */}
        <mesh position={[0.28, 0.3, -0.6]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.7, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Cascos (4) */}
        {[
          [-0.28, 0.62, 0.62],
          [0.28, 0.62, -0.62],
          [-0.28, 0.62, -0.62],
          [0.28, 0.62, 0.62],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.08, 8]} />
            <meshStandardMaterial color={bronzeDark} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Cuello (angulado hacia arriba y adelante) */}
        <mesh position={[0, 1.75, 0.85]} rotation={[-0.6, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 0.75, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Cabeza del caballo */}
        <mesh position={[0, 2.15, 1.15]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.28, 0.35, 0.55]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Hocico */}
        <mesh position={[0, 2.05, 1.45]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.15]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Orejas (2) */}
        {[-0.1, 0.1].map((x, i) => (
          <mesh key={i} position={[x, 2.38, 1.1]} castShadow>
            <coneGeometry args={[0.05, 0.13, 6]} />
            <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
          </mesh>
        ))}
        {/* Crin (3 segmentos a lo largo del cuello) */}
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={i} position={[x, 1.95, 0.85]} castShadow>
            <boxGeometry args={[0.06, 0.18, 0.25]} />
            <meshStandardMaterial color={bronzeDark} metalness={0.6} roughness={0.5} />
          </mesh>
        ))}
        {/* Cola (angulada hacia atrás y abajo) */}
        <mesh position={[0, 1.15, -1.15]} rotation={[0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.09, 0.7, 6]} />
          <meshStandardMaterial color={bronzeDark} metalness={0.6} roughness={0.5} />
        </mesh>
      </group>

      {/* ============ JINETE (MARCO AURELIO) ============ */}
      <group position={[0, 1.5, 0]}>
        {/* Caderas (sentado) */}
        <mesh position={[0, 0.15, 0.1]} castShadow>
          <boxGeometry args={[0.55, 0.3, 0.45]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Caparrón/cuirass (torso con armadura) */}
        <mesh position={[0, 0.7, 0.1]} castShadow>
          <boxGeometry args={[0.6, 0.75, 0.4]} />
          <meshStandardMaterial color={bronze} metalness={0.8} roughness={0.35} />
        </mesh>
        {/* Pteruges (faldones de la armadura, 3 tiras) */}
        {[-0.1, 0, 0.1].map((z, i) => (
          <mesh key={i} position={[0, 0.4, 0.35 + z]} castShadow>
            <boxGeometry args={[0.55, 0.2, 0.04]} />
            <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
          </mesh>
        ))}
        {/* Paludamentum (capa) detrás */}
        <mesh position={[0, 0.7, -0.25]} castShadow>
          <boxGeometry args={[0.65, 0.85, 0.06]} />
          <meshStandardMaterial color={bronzeDark} metalness={0.6} roughness={0.5} />
        </mesh>

        {/* Cabeza */}
        <mesh position={[0, 1.3, 0.15]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Barba (estilo Marco Aurelio) */}
        <mesh position={[0, 1.18, 0.32]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={bronzeDark} metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Cabello (curvado sobre la frente) */}
        <mesh position={[0, 1.42, 0.08]} castShadow>
          <sphereGeometry args={[0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={bronzeDark} metalness={0.6} roughness={0.5} />
        </mesh>

        {/* Brazo derecho EXTENDIDO (pose icónica — originalmente sostenía algo) */}
        <mesh position={[0.4, 0.85, 0.35]} rotation={[0, -0.2, -1.0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.7, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Mano derecha (puño cerrado) */}
        <mesh position={[0.7, 0.55, 0.55]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>

        {/* Brazo izquierdo (sosteniendo riendas) */}
        <mesh position={[-0.3, 0.85, 0.3]} rotation={[0.6, 0.3, 0.6]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.55, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Mano izquierda */}
        <mesh position={[-0.45, 0.55, 0.6]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
        </mesh>

        {/* Piernas (2, drapadas en tela) */}
        {[-0.16, 0.16].map((x, i) => (
          <mesh key={i} position={[x, 0.2, 0.35]} castShadow>
            <boxGeometry args={[0.16, 0.35, 0.35]} />
            <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.4} />
          </mesh>
        ))}
        {/* Pies (2) */}
        {[-0.16, 0.16].map((x, i) => (
          <mesh key={i} position={[x, 0.02, 0.5]} castShadow>
            <boxGeometry args={[0.14, 0.08, 0.22]} />
            <meshStandardMaterial color={bronzeDark} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Bust({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 1, 16]} />
        <meshStandardMaterial color="#D8D0C0" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Base decorativa */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[0.8, 0.04, 0.8]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#E0D0B8" roughness={0.7} />
      </mesh>
      {/* Cuello */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.15, 12]} />
        <meshStandardMaterial color="#E0D0B8" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Portrait({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      {/* Frame de oro */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 3, 0.1]} />
        <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Canvas interior */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.2, 2.7]} />
        <meshStandardMaterial
          map={tex.goldText}
          color="#1A0A05"
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

function WallClock({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      {/* Marco circular */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
      {/* Esfera del reloj */}
      <mesh position={[0, 0, 0.06]}>
        <circleGeometry args={[0.45, 32]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
      </mesh>
      {/* Manecillas */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.02, 0.3, 0.01]} />
        <meshStandardMaterial color="#1F0F08" />
      </mesh>
      <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.02, 0.4, 0.01]} />
        <meshStandardMaterial color="#1F0F08" />
      </mesh>
    </group>
  );
}

function Globe({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#1F4A2A" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Hourglass({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 12]} />
        <meshStandardMaterial color="#3D2817" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#D4A030" emissive="#D4A030" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Telescope({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 12]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.3]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Plant({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#3D2817" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#1F5C2E" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Rug({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[5, 3]} />
      <meshStandardMaterial
        map={tex.rug}
        color="#722F37"
        roughness={0.7}
      />
    </mesh>
  );
}

function OpenBook({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position} rotation={[0, 0.2, 0]}>
      <mesh position={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.8]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.8]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.6} />
      </mesh>
    </group>
  );
}

function CoffeeCup({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 12]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.5} />
      </mesh>
    </group>
  );
}

function ReadingGlasses({ position, tex }: { position: [number, number, number]; tex: TexCache }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <torusGeometry args={[0.05, 0.008, 8, 16]} />
        <meshStandardMaterial color="#8B6914" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 0, 0]} castShadow>
        <torusGeometry args={[0.05, 0.008, 8, 16]} />
        <meshStandardMaterial color="#8B6914" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.005, 0.005]} />
        <meshStandardMaterial color="#8B6914" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

function DustMotes() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      arr.push(
        (Math.random() - 0.5) * 20,
        Math.random() * 6 + 1,
        (Math.random() - 0.5) * 12
      );
    }
    return new Float32Array(arr);
  }, []);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const y = positions[i * 3 + 1];
        pos.setY(i, y + Math.sin(t * 0.5 + i) * 0.05);
      }
      pos.needsUpdate = true;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#D4A030" size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ============== TOP TEXTS ==============
type TexCache = {
  woodFloor: THREE.Texture;
  woodPanel: THREE.Texture;
  goldText: THREE.Texture;
  paper: THREE.Texture;
  fabric: THREE.Texture;
  leather: THREE.Texture;
  brass: THREE.Texture;
  rug: THREE.Texture;
};

function buildTextureCache(): TexCache {
  return {
    woodFloor: makeHerringboneTexture(),
    woodPanel: makeOakPanelTexture(),
    goldText: makeGoldTextTexture("Codex"),
    paper: makePaperTexture(),
    fabric: makeFabricTexture("#722F37"),
    leather: makeLeatherTexture("#5C0F1A", 7),
    brass: makeBrassTexture(),
    rug: makeFabricTexture("#722F37"),
  };
}

import { RoundedBox } from "@react-three/drei";

// ============== MAIN BOOKCASE ==============
function Bookcase({
  topics,
  onBookClick,
  tex,
}: {
  topics: Topic[];
  onBookClick: (topic: Topic, book: Book) => void;
  tex: TexCache;
}) {
  return (
    <group>
      {/* Estantes */}
      {SHELVES.map((shelf) => {
        const shelfTopics = shelf.ids
          .map((id) => topics.find((t) => t.id === id))
          .filter(Boolean) as Topic[];
        return (
          <BookcaseShelf
            key={shelf.num}
            shelf={shelf}
            topics={shelfTopics}
            onBookClick={onBookClick}
            tex={tex}
          />
        );
      })}
    </group>
  );
}

// ============== SCENE INNER ==============
function SceneInner({
  onSelect,
}: {
  onSelect: (s: { topic: Topic; book: Book } | null) => void;
}) {
  const [tex, setTex] = useState<TexCache | null>(null);

  useEffect(() => {
    setTex(buildTextureCache());
  }, []);

  return (
    <>
      <fog attach="fog" args={["#4A3624", 30, 50]} />

      {/* Ambient cálido (candlelight) */}
      <ambientLight intensity={1.2} color="#FFE5B5" />

      {/* Luz cálida cenital (luz que entra de vitrales) */}
      <directionalLight
        position={[0, 12, 0]}
        intensity={1.3}
        color="#FFE5B5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light frontal (ilumina los libros del librero) */}
      <pointLight
        position={[0, 1.5, 5]}
        intensity={1.5}
        color="#FFD8A0"
        distance={10}
        decay={1.5}
      />

      {tex && (
        <>
          <Room tex={tex} />

          {/* Columnas de mármol (4) */}
          <MarbleColumn position={[-8, 0, -4]} />
          <MarbleColumn position={[8, 0, -4]} />
          <MarbleColumn position={[-8, 0, 4]} />
          <MarbleColumn position={[8, 0, 4]} />

          {/* Librero de múltiples niveles con paneles de madera */}
          <Bookcase topics={TOPICS} onBookClick={(t, b) => onSelect({ topic: t, book: b })} tex={tex} />

          {/* Mesa larga de lectura con 2 lamps banker's */}
          <ReadingTable tex={tex.woodPanel} />
          <BankersLamp position={[-2, 0.81, 2.3]} />
          <BankersLamp position={[2, 0.81, 2.3]} />

          {/* Sillones de cuero chesterfield */}
          <LeatherChair position={[-1.2, 0, 4.5]} rotation={[0, Math.PI, 0]} />
          <LeatherChair position={[1.2, 0, 4.5]} rotation={[0, Math.PI, 0]} />

          {/* Candelabros de bronce */}
          <Chandelier position={[-3, 6.8, 1]} scale={0.9} />
          <Chandelier position={[3, 6.8, 1]} scale={0.9} />
          <Chandelier position={[0, 6.8, 4.5]} scale={1.0} />

          {/* Alfombra bajo la mesa */}
          <Rug position={[0, 0.005, 2.5]} tex={tex} />

          {/* Busto removido */}

          {/* 🏛️ Estatua ecuestre de Marco Aurelio (réplica con primitivos) */}
          <MarcusAureliusStatue position={[7, 0, 1]} />

          {/* Globo terráqueo */}
          <Globe position={[6, 0, 5.5]} tex={tex} />

          {/* Retrato al óleo removido — reemplazado por galería de genios */}

          {/* Reloj de pared */}
          <WallClock position={[-9, 4, -6.9]} tex={tex} />

          {/* 🏛️ GALERÍA: 3 universidades (crests heráldicos) — fila superior, lejos de ventanas (x=±3) */}
          {UNIVERSITIES.map((u, i) => (
            <UniversityCrest
              key={u.id}
              university={u}
              position={[-6 + i * 6, 6.3, -6.9]}
            />
          ))}

          {/* Cuadros de genios removidos */}

          {/* Detalles en la mesa */}
          <OpenBook position={[-1, 0.86, 2.5]} tex={tex} />
          <OpenBook position={[1, 0.86, 2.5]} tex={tex} />
          <ReadingGlasses position={[-0.5, 0.88, 2.5]} tex={tex} />
          <CoffeeCup position={[0.5, 0.88, 2.5]} tex={tex} />

          {/* Plantas removidas */}

          {/* Polvo dorado en el aire */}
          {/* DustMotes removido — partículas flotantes que calentaban el dispositivo */}
        </>
      )}

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.5}
        scale={20}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#0A0500"
      />
    </>
  );
}

// ============== MAIN EXPORT ==============
export default function Scene({
  onSelect,
  isMobile = false,
}: {
  onSelect: (s: { topic: Topic; book: Book } | null) => void;
  isMobile?: boolean;
}) {
  const [tex, setTex] = useState<TexCache | null>(null);

  useEffect(() => {
    setTex(buildTextureCache());
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 2.6,
      }}
      camera={{
        position: isMobile ? [0, 2.2, 17] : [0, 3.5, 16],
        fov: isMobile ? 56 : 55,
        near: 0.1,
        far: 100,
      }}
    >
      <color attach="background" args={["#3D2818"]} />
      <Suspense fallback={null}>
        {tex ? (
          <SceneInner onSelect={onSelect} />
        ) : (
          <ambientLight intensity={0.3} />
        )}
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={22}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.0}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, 2.5, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
