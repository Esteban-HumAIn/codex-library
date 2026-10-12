"use client";

import { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { TOPICS, SHELVES, type Book, type Topic } from "@/lib/data";
import {
  makeWoodTexture,
  makeLeatherTexture,
  makeGoldTextTexture,
  makePaperTexture,
  makeFabricTexture,
  makeRugTexture,
  makeWallTexture,
  makeWindowView,
} from "@/lib/textures";

export const SCENE_TOPICS = TOPICS;
export const SCENE_SHELVES = SHELVES;

const COLORS: Record<string, string> = {
  fisica: "#8B2A1A",
  matematicas: "#1E3A6E",
  biologia: "#1F5C2E",
  economia: "#9A6F1A",
  filosofia: "#5C2A8E",
  computacion: "#0A5A6E",
  historia: "#7A2A0E",
  psicologia: "#8E1F4F",
  sistemas: "#3A4A5A",
};

const TOPIC_TINTS: Record<string, string> = {
  fisica: "#A04020",
  matematicas: "#2A4F8A",
  biologia: "#2A7040",
  economia: "#B8902A",
  filosofia: "#7A3AAD",
  computacion: "#1A6A7E",
  historia: "#9A4020",
  psicologia: "#A82A60",
  sistemas: "#4A5A6A",
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function bookWidth(book: Book) {
  return 0.32 + ((hash(book.id) * 3) % 14) / 100;
}
function bookHeight(book: Book) {
  return 1.8 + ((hash(book.id) * 5) % 50) / 100;
}
function bookTilt(book: Book) {
  return (((hash(book.id) * 7) % 7) - 3) * 0.008;
}

// ============================================================
// TEXTURE CACHE — single source, generated once on mount
// ============================================================
type TexCache = {
  woodDark: THREE.Texture;
  woodMed: THREE.Texture;
  woodLight: THREE.Texture;
  woodTop: THREE.Texture;
  fabricRed: THREE.Texture;
  fabricDark: THREE.Texture;
  paper: THREE.Texture;
  paperCream: THREE.Texture;
  wallTex: THREE.Texture;
  rug: THREE.Texture;
  winView: THREE.Texture;
  leathers: Record<string, THREE.Texture>;
  woodBust: THREE.Texture;
};

let _cache: TexCache | null = null;
function buildTextureCache(): TexCache {
  if (_cache) return _cache;
  const woodDark = makeWoodTexture("#3A2412", "#1A0E04");
  const woodMed = makeWoodTexture("#5A3A1F", "#2A1A08");
  const woodLight = makeWoodTexture("#6F5436", "#3A2410");
  const woodTop = makeWoodTexture("#8B6F47", "#4A2E1A");
  const woodBust = makeWoodTexture("#4A2E1A", "#1A0E04");
  const fabricRed = makeFabricTexture("#5A1F0E");
  const fabricDark = makeFabricTexture("#3A1A0A");
  const paper = makePaperTexture("#F5E8C8");
  const paperCream = makePaperTexture("#EFE3C8");
  const wallTex = makeWallTexture("#D8C49A");
  const rug = makeRugTexture();
  const winView = makeWindowView();
  const leathers: Record<string, THREE.Texture> = {};
  Object.keys(COLORS).forEach((k, i) => {
    leathers[k] = makeLeatherTexture(COLORS[k], i * 7 + 1);
  });
  _cache = {
    woodDark,
    woodMed,
    woodLight,
    woodTop,
    woodBust,
    fabricRed,
    fabricDark,
    paper,
    paperCream,
    wallTex,
    rug,
    winView,
    leathers,
  };
  return _cache;
}

// ============================================================
// BOOK MESH — spine leather + page block + raised bands + gold text
// ============================================================
function BookMesh({
  book,
  topic,
  position,
  onClick,
  tex,
}: {
  book: Book;
  topic: Topic;
  position: [number, number, number];
  onClick: () => void;
  tex: TexCache;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const w = bookWidth(book);
  const h = bookHeight(book);
  const d = 0.22;
  const tilt = bookTilt(book);
  const seed = hash(book.id);

  const goldTex = useMemo(
    () => makeGoldTextTexture(book.title.substring(0, 14)),
    [book.id]
  );
  const leather = tex.leathers[topic.id] || tex.leathers.sistemas;
  const tinted = TOPIC_TINTS[topic.id] || "#5A3A1F";

  useFrame((state) => {
    if (!ref.current) return;
    const target = hovered ? 0.35 : 0;
    const tiltTarget = hovered ? -0.5 : tilt;
    const t = state.clock.getElapsedTime();
    const wobble = Math.sin(t * 0.5 + position[0]) * 0.002;

    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      position[1] + target,
      0.12
    );
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      tiltTarget + wobble,
      0.12
    );
  });

  return (
    <group position={position}>
      <group
        ref={ref}
        rotation={[0, tilt, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        {/* Main spine (leather texture) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            map={leather}
            color={tinted}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>

        {/* Top page block */}
        <mesh position={[0, h / 2 + 0.002, 0]}>
          <boxGeometry args={[w * 0.94, 0.005, d * 0.88]} />
          <meshStandardMaterial map={tex.paper} color="#F5E8C8" roughness={0.95} />
        </mesh>
        {/* Bottom page block */}
        <mesh position={[0, -h / 2 - 0.001, 0]}>
          <boxGeometry args={[w * 0.94, 0.003, d * 0.88]} />
          <meshStandardMaterial map={tex.paper} color="#E8D8B0" roughness={0.95} />
        </mesh>

        {/* Raised bands on spine (4 horizontal lines) */}
        {[0.3, 0.1, -0.1, -0.3].map((y, i) => (
          <mesh key={i} position={[0, y * h, d / 2 + 0.003]}>
            <boxGeometry args={[w * 0.96, 0.012, 0.008]} />
            <meshStandardMaterial color="#000" roughness={0.9} />
          </mesh>
        ))}

        {/* Gold text label on spine (top section) */}
        <mesh position={[0, h * 0.18, d / 2 + 0.004]}>
          <planeGeometry args={[w * 0.7, h * 0.18]} />
          <meshStandardMaterial
            map={goldTex}
            transparent
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>

        {/* Author gold line (bottom section) */}
        <mesh position={[0, -h * 0.18, d / 2 + 0.004]}>
          <planeGeometry args={[w * 0.5, h * 0.06]} />
          <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* JADES pick ribbon */}
        {book.jades_pick && (
          <>
            <mesh position={[w / 2 - 0.025, h * 0.15, d / 2 + 0.005]}>
              <boxGeometry args={[0.05, 0.22, 0.005]} />
              <meshStandardMaterial color="#DAA520" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[w / 2 - 0.025, h * 0.5, d / 2 + 0.005]}>
              <boxGeometry args={[0.05, 0.012, 0.005]} />
              <meshStandardMaterial color="#DAA520" metalness={0.6} roughness={0.35} />
            </mesh>
          </>
        )}

        {/* Loose page (subtle decoration) */}
        {((seed * 11) % 7) / 1000 > 0.003 && (
          <mesh position={[w * 0.4, h * 0.4, -d / 2 - 0.001]}>
            <planeGeometry args={[0.06, 0.08]} />
            <meshStandardMaterial color="#F5E8C8" roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// ============================================================
// BOOKCASE SHELF
// ============================================================
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
    return 4.5 - idx * 2.0;
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
      {/* Shelf plank */}
      <mesh position={[0, shelfY, 0]} castShadow receiveShadow>
        <boxGeometry args={[totalWidth + 0.6, 0.14, 0.7]} />
        <meshStandardMaterial map={tex.woodMed} color="#6F5436" roughness={0.7} />
      </mesh>
      {/* Shelf front edge molding */}
      <mesh position={[0, shelfY - 0.05, 0.36]} castShadow>
        <boxGeometry args={[totalWidth + 0.6, 0.06, 0.04]} />
        <meshStandardMaterial map={tex.woodMed} color="#5A3A1F" roughness={0.7} />
      </mesh>
      {/* Books */}
      {bookPositions.map(({ book, topic, pos }) => (
        <BookMesh
          key={book.id}
          book={book}
          topic={topic}
          position={pos}
          onClick={() => onBookClick(topic, book)}
          tex={tex}
        />
      ))}
    </group>
  );
}

// ============================================================
// ORNAMENTS
// ============================================================
function Globe({ position }: { position: [number, number, number] }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#1E40AF";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#15803D";
    for (let i = 0; i < 8; i++) {
      const x = 40 + (i * 31) % 180;
      const y = 40 + (i * 47) % 180;
      const r = 20 + (i * 13) % 30;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * 256) / 8);
      ctx.lineTo(256, (i * 256) / 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((i * 256) / 8, 0);
      ctx.lineTo((i * 256) / 8, 256);
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 24]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.012, 8, 32]} />
        <meshStandardMaterial color="#B5894C" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.012, 8, 32]} />
        <meshStandardMaterial color="#B5894C" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.3, 12]} />
        <meshStandardMaterial color="#8B6633" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.04, 16]} />
        <meshStandardMaterial color="#8B6633" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Vase({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.4, 24]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.3} metalness={0.4} />
      </mesh>
      {[
        { x: 0, y: 0.65, c: "#E89B7A", h: 0.4 },
        { x: 0.12, y: 0.55, c: "#F8B4B4", h: 0.3 },
        { x: -0.12, y: 0.55, c: "#FFD4A8", h: 0.3 },
        { x: 0.06, y: 0.72, c: "#C94040", h: 0.45 },
        { x: -0.08, y: 0.62, c: "#FFE4B5", h: 0.35 },
      ].map((f, i) => (
        <group key={i}>
          <mesh position={[f.x, f.y - f.h / 2 - 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, f.h, 6]} />
            <meshStandardMaterial color="#4A6B2C" />
          </mesh>
          <mesh position={[f.x, f.y, 0]} castShadow>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color={f.c} roughness={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Hourglass({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.025, 16]} />
        <meshStandardMaterial color="#B5894C" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.025, 16]} />
        <meshStandardMaterial color="#B5894C" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshStandardMaterial color="#B5894C" metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <coneGeometry args={[0.13, 0.22, 16]} />
        <meshStandardMaterial color="#DAA520" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.13, 0.22, 16]} />
        <meshStandardMaterial color="#DAA520" roughness={0.5} />
      </mesh>
    </group>
  );
}

function BookStack({ position }: { position: [number, number, number] }) {
  const colors = ["#6B3410", "#1E3A5F", "#5A1F1F", "#4A6B2C", "#B8860B"];
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <mesh
          key={i}
          position={[i * 0.04 - 0.08, i * 0.13, i * 0.01]}
          castShadow
        >
          <boxGeometry args={[0.7 - i * 0.04, 0.13, 0.22 - i * 0.01]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Telescope({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, -0.3]}>
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.25, 0]}
          rotation={[0, 0, x * 0.5]}
          castShadow
        >
          <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
          <meshStandardMaterial color="#5A3F22" />
        </mesh>
      ))}
      <mesh position={[0, 0.55, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 16]} />
        <meshStandardMaterial color="#4A2208" roughness={0.65} metalness={0.3} />
      </mesh>
      <mesh position={[-0.28, 0.55, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.062, 0.062, 0.01, 16]} />
        <meshStandardMaterial color="#1A0E04" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ============================================================
// BOOKCASE 3D
// ============================================================
function Bookcase({
  topics,
  onBookClick,
  tex,
}: {
  topics: Topic[];
  onBookClick: (topic: Topic, book: Book) => void;
  tex: TexCache;
}) {
  const W = 8.5;
  const H = 7.0;
  const D = 1.2;

  return (
    <group position={[0, 0, -0.5]}>
      {/* Back panel */}
      <mesh position={[0, 3.5, -D / 2 + 0.05]} receiveShadow>
        <boxGeometry args={[W - 0.2, H - 0.2, 0.05]} />
        <meshStandardMaterial map={tex.woodMed} color="#A67852" roughness={0.8} />
      </mesh>
      {/* Subtle warm wash on back panel (museum-light effect) */}
      <mesh position={[0, 3.5, -D / 2 + 0.12]}>
        <planeGeometry args={[W - 0.4, H - 0.4]} />
        <meshBasicMaterial color="#FFD78A" transparent opacity={0.12} />
      </mesh>

      {/* Top crown molding (multi-layer) */}
      <mesh position={[0, H + 0.1, 0]} castShadow>
        <boxGeometry args={[W + 0.4, 0.3, D + 0.3]} />
        <meshStandardMaterial map={tex.woodTop} color="#D4A878" roughness={0.5} />
      </mesh>
      <mesh position={[0, H - 0.05, 0]} castShadow>
        <boxGeometry args={[W + 0.2, 0.15, D + 0.15]} />
        <meshStandardMaterial map={tex.woodTop} color="#E0B888" roughness={0.5} />
      </mesh>
      {/* Dentil molding */}
      {Array.from({ length: 18 }).map((_, i) => {
        const x = -W / 2 + 0.3 + i * ((W - 0.6) / 17);
        return (
          <mesh key={i} position={[x, H + 0.27, D / 2 + 0.15]} castShadow>
            <boxGeometry args={[0.05, 0.12, 0.04]} />
            <meshStandardMaterial color="#A67852" roughness={0.7} />
          </mesh>
        );
      })}

      {/* Top platform */}
      <mesh position={[0, H + 0.55, 0]} receiveShadow>
        <boxGeometry args={[W + 0.4, 0.1, D + 0.3]} />
        <meshStandardMaterial map={tex.woodMed} color="#C8A070" roughness={0.55} />
      </mesh>

      {/* Pediment */}
      <mesh position={[0, H + 1.0, 0]} castShadow>
        <coneGeometry args={[0.5, 0.6, 3]} />
        <meshStandardMaterial color="#B8860B" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, H + 1.0, 0]} castShadow>
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial color="#DAA520" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-(W + 0.1) / 2, 3.5, 0]} castShadow>
        <boxGeometry args={[0.25, H - 0.5, D + 0.2]} />
        <meshStandardMaterial map={tex.woodMed} color="#B88860" roughness={0.55} />
      </mesh>
      <mesh position={[(W + 0.1) / 2, 3.5, 0]} castShadow>
        <boxGeometry args={[0.25, H - 0.5, D + 0.2]} />
        <meshStandardMaterial map={tex.woodMed} color="#B88860" roughness={0.55} />
      </mesh>
      {/* Panel insets */}
      {[-1, 1].map((s) =>
        [0, 1, 2].map((idx) => (
          <mesh
            key={`${s}-${idx}`}
            position={[s * ((W + 0.1) / 2 + 0.01), 1.0 + idx * 2.0, 0]}
            rotation={[0, s * (Math.PI / 2), 0]}
          >
            <planeGeometry args={[0.7, 1.6]} />
            <meshStandardMaterial color="#5A3A1F" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Base + plinth */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[W + 0.2, 0.4, D + 0.2]} />
        <meshStandardMaterial map={tex.woodMed} color="#9A7048" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[W + 0.4, 0.1, D + 0.4]} />
        <meshStandardMaterial map={tex.woodDark} color="#6A4422" roughness={0.7} />
      </mesh>

      {/* Feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(W / 2 + 0.1) * s, -0.5, 0]} castShadow>
          <boxGeometry args={[0.25, 0.15, D + 0.4]} />
          <meshStandardMaterial color="#6A4422" roughness={0.7} />
        </mesh>
      ))}

      {/* Ornaments on top */}
      <Vase position={[-3, H + 0.65, 0]} />
      <Globe position={[-1.2, H + 0.65, 0]} />
      <Hourglass position={[1.2, H + 0.65, 0]} />
      <Telescope position={[3.8, H + 0.65, 0]} />

      {/* BookStack movido al estante del medio (5 libros parados) */}
      <group position={[-2.5, 2.58, 0.15]}>
        {[
          { color: "#6B3410" },
          { color: "#1E3A5F" },
          { color: "#5A1F1F" },
          { color: "#4A6B2C" },
          { color: "#B8860B" },
        ].map((b, i) => (
          <mesh
            key={`bs-${i}`}
            position={[i * 0.34, 0.45, 0]}
            castShadow
          >
            <boxGeometry args={[0.3, 0.9, 0.22]} />
            <meshStandardMaterial color={b.color} roughness={0.5} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Shelves */}
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

// ============================================================
// ROOM
// ============================================================
function Room({ tex }: { tex: TexCache }) {
  return (
    <group>
      <mesh position={[0, 3.25, -7]} receiveShadow>
        <planeGeometry args={[24, 10.5]} />
        <meshStandardMaterial map={tex.wallTex} color="#D8C49A" roughness={0.95} />
      </mesh>
      <mesh position={[-12, 3.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 10.5]} />
        <meshStandardMaterial map={tex.wallTex} color="#D8C49A" roughness={0.95} />
      </mesh>
      <mesh position={[12, 3.25, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 10.5]} />
        <meshStandardMaterial map={tex.wallTex} color="#D8C49A" roughness={0.95} />
      </mesh>
      <mesh position={[0, 8.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#E8DCB8" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial
          map={tex.woodDark}
          color="#3A2412"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      {/* Wainscoting */}
      <mesh position={[0, 0.2, -6.95]} receiveShadow>
        <boxGeometry args={[24, 1.2, 0.06]} />
        <meshStandardMaterial map={tex.woodMed} color="#8B6F47" roughness={0.7} />
      </mesh>
      <mesh position={[-11.95, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[14, 1.2, 0.06]} />
        <meshStandardMaterial map={tex.woodMed} color="#8B6F47" roughness={0.7} />
      </mesh>
      <mesh position={[11.95, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[14, 1.2, 0.06]} />
        <meshStandardMaterial map={tex.woodMed} color="#8B6F47" roughness={0.7} />
      </mesh>
      {/* Crown molding (top) */}
      <mesh position={[0, 8.3, -6.95]} receiveShadow>
        <boxGeometry args={[24, 0.4, 0.1]} />
        <meshStandardMaterial map={tex.woodTop} color="#A67C52" roughness={0.7} />
      </mesh>
      <mesh position={[-11.95, 8.3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.4, 0.1]} />
        <meshStandardMaterial map={tex.woodTop} color="#A67C52" roughness={0.7} />
      </mesh>
      <mesh position={[11.95, 8.3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.4, 0.1]} />
        <meshStandardMaterial map={tex.woodTop} color="#A67C52" roughness={0.7} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0, -0.5, -6.95]} receiveShadow>
        <boxGeometry args={[24, 0.2, 0.04]} />
        <meshStandardMaterial color="#2A1A08" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ============================================================
// ARMCHAIR — cushions + tufting + fabric texture
// ============================================================
function Armchair({
  position,
  tex,
}: {
  position: [number, number, number];
  tex: TexCache;
}) {
  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 1.2]} />
        <meshStandardMaterial map={tex.fabricRed} color="#5A1F0E" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.3, 0.18, 1.05]} />
        <meshStandardMaterial map={tex.fabricRed} color="#6A2515" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0, -0.55]} castShadow>
        <boxGeometry args={[1.2, 1.0, 0.22]} />
        <meshStandardMaterial map={tex.fabricRed} color="#5A1F0E" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.0, -0.42]} castShadow>
        <boxGeometry args={[1.0, 0.8, 0.18]} />
        <meshStandardMaterial map={tex.fabricRed} color="#6A2515" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.6, 0.7, 0]} castShadow>
            <boxGeometry args={[0.18, 0.5, 1.0]} />
            <meshStandardMaterial map={tex.fabricRed} color="#5A1F0E" roughness={0.85} />
          </mesh>
          <mesh position={[s * 0.6, 0.95, 0]} castShadow>
            <boxGeometry args={[0.22, 0.05, 0.95]} />
            <meshStandardMaterial map={tex.fabricRed} color="#6A2515" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {[
        [-0.55, -0.05, 0.45],
        [0.55, -0.05, 0.45],
        [-0.55, -0.05, -0.45],
        [0.55, -0.05, -0.45],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.18, 8]} />
          <meshStandardMaterial color="#2A1404" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// SIDE TABLE + LAMP
// ============================================================
function SideTable({
  position,
  tex,
}: {
  position: [number, number, number];
  tex: TexCache;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.5]} />
        <meshStandardMaterial map={tex.woodMed} color="#8B6F47" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.82, 0.18, 0.42]} />
        <meshStandardMaterial map={tex.woodMed} color="#6F5436" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, 0.22]} castShadow>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshStandardMaterial color="#B5894C" metalness={0.85} roughness={0.25} />
      </mesh>
      {[
        [-0.4, 0.18, 0.2],
        [0.4, 0.18, 0.2],
        [-0.4, 0.18, -0.2],
        [0.4, 0.18, -0.2],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.025, 0.022, 0.4, 8]} />
          <meshStandardMaterial color="#6F5436" roughness={0.7} />
        </mesh>
      ))}
      <group position={[0, 0.55, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.04, 0.5, 12]} />
          <meshStandardMaterial color="#8B6633" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.04, 16]} />
          <meshStandardMaterial color="#8B6633" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.42, 0.2, 0.26]} />
          <meshStandardMaterial
            color="#1A4A1A"
            roughness={0.4}
            metalness={0.1}
            emissive="#1A4A1A"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, 0.5, 0.14]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 4]} />
          <meshStandardMaterial color="#B5894C" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.43, 0.14]}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshStandardMaterial color="#DAA520" metalness={0.7} roughness={0.3} />
        </mesh>
        <pointLight
          position={[0, 0.55, 0]}
          intensity={0.7}
          color="#FFE0A0"
          distance={5}
          decay={1.5}
        />
      </group>
    </group>
  );
}

// ============================================================
// PLANT
// ============================================================
function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.18, 0.4, 16]} />
        <meshStandardMaterial color="#B86A4A" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.02, 16]} />
        <meshStandardMaterial color="#2A1A08" roughness={1} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const r = 0.18;
        const h = 0.5 + (i % 3) * 0.12;
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 0.45 + h / 2, Math.sin(a) * r]}
            rotation={[
              (i % 2 === 0 ? 1 : -1) * 0.2,
              -a,
              (i % 2 === 0 ? 1 : -1) * 0.3,
            ]}
          >
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.1, 0.025]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#3A5A20" : "#4A6B2C"}
                roughness={0.75}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================
// BUST (Socrates) — more detailed
// ============================================================
function Bust({
  position,
  tex,
}: {
  position: [number, number, number];
  tex: TexCache;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.55]} />
        <meshStandardMaterial map={tex.woodBust} color="#4A2E1A" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.78, 0.08, 0.62]} />
        <meshStandardMaterial color="#5A3A1F" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 16]} />
        <meshStandardMaterial color="#D8C8A8" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.2, 12]} />
        <meshStandardMaterial color="#E8DCC0" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.35, -0.05]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.4]} />
        <meshStandardMaterial color="#E8DCC0" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.28, 20, 16]} />
        <meshStandardMaterial color="#E8DCC0" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.27, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8A7A5A" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.5, 0.22]} castShadow>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, Math.PI / 3, Math.PI * 0.6]} />
        <meshStandardMaterial color="#8A7A5A" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.62, 0.27]} castShadow>
        <coneGeometry args={[0.04, 0.08, 6]} />
        <meshStandardMaterial color="#E8DCC0" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.72, 0.22]} castShadow>
        <boxGeometry args={[0.18, 0.03, 0.06]} />
        <meshStandardMaterial color="#A89A7A" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ============================================================
// PERSIAN RUG (textured)
// ============================================================
function Rug({
  position,
  tex,
}: {
  position: [number, number, number];
  tex: TexCache;
}) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial map={tex.rug} roughness={0.85} />
    </mesh>
  );
}

// ============================================================
// OPEN BOOK ON STAND
// ============================================================
function OpenBook({ position }: { position: [number, number, number] }) {
  const tex = useMemo(() => makePaperTexture("#FAF3DC"), []);
  return (
    <group position={position} rotation={[0, Math.PI / 6, 0]}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.04]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.7} />
      </mesh>
      <mesh position={[-0.2, 0.35, 0.0]} rotation={[-0.15, 0, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.005, 0.5]} />
        <meshStandardMaterial map={tex} color="#FAF3DC" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.2, 0.35, 0.0]} rotation={[-0.15, 0, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.005, 0.5]} />
        <meshStandardMaterial map={tex} color="#FAF3DC" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {[-0.05, 0, 0.05, 0.1, -0.1, -0.15].map((z, i) => (
        <mesh key={i} position={[-0.2, 0.355, z]} rotation={[-0.15, 0, 0.1]}>
          <planeGeometry args={[0.32, 0.001]} />
          <meshStandardMaterial color="#3A2817" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[-0.05, 0, 0.05, 0.1, -0.1, -0.15].map((z, i) => (
        <mesh key={i} position={[0.2, 0.355, z]} rotation={[-0.15, 0, -0.1]}>
          <planeGeometry args={[0.32, 0.001]} />
          <meshStandardMaterial color="#3A2817" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// COFFEE CUP + SAUCER
// ============================================================
function CoffeeCup({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.09, 0.015, 24]} />
        <meshStandardMaterial color="#F5E8C8" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#F5E8C8" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.005, 16]} />
        <meshStandardMaterial color="#2A1404" roughness={0.3} />
      </mesh>
      <mesh position={[0.07, 0.05, 0]} castShadow>
        <torusGeometry args={[0.025, 0.005, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#F5E8C8" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

// ============================================================
// READING GLASSES
// ============================================================
function ReadingGlasses({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0, 0.2, 0]}>
      {[-0.04, 0.04].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0, 0]} castShadow>
            <torusGeometry args={[0.035, 0.004, 6, 16]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[x, 0, 0]}>
            <circleGeometry args={[0.034, 16]} />
            <meshStandardMaterial color="#1A2A3A" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.005, 0.005]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.4} />
      </mesh>
      {[-0.07, 0.07].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.06]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.005, 0.005, 0.12]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// DUST MOTES
// ============================================================
function DustMotes() {
  const ref = useRef<THREE.Points>(null);
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] = ((pos.array[i * 3 + 1] + t * 0.015 + 0.005) % 6);
      pos.array[i * 3] += Math.sin(t * 0.3 + i) * 0.0005;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFE5B0"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================================
// WINDOW (left wall) — view + mullions
// ============================================================
function Window({ tex }: { tex: TexCache }) {
  return (
    <group position={[-9, 1, 0]}>
      <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4, 5]} />
        <meshStandardMaterial
          map={tex.winView}
          color="#FFFFFF"
          emissive="#FFE5B0"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Mullions */}
      <mesh position={[0, 2, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.08, 5, 0.08]} />
        <meshStandardMaterial color="#6F5436" />
      </mesh>
      <mesh position={[0, 2, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, 0.08, 0.08]} />
        <meshStandardMaterial color="#6F5436" />
      </mesh>
      <mesh position={[0, 2, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, 0.06, 0.06]} />
        <meshStandardMaterial color="#6F5436" />
      </mesh>
      {/* Outer frame */}
      <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4.4, 0.15, 0.12]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4.4, 0.15, 0.12]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.15, 5.1, 0.12]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.3, 0.4]} castShadow>
        <boxGeometry args={[0.8, 0.12, 0.8]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      <Vase position={[0, 0.3, 0.4]} scale={0.6} />
    </group>
  );
}

// ============================================================
// WALL CLOCK
// ============================================================
function WallClock({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = -t * 0.1;
  });
  return (
    <group position={position}>
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.06, 32]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.04]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.005, 32]} />
        <meshStandardMaterial color="#F5E8C8" roughness={0.5} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 0.32;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, Math.sin(a) * r, 0.045]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <cylinderGeometry args={[0.015, 0.015, 0.005, 8]} />
            <meshStandardMaterial color="#3A1A04" />
          </mesh>
        );
      })}
      <group ref={ref}>
        <mesh position={[0, 0.15, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.012, 0.3, 0.005]} />
          <meshStandardMaterial color="#3A1A04" />
        </mesh>
      </group>
      <mesh position={[0.1, 0, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[0.008, 0.2, 0.005]} />
        <meshStandardMaterial color="#3A1A04" />
      </mesh>
    </group>
  );
}

// ============================================================
// PORTRAIT
// ============================================================
function Portrait({ position }: { position: [number, number, number] }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 320;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, "#3A2A1A");
    grad.addColorStop(1, "#1A0E04");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 320);
    ctx.fillStyle = "#E8D8B8";
    ctx.beginPath();
    ctx.ellipse(128, 130, 50, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2A1A08";
    ctx.beginPath();
    ctx.ellipse(128, 95, 55, 40, 0, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#F5E8C8";
    ctx.beginPath();
    ctx.moveTo(80, 200);
    ctx.lineTo(128, 220);
    ctx.lineTo(176, 200);
    ctx.lineTo(180, 320);
    ctx.lineTo(76, 320);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3A2A1A";
    ctx.fillRect(70, 220, 120, 100);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={position}>
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.4, 1.8, 0.06]} />
        <meshStandardMaterial color="#B8860B" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.04]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}

// ============================================================
// FLOOR LAMP (right)
// ============================================================
function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.06, 24]} />
        <meshStandardMaterial color="#5A3F22" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 2.4, 12]} />
        <meshStandardMaterial color="#B5894C" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[0.4, 0.5, 24, 1, true]} />
        <meshStandardMaterial
          color="#FFE0A0"
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
          emissive="#FFD78A"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[0, 2.66, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
        <meshStandardMaterial color="#5A3F22" />
      </mesh>
      <pointLight
        position={[0, 2.4, 0]}
        intensity={0.8}
        color="#FFD78A"
        distance={6}
        decay={1.8}
      />
    </group>
  );
}

// ============================================================
// SCENE INNER
// ============================================================
function SceneInner({
  onSelect,
  tex,
}: {
  onSelect: (s: { topic: Topic; book: Book } | null) => void;
  tex: TexCache;
}) {
  return (
    <>
      <fog attach="fog" args={["#F0E0B8", 26, 48]} />
      <hemisphereLight args={["#FFE8C0", "#6A4A2E", 1.4]} />
      <ambientLight intensity={1.3} color="#FFE8C0" />
      <directionalLight
        position={[-8, 5, 2]}
        intensity={3.2}
        color="#FFE5B0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <pointLight
        position={[0, 6.5, 2]}
        intensity={3.0}
        color="#FFD78A"
        distance={18}
        decay={1.4}
      />
      {/* 2 spotlights on bookcase from above */}
      <spotLight
        position={[-2.5, 7, 1.5]}
        target-position={[-2.5, 1.5, -0.5]}
        intensity={3.0}
        angle={Math.PI / 5}
        penumbra={0.5}
        color="#FFE8C0"
        distance={14}
        decay={1.3}
        castShadow
      />
      <spotLight
        position={[2.5, 7, 1.5]}
        target-position={[2.5, 1.5, -0.5]}
        intensity={3.0}
        angle={Math.PI / 5}
        penumbra={0.5}
        color="#FFE8C0"
        distance={14}
        decay={1.3}
        castShadow
      />
      {/* Front fill */}
      <pointLight
        position={[0, 1.0, 4]}
        intensity={1.0}
        color="#FFE8C0"
        distance={8}
        decay={1.8}
      />
      <pointLight
        position={[0, 3, 5]}
        intensity={1.0}
        color="#FFE5B0"
        distance={12}
        decay={1.8}
      />
      <Room tex={tex} />
      <Window tex={tex} />
      <Bust position={[-6.5, 0, -4.5]} tex={tex} />
      <Bookcase
        topics={TOPICS}
        onBookClick={(topic, book) => onSelect({ topic, book })}
        tex={tex}
      />
      <Armchair position={[-3, 0, 3.5]} tex={tex} />
      <SideTable position={[-1.2, 0, 3.8]} tex={tex} />
      <Plant position={[-5, 0, 3]} />
      <Rug position={[-2, -0.55, 3.5]} tex={tex} />
      <OpenBook position={[-1.2, 1.0, 3.8]} />
      <CoffeeCup position={[-1.0, 0.6, 3.95]} />
      <ReadingGlasses position={[-1.4, 0.6, 3.7]} />
      <Portrait position={[9, 3, -3]} />
      <WallClock position={[9, 1.0, -1.2]} />
      <FloorLamp position={[5, 0, 0]} />
      <DustMotes />
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.4}
        scale={20}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#3D2817"
      />
    </>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================
export default function Scene({
  onSelect,
}: {
  onSelect: (s: { topic: Topic; book: Book } | null) => void;
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
        toneMappingExposure: 1.5,
      }}
      camera={{ position: [0, 2.8, 15], fov: 50, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#E8D5A8"]} />
      <Suspense fallback={null}>
        {tex ? (
          <SceneInner onSelect={onSelect} tex={tex} />
        ) : (
          <ambientLight intensity={0.5} />
        )}
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={20}
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
