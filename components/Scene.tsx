"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { TOPICS, SHELVES, type Book, type Topic } from "@/lib/data";

export const SCENE_TOPICS = TOPICS;
export const SCENE_SHELVES = SHELVES;

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
  return (((hash(book.id) * 7) % 7) - 3) * 0.01;
}

// ============ BOOK (3D) ============
function BookMesh({
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
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const w = bookWidth(book);
  const h = bookHeight(book);
  const d = 0.22;
  const c = COLORS[topic.id] || "#8B6F47";
  const tilt = bookTilt(book);

  useFrame((state) => {
    if (!ref.current) return;
    const target = hovered ? 0.35 : 0;
    const tiltTarget = hovered ? -0.45 : tilt;
    const t = state.clock.getElapsedTime();
    const wobble = Math.sin(t * 0.5 + position[0]) * 0.003;

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
      <mesh
        ref={ref}
        rotation={[0, tilt, 0]}
        castShadow
        receiveShadow
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
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={c} roughness={0.65} metalness={0.1} />
        {/* Decorative bands */}
        <mesh position={[0, h * 0.2, d / 2 + 0.001]}>
          <boxGeometry args={[w * 0.95, 0.04, 0.005]} />
          <meshStandardMaterial color="#000" roughness={0.9} />
        </mesh>
        <mesh position={[0, -h * 0.2, d / 2 + 0.001]}>
          <boxGeometry args={[w * 0.95, 0.04, 0.005]} />
          <meshStandardMaterial color="#000" roughness={0.9} />
        </mesh>
        {/* Pick ribbon */}
        {book.jades_pick && (
          <mesh position={[w / 2 - 0.02, h / 2 + 0.08, d / 2 + 0.005]}>
            <boxGeometry args={[0.04, 0.18, 0.005]} />
            <meshStandardMaterial color="#DAA520" metalness={0.5} roughness={0.4} />
          </mesh>
        )}
        {/* Top pages edge */}
        <mesh position={[0, h / 2 + 0.001, 0]}>
          <boxGeometry args={[w * 0.9, 0.003, d * 0.85]} />
          <meshStandardMaterial color="#F5E8C8" roughness={0.9} />
        </mesh>
      </mesh>
    </group>
  );
}

// ============ BOOKCASE SHELF ============
function BookcaseShelf({
  shelf,
  topics,
  onBookClick,
}: {
  shelf: { num: string; label: string; ids: string[] };
  topics: Topic[];
  onBookClick: (topic: Topic, book: Book) => void;
}) {
  const shelfY = useMemo(() => {
    const idx = SHELVES.findIndex((s) => s.num === shelf.num);
    return 2.4 - idx * 2.1;
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
        <boxGeometry args={[totalWidth + 0.6, 0.12, 0.7]} />
        <meshStandardMaterial color="#6F5436" roughness={0.85} />
      </mesh>
      {/* Books */}
      {bookPositions.map(({ book, topic, pos }) => (
        <BookMesh
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

// ============ ORNAMENTS ============
function Globe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.3, 24, 16]} />
        <meshStandardMaterial color="#1E40AF" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[-0.08, 0.42, 0.27]} castShadow>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#15803D" roughness={0.6} />
      </mesh>
      <mesh position={[0.12, 0.22, 0.22]} castShadow>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#15803D" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
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

function Vase({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.4, 16]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.04, 12]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.5} metalness={0.3} />
      </mesh>
      {[
        { x: 0, y: 0.65, c: "#E89B7A" },
        { x: 0.12, y: 0.55, c: "#F8B4B4" },
        { x: -0.12, y: 0.55, c: "#FFD4A8" },
        { x: 0.06, y: 0.72, c: "#C94040" },
        { x: -0.08, y: 0.62, c: "#FFE4B5" },
      ].map((f, i) => (
        <group key={i}>
          <mesh position={[f.x, f.y - 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.4, 6]} />
            <meshStandardMaterial color="#4A6B2C" />
          </mesh>
          <mesh position={[f.x, f.y, 0]} castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={f.c} roughness={0.5} />
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
        <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
        <meshStandardMaterial color="#B5894C" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
        <meshStandardMaterial color="#B5894C" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshStandardMaterial color="#B5894C" metalness={0.8} />
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
          <meshStandardMaterial color={c} roughness={0.7} />
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
        <cylinderGeometry args={[0.05, 0.06, 0.55, 12]} />
        <meshStandardMaterial color="#4A2208" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ============ BOOKCASE 3D ============
function Bookcase({
  topics,
  onBookClick,
}: {
  topics: Topic[];
  onBookClick: (topic: Topic, book: Book) => void;
}) {
  const W = 8.5;
  const H = 7.0;
  const D = 1.2;

  return (
    <group position={[0, 0, -0.5]}>
      {/* Back panel */}
      <mesh position={[0, 3.5, -D / 2 + 0.05]} receiveShadow>
        <boxGeometry args={[W - 0.2, H - 0.2, 0.05]} />
        <meshStandardMaterial color="#2A1E10" roughness={0.95} />
      </mesh>
      {/* Top crown molding */}
      <mesh position={[0, H + 0.1, 0]} castShadow>
        <boxGeometry args={[W + 0.4, 0.3, D + 0.3]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      <mesh position={[0, H - 0.05, 0]} castShadow>
        <boxGeometry args={[W + 0.2, 0.15, D + 0.15]} />
        <meshStandardMaterial color="#A67C52" roughness={0.7} />
      </mesh>
      {/* Top platform for ornaments */}
      <mesh position={[0, H + 0.55, 0]} receiveShadow>
        <boxGeometry args={[W + 0.4, 0.1, D + 0.3]} />
        <meshStandardMaterial color="#6F5436" roughness={0.85} />
      </mesh>
      {/* Pediment (triangular) above bookcase */}
      <mesh position={[0, H + 1.0, 0]} castShadow>
        <coneGeometry args={[0.5, 0.6, 3]} />
        <meshStandardMaterial color="#B8860B" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Side panels */}
      <mesh position={[-(W + 0.1) / 2, 3.5, 0]} castShadow>
        <boxGeometry args={[0.25, H - 0.5, D + 0.2]} />
        <meshStandardMaterial color="#6F5436" roughness={0.8} />
      </mesh>
      <mesh position={[(W + 0.1) / 2, 3.5, 0]} castShadow>
        <boxGeometry args={[0.25, H - 0.5, D + 0.2]} />
        <meshStandardMaterial color="#6F5436" roughness={0.8} />
      </mesh>
      {/* Base + plinth */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[W + 0.2, 0.4, D + 0.2]} />
        <meshStandardMaterial color="#5A3F22" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[W + 0.4, 0.1, D + 0.4]} />
        <meshStandardMaterial color="#3A1A04" roughness={0.9} />
      </mesh>
      {/* Feet */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[(W / 2 + 0.1) * s, -0.5, 0]}
          castShadow
        >
          <boxGeometry args={[0.25, 0.15, D + 0.4]} />
          <meshStandardMaterial color="#3A1A04" roughness={0.9} />
        </mesh>
      ))}
      {/* Ornaments on top */}
      <Vase position={[-3, H + 0.65, 0]} />
      <Globe position={[-1.2, H + 0.65, 0]} />
      <Hourglass position={[1.2, H + 0.65, 0]} />
      <BookStack position={[2.8, H + 0.65, 0]} />
      <Telescope position={[3.8, H + 0.65, 0]} />
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
          />
        );
      })}
    </group>
  );
}

// ============ ROOM ============
function Room() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 3, -7]} receiveShadow>
        <planeGeometry args={[24, 10]} />
        <meshStandardMaterial color="#E5D3A8" roughness={0.9} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-12, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#E5D3A8" roughness={0.9} />
      </mesh>
      <mesh position={[12, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#E5D3A8" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#E8DCB8" roughness={0.95} />
      </mesh>
      {/* Floor */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      {/* Wainscoting */}
      <mesh position={[0, -0.1, -6.95]} receiveShadow>
        <planeGeometry args={[24, 1.2]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      <mesh position={[-11.95, -0.1, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 1.2]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      <mesh position={[11.95, -0.1, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 1.2]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      {/* Crown molding (top) */}
      <mesh position={[0, 6.8, -6.95]} receiveShadow>
        <boxGeometry args={[24, 0.3, 0.1]} />
        <meshStandardMaterial color="#A67C52" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ============ ARMCHAIR ============
function Armchair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 1.2]} />
        <meshStandardMaterial color="#6B3410" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.2, 0.15, 1]} />
        <meshStandardMaterial color="#8B4515" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, -0.55]} castShadow>
        <boxGeometry args={[1.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#6B3410" roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.6, 0.7, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 1]} />
          <meshStandardMaterial color="#5A2A08" roughness={0.7} />
        </mesh>
      ))}
      {[
        [-0.55, -0.05, 0.45],
        [0.55, -0.05, 0.45],
        [-0.55, -0.05, -0.45],
        [0.55, -0.05, -0.45],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 6]} />
          <meshStandardMaterial color="#2A1404" />
        </mesh>
      ))}
    </group>
  );
}

// ============ SIDE TABLE + LAMP ============
function SideTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.5]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      {[
        [-0.4, 0.2, 0.2],
        [0.4, 0.2, 0.2],
        [-0.4, 0.2, -0.2],
        [0.4, 0.2, -0.2],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
          <meshStandardMaterial color="#6F5436" />
        </mesh>
      ))}
      <group position={[0, 0.55, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#8B6633" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.4, 0.18, 0.25]} />
          <meshStandardMaterial
            color="#1A4A1A"
            roughness={0.4}
            metalness={0.1}
            emissive="#1A4A1A"
            emissiveIntensity={0.3}
          />
        </mesh>
        <pointLight position={[0, 0.55, 0]} intensity={0.5} color="#FFE0A0" distance={4} decay={1.5} />
      </group>
    </group>
  );
}

// ============ PLANT ============
function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.18, 0.4, 12]} />
        <meshStandardMaterial color="#B86A4A" roughness={0.8} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        const r = 0.2;
        const h = 0.5 + (i % 3) * 0.1;
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 0.4 + h / 2, Math.sin(a) * r]}
            rotation={[0, -a, (i % 2 === 0 ? 1 : -1) * 0.3]}
          >
            <mesh castShadow>
              <boxGeometry args={[0.25, 0.08, 0.02]} />
              <meshStandardMaterial color="#4A6B2C" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============ BUST (Socrates) ============
function Bust({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.5]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.55]} />
        <meshStandardMaterial color="#C7BFAE" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

// ============ PERSIAN RUG ============
function Rug({ position }: { position: [number, number, number] }) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial
        color="#8B1F1F"
        roughness={0.9}
        emissive="#4A0E0E"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

// ============ MAIN SCENE EXPORT ============
export default function Scene({
  onSelect,
}: {
  onSelect: (s: { topic: Topic; book: Book } | null) => void;
}) {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ position: [0, 2.8, 7], fov: 50, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#E5D3A8"]} />
      <fog attach="fog" args={["#DCC79A", 14, 30]} />

      {/* Ambient */}
      <ambientLight intensity={0.5} color="#FFE5B0" />

      {/* Window directional light (left) */}
      <directionalLight
        position={[-8, 5, 2]}
        intensity={1.6}
        color="#FFE5B0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Ceiling pendant */}
      <pointLight
        position={[0, 6.5, 2]}
        intensity={1.5}
        color="#FFD78A"
        distance={14}
        decay={1.2}
      />

      {/* Floor lamp on right */}
      <pointLight
        position={[5, 2, 0]}
        intensity={0.8}
        color="#FFD78A"
        distance={7}
        decay={1.5}
      />

      {/* Room */}
      <Room />

      {/* Window (left wall) */}
      <group position={[-9, 1, 0]}>
        <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4, 5]} />
          <meshBasicMaterial color="#FFE5B0" transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[4.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#6F5436" />
        </mesh>
        <mesh position={[0, -0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[4.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#6F5436" />
        </mesh>
        {/* Sill */}
        <mesh position={[0, -0.3, 0.4]} castShadow>
          <boxGeometry args={[0.7, 0.1, 0.7]} />
          <meshStandardMaterial color="#8B6F47" />
        </mesh>
        <Vase position={[0, 0.2, 0.4]} />
      </group>

      {/* Bust pedestal (left) */}
      <Bust position={[-6.5, 0, -4.5]} />

      {/* Bookcase */}
      <Bookcase
        topics={TOPICS}
        onBookClick={(topic, book) => onSelect({ topic, book })}
      />

      {/* Foreground */}
      <Armchair position={[-3, 0, 3.5]} />
      <SideTable position={[-1.2, 0, 3.8]} />
      <Plant position={[-5, 0, 3]} />
      <Rug position={[-2, -0.55, 3.5]} />

      {/* Right wall decor */}
      <group position={[9, 0, -3]}>
        <mesh position={[0, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[1.4, 1.8, 0.06]} />
          <meshStandardMaterial color="#B8860B" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.5, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[1.3, 1.7, 0.001]} />
          <meshStandardMaterial color="#3A2A1A" />
        </mesh>
        {/* Wall clock */}
        <mesh position={[0, 1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 24]} />
          <meshStandardMaterial color="#F0E4C8" />
        </mesh>
      </group>

      {/* Right floor lamp */}
      <group position={[5, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 16]} />
          <meshStandardMaterial color="#5A3F22" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
          <meshStandardMaterial color="#B5894C" metalness={0.7} />
        </mesh>
        <mesh position={[0, 2.3, 0]} castShadow>
          <coneGeometry args={[0.35, 0.4, 16]} />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.3}
            roughness={0.5}
            emissive="#FFD78A"
            emissiveIntensity={0.4}
          />
        </mesh>
        <pointLight
          position={[0, 2.3, 0]}
          intensity={0.6}
          color="#FFD78A"
          distance={5}
          decay={2}
        />
      </group>

      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.4}
        scale={20}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#3D2817"
      />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={12}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, 2, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
