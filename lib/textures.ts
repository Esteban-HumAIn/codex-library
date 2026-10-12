"use client";

import * as THREE from "three";

// ============================================================
// Procedural Texture Generators — for cozy realistic library
// Uses HTMLCanvas to bake subtle details that would otherwise
// need external assets (kept fully offline, zero deps)
// ============================================================

type Opts = {
  width?: number;
  height?: number;
};

/** 0-1 deterministic noise from x,y */
function noise2(x: number, y: number, seed: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

function fbm(x: number, y: number, seed: number, octaves = 4) {
  let v = 0,
    amp = 0.5,
    freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * noise2(x * freq, y * freq, seed + i);
    freq *= 2;
    amp *= 0.5;
  }
  return v;
}

// ============================================================
// WOOD GRAIN — dark walnut / oak with rings + grain noise
// ============================================================
export function makeWoodTexture(
  base: string = "#5A3A1F",
  ring: string = "#3A2410",
  opts: Opts = {}
) {
  const W = opts.width ?? 512;
  const H = opts.height ?? 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // Base color
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const baseRGB = hexToRgb(base);
  const ringRGB = hexToRgb(ring);

  // Draw vertical grain lines (fbm)
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      // Grain
      const grain = fbm(u * 8, v * 80, 1);
      // Distortion
      const distort = fbm(u * 3, v * 5, 7) * 0.3;
      // Rings (very subtle, large)
      const ringDist =
        Math.abs(Math.sin((v + distort) * 14 + fbm(u, v, 13) * 1.5));
      const ringMask = Math.pow(ringDist, 18) * 0.5;

      // Mix
      const t = grain * 0.4 + ringMask;
      const r = baseRGB.r * (1 - t) + ringRGB.r * t;
      const g = baseRGB.g * (1 - t) + ringRGB.g * t;
      const b = baseRGB.b * (1 - t) + ringRGB.b * t;
      const i = (y * W + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Knots (a few)
  for (let i = 0; i < 4; i++) {
    const kx = noise2(i, 99, 1) * W;
    const ky = noise2(i, 7, 1) * H;
    const kr = 8 + noise2(i, 3, 1) * 14;
    const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
    grad.addColorStop(0, "#1A0E04");
    grad.addColorStop(0.5, "#2A1A08");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ============================================================
// BOOK LEATHER — colored leather with subtle grain
// ============================================================
export function makeLeatherTexture(color: string, seed: number) {
  const W = 256;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  const baseRGB = hexToRgb(color);
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const grain = fbm(u * 30, v * 30, seed);
      const spots = fbm(u * 80, v * 80, seed + 50);
      const t = (grain - 0.5) * 0.4 + (spots - 0.5) * 0.2;
      const i = (y * W + x) * 4;
      img.data[i] = clamp(baseRGB.r + t * 60, 0, 255);
      img.data[i + 1] = clamp(baseRGB.g + t * 60, 0, 255);
      img.data[i + 2] = clamp(baseRGB.b + t * 40, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  // Frame (gold border if seed % 3 == 0)
  if (seed % 3 === 0) {
    ctx.strokeStyle = "rgba(218, 165, 32, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 30, W - 40, H - 60);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ============================================================
// GOLD LETTERING / decoration strip (thin canvas)
// ============================================================
export function makeGoldTextTexture(text: string) {
  const W = 256;
  const H = 64;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1A0E04";
  ctx.fillRect(0, 0, W, H);

  // Ornament line
  ctx.fillStyle = "#B8860B";
  ctx.fillRect(0, 4, W, 1);
  ctx.fillRect(0, H - 5, W, 1);

  // Text
  ctx.fillStyle = "#DAA520";
  ctx.font = "italic 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, H / 2);

  // Decorative dots
  ctx.fillStyle = "#B8860B";
  ctx.beginPath();
  ctx.arc(20, H / 2, 2, 0, Math.PI * 2);
  ctx.arc(W - 20, H / 2, 2, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ============================================================
// PAPER — cream aged paper with subtle noise
// ============================================================
export function makePaperTexture(tint: string = "#F5E8C8") {
  const W = 256;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);

  const baseRGB = hexToRgb(tint);
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const n = fbm(u * 4, v * 4, 9) - 0.5;
      const t = n * 0.15;
      const i = (y * W + x) * 4;
      img.data[i] = clamp(baseRGB.r + t * 30, 0, 255);
      img.data[i + 1] = clamp(baseRGB.g + t * 30, 0, 255);
      img.data[i + 2] = clamp(baseRGB.b + t * 25, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  // Stain spots
  for (let i = 0; i < 6; i++) {
    const x = noise2(i, 22, 1) * W;
    const y = noise2(i, 33, 1) * H;
    const r = 4 + noise2(i, 4, 1) * 8;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(120, 80, 40, 0.2)");
    grad.addColorStop(1, "rgba(120, 80, 40, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// ============================================================
// FABRIC (velvet) — for armchair
// ============================================================
export function makeFabricTexture(base: string) {
  const W = 256;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const baseRGB = hexToRgb(base);
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      // Diagonal weave
      const weave =
        Math.sin((u + v) * 60) * 0.5 + Math.cos((u - v) * 60) * 0.5;
      const n = fbm(u * 16, v * 16, 5) - 0.5;
      const t = weave * 0.1 + n * 0.2;
      const i = (y * W + x) * 4;
      img.data[i] = clamp(baseRGB.r + t * 40, 0, 255);
      img.data[i + 1] = clamp(baseRGB.g + t * 40, 0, 255);
      img.data[i + 2] = clamp(baseRGB.b + t * 35, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 4;
  return tex;
}

// ============================================================
// PERSIAN RUG — central medallion + border
// ============================================================
export function makeRugTexture() {
  const W = 1024;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // Background deep red
  ctx.fillStyle = "#5A0E0E";
  ctx.fillRect(0, 0, W, H);

  // Fbm overlay
  const img = ctx.getImageData(0, 0, W, H);
  const baseRGB = hexToRgb("#5A0E0E");
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const n = fbm(u * 30, v * 30, 11) - 0.5;
      const t = n * 0.15;
      const i = (y * W + x) * 4;
      img.data[i] = clamp(baseRGB.r + t * 50, 0, 255);
      img.data[i + 1] = clamp(baseRGB.g + t * 30, 0, 255);
      img.data[i + 2] = clamp(baseRGB.b + t * 30, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  const cx = W / 2;
  const cy = H / 2;

  // Outer border (gold)
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 20;
  ctx.strokeRect(50, 50, W - 100, H - 100);
  ctx.strokeStyle = "#8B6508";
  ctx.lineWidth = 4;
  ctx.strokeRect(80, 80, W - 160, H - 160);

  // Inner border (geometric pattern)
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 2;
  for (let i = 0; i < 80; i++) {
    const t = i / 80;
    const x = 80 + t * (W - 160);
    ctx.beginPath();
    ctx.moveTo(x, 70);
    ctx.lineTo(x + 8, 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, H - 70);
    ctx.lineTo(x + 8, H - 90);
    ctx.stroke();
  }

  // Central medallion (8-pointed star)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#1F4A1F";
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 === 0 ? 200 : 100;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner medallion
  ctx.fillStyle = "#5A0E0E";
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Corner motifs
  ctx.restore();
  for (const [x, y] of [
    [180, 180],
    [W - 180, 180],
    [180, H - 180],
    [W - 180, H - 180],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#1F4A1F";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = i % 2 === 0 ? 60 : 30;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#DAA520";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Pattern field (small dots/diamonds)
  for (let i = 0; i < 200; i++) {
    const x = 150 + noise2(i, 5, 1) * (W - 300);
    const y = 150 + noise2(i, 6, 1) * (H - 300);
    // Skip if near medallion
    const d = Math.hypot(x - cx, y - cy);
    if (d < 220) continue;
    ctx.fillStyle = noise2(i, 7, 1) > 0.5 ? "#DAA520" : "#1F4A1F";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ============================================================
// WALL PAINT — slight texture
// ============================================================
export function makeWallTexture(base: string = "#E5D3A8") {
  const W = 256;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const baseRGB = hexToRgb(base);
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const n = fbm(u * 8, v * 8, 17) - 0.5;
      const t = n * 0.12;
      const i = (y * W + x) * 4;
      img.data[i] = clamp(baseRGB.r + t * 30, 0, 255);
      img.data[i + 1] = clamp(baseRGB.g + t * 30, 0, 255);
      img.data[i + 2] = clamp(baseRGB.b + t * 25, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = 4;
  return tex;
}

// ============================================================
// BRASS — warm metallic noise
// ============================================================
export function makeBrassTexture() {
  const W = 128;
  const H = 128;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#B5894C";
  ctx.fillRect(0, 0, W, H);

  const baseRGB = hexToRgb("#B5894C");
  const img = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const n = fbm(u * 20, v * 20, 21) - 0.5;
      const t = n * 0.3;
      const i = (y * W + x) * 4;
      img.data[i] = clamp(baseRGB.r + t * 50, 0, 255);
      img.data[i + 1] = clamp(baseRGB.g + t * 50, 0, 255);
      img.data[i + 2] = clamp(baseRGB.b + t * 40, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// ============================================================
// WINDOW VIEW — gradient sky with trees
// ============================================================
export function makeWindowView() {
  const W = 512;
  const H = 768;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  grad.addColorStop(0, "#1E3A5F");
  grad.addColorStop(0.5, "#4A6B8A");
  grad.addColorStop(1, "#A8B5C8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.6);

  // Moon
  ctx.fillStyle = "#F0E4C8";
  ctx.shadowColor = "#FFE5B0";
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.arc(W * 0.7, H * 0.2, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stars
  for (let i = 0; i < 30; i++) {
    const x = noise2(i, 11, 1) * W;
    const y = noise2(i, 22, 1) * H * 0.4;
    const r = 0.5 + noise2(i, 33, 1) * 1.5;
    ctx.fillStyle = "#FFE5B0";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mountains
  ctx.fillStyle = "#2A3A4A";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.5);
  ctx.lineTo(W * 0.2, H * 0.4);
  ctx.lineTo(W * 0.4, H * 0.45);
  ctx.lineTo(W * 0.6, H * 0.38);
  ctx.lineTo(W * 0.8, H * 0.42);
  ctx.lineTo(W, H * 0.5);
  ctx.lineTo(W, H * 0.6);
  ctx.lineTo(0, H * 0.6);
  ctx.closePath();
  ctx.fill();

  // Trees
  ctx.fillStyle = "#1A2A1A";
  for (let i = 0; i < 12; i++) {
    const x = (i / 12) * W + noise2(i, 44, 1) * 20;
    const y = H * 0.55 + noise2(i, 55, 1) * 30;
    const h = 80 + noise2(i, 66, 1) * 60;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 15, y + h);
    ctx.lineTo(x + 15, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = "#3A2A1A";
  ctx.fillRect(0, H * 0.65, W, H * 0.35);

  // Snow patches
  ctx.fillStyle = "rgba(245, 240, 220, 0.3)";
  for (let i = 0; i < 20; i++) {
    const x = noise2(i, 77, 1) * W;
    const y = H * 0.7 + noise2(i, 88, 1) * H * 0.2;
    const r = 5 + noise2(i, 99, 1) * 10;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================
// HERRINGBONE WOOD FLOOR · parquet pattern (Oxford/Harvard libraries)
// ============================================================
export function makeHerringboneTexture() {
  const W = 1024;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#3D2817";
  ctx.fillRect(0, 0, W, H);

  const plankW = 64;
  const plankH = 16;
  // Patrón herringbone
  for (let row = 0; row < H / plankW; row++) {
    for (let col = 0; col < W / plankH; col++) {
      const x = col * plankH;
      const y = row * plankW;
      // Cada “L” son 2 planks a 90°
      const offset = (row % 2) * (plankH * 2);
      const p1x = x + offset;
      const p1y = y;
      const p2x = x;
      const p2y = y + plankW;
      // Color de la plank con variación
      const shade = 0.85 + Math.random() * 0.3;
      const r = Math.floor(92 * shade);
      const g = Math.floor(58 * shade);
      const b = Math.floor(30 * shade);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      // Plank horizontal
      ctx.save();
      ctx.translate(p1x + plankH / 2, p1y + plankW / 2);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-plankH / 2, -plankW / 2 - 1, plankH, plankW + 2);
      ctx.restore();
      // Plank vertical
      ctx.save();
      ctx.translate(p2x + plankH / 2, p2y + plankW / 2);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-plankH / 2, -plankW / 2 - 1, plankH, plankW + 2);
      ctx.restore();
      // Línea oscura de separación
      ctx.strokeStyle = "rgba(20, 10, 5, 0.6)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(p1x, p1y, plankH, plankW);
      ctx.strokeRect(p2x, p2y, plankH, plankW);
      // Veta sutil
      ctx.strokeStyle = "rgba(60, 35, 18, 0.25)";
      ctx.lineWidth = 0.4;
      for (let v = 0; v < 3; v++) {
        ctx.beginPath();
        ctx.moveTo(p1x + Math.random() * plankH, p1y);
        ctx.lineTo(p1x + Math.random() * plankH, p1y + plankW);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// ============================================================
// OAK PANEL TEXTURE · vertical wood paneling (Oxford/Harvard walls)
// ============================================================
export function makeOakPanelTexture() {
  const W = 512;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#2A1A0E";
  ctx.fillRect(0, 0, W, H);

  const panelW = 80;
  const numPanels = W / panelW;
  for (let i = 0; i < numPanels; i++) {
    const x = i * panelW;
    // Color base con variación
    const shade = 0.85 + Math.random() * 0.25;
    const r = Math.floor(60 * shade);
    const g = Math.floor(38 * shade);
    const b = Math.floor(20 * shade);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x + 2, 0, panelW - 4, H);
    // Vetas verticales
    ctx.strokeStyle = "rgba(30, 18, 10, 0.4)";
    ctx.lineWidth = 0.5;
    for (let v = 0; v < 8; v++) {
      ctx.beginPath();
      const vx = x + 4 + Math.random() * (panelW - 8);
      ctx.moveTo(vx, 0);
      ctx.bezierCurveTo(
        vx + (Math.random() - 0.5) * 6, H * 0.3,
        vx + (Math.random() - 0.5) * 6, H * 0.7,
        vx + (Math.random() - 0.5) * 4, H
      );
      ctx.stroke();
    }
    // Borde del panel (línea oscura vertical)
    ctx.strokeStyle = "rgba(15, 8, 3, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  // Moldura horizontal superior (cornice)
  ctx.fillStyle = "#1A0A05";
  ctx.fillRect(0, 0, W, 8);
  // Zócalo inferior
  ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = "#0A0500";
  ctx.fillRect(0, H - 8, W, 8);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ============================================================
// WHITE MARBLE TEXTURE · Carrara-style with subtle gray veining
// Used for library floor to harmonize with bright "Elegant Bright Library" backdrop
// ============================================================
export function makeWhiteMarbleTexture() {
  const W = 1024;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // Base white/cream gradient (subtle warmth, not pure white)
  const gradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  gradient.addColorStop(0, "#FAFAF6");
  gradient.addColorStop(0.5, "#F2F0E8");
  gradient.addColorStop(1, "#E8E5DC");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Subtle cloudy patches (light beige/gray)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 80 + Math.random() * 180;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(220, 215, 200, ${0.15 + Math.random() * 0.15})`);
    g.addColorStop(1, "rgba(220, 215, 200, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gray veins (the iconic Carrara marble look)
  // Main diagonal vein
  ctx.strokeStyle = "rgba(120, 115, 105, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  let x = 0, y = 200;
  while (x < W) {
    x += 20 + Math.random() * 40;
    y += 8 + (Math.random() - 0.3) * 30;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Secondary veins (random branches)
  for (let v = 0; v < 6; v++) {
    ctx.strokeStyle = `rgba(${100 + Math.random() * 40}, ${95 + Math.random() * 35}, ${85 + Math.random() * 30}, ${0.2 + Math.random() * 0.2})`;
    ctx.lineWidth = 0.8 + Math.random() * 1.2;
    ctx.beginPath();
    const startX = Math.random() * W;
    const startY = Math.random() * H;
    ctx.moveTo(startX, startY);
    let cx = startX, cy = startY;
    const steps = 8 + Math.floor(Math.random() * 12);
    for (let s = 0; s < steps; s++) {
      cx += (Math.random() - 0.5) * 80;
      cy += (Math.random() - 0.5) * 80;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Subtle micro-veins (very thin, sparse)
  for (let v = 0; v < 20; v++) {
    ctx.strokeStyle = `rgba(140, 135, 125, ${0.1 + Math.random() * 0.15})`;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    const startX = Math.random() * W;
    const startY = Math.random() * H;
    ctx.moveTo(startX, startY);
    const angle = Math.random() * Math.PI * 2;
    const length = 50 + Math.random() * 200;
    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
    ctx.stroke();
  }

  // Tile grid (subtle, 4x4 squares) — for that "marble slab" feel
  const tileSize = W / 4;
  ctx.strokeStyle = "rgba(180, 175, 165, 0.4)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(W, i * tileSize);
    ctx.stroke();
  }

  // Add subtle shadow at tile edges
  ctx.strokeStyle = "rgba(200, 195, 185, 0.3)";
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize + 1, 0);
    ctx.lineTo(i * tileSize + 1, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * tileSize + 1);
    ctx.lineTo(W, i * tileSize + 1);
    ctx.stroke();
  }

  // Fine grain noise for realism
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 8;
  return tex;
}

// ============================================================
// HELPERS
// ============================================================
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
