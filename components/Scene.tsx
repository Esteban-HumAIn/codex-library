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

const COLORS: Record<string, string> = {
  fisica: "#7A1F12",
  matematicas: "#1E3A6E",
  biologia: "#1F5C2E",
  economia: "#7A5612",
  filosofia: "#4A1F70",
  computacion: "#0A445A",
  historia: "#6A1F0A",
  psicologia: "#7A1240",
  sistemas: "#3A4150",
};

function getBookColor(book: Book, topic: Topic): string {
  if (book.jades_pick) return "#C49B30";
  return COLORS[topic.id] || "#5C3A1E";
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
  const [time, setTime] = useState(0);
  useFrame((_, delta) => setTime((t) => t + delta));

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
            {/* Llama (flame) */}
            <mesh position={[x, 0.32, z]}>
              <sphereGeometry args={[0.025 + Math.sin(time * 3 + i) * 0.005, 8, 8]} />
              <meshStandardMaterial
                color="#FFAA33"
                emissive="#FFB050"
                emissiveIntensity={3}
                toneMapped={false}
              />
            </mesh>
            {/* Luz puntual cálida */}
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
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={book.jades_pick ? 0.4 : 0.1}
          emissive={hover ? color : "#000000"}
          emissiveIntensity={hover ? 0.3 : 0}
        />
      </mesh>
      {book.jades_pick && (
        <mesh position={[-w / 2 - 0.005, 0, 0]}>
          <planeGeometry args={[0.6, 0.5]} />
          <meshStandardMaterial
            color="#C49B30"
            emissive="#C49B30"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

function bookWidth(book: Book): number {
  return 0.32 + ((hash(book.id) * 5) % 14) / 100;
}

function bookHeight(book: Book): number {
  return 1.8 + ((hash(book.id) * 5) % 50) / 100;
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
      <fog attach="fog" args={["#2A1A0E", 22, 40]} />

      {/* Ambient cálido (candlelight) */}
      <ambientLight intensity={0.5} color="#FFD8A0" />

      {/* Luz cálida cenital (luz que entra de vitrales) */}
      <directionalLight
        position={[0, 12, 0]}
        intensity={0.6}
        color="#FFD8A0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
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

          {/* Busto clásico */}
          <Bust position={[-6, 0, 5.5]} tex={tex} />

          {/* Globo terráqueo */}
          <Globe position={[6, 0, 5.5]} tex={tex} />

          {/* Retrato al óleo */}
          <Portrait position={[0, 4.5, -6.9]} tex={tex} />

          {/* Reloj de pared */}
          <WallClock position={[-9, 4, -6.9]} tex={tex} />

          {/* Detalles en la mesa */}
          <OpenBook position={[-1, 0.86, 2.5]} tex={tex} />
          <OpenBook position={[1, 0.86, 2.5]} tex={tex} />
          <ReadingGlasses position={[-0.5, 0.88, 2.5]} tex={tex} />
          <CoffeeCup position={[0.5, 0.88, 2.5]} tex={tex} />

          {/* Plantas decorativas */}
          <Plant position={[-7, 0, 5.5]} tex={tex} />
          <Plant position={[7, 0, 5.5]} tex={tex} />

          {/* Polvo dorado en el aire */}
          <DustMotes />
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
        toneMappingExposure: 2.0,
      }}
      camera={{
        position: isMobile ? [0, 3.2, 24] : [0, 3.5, 16],
        fov: isMobile ? 62 : 55,
        near: 0.1,
        far: 100,
      }}
    >
      <color attach="background" args={["#2D1810"]} />
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
