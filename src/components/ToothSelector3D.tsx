import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface ToothSelector3DProps {
  selected: string[];
  onToggle: (tooth: string) => void;
  disabled?: boolean;
}

/* ── Tooth layout (FDI numbering) ─────────────────────────────────── */

interface ToothSpec {
  fdi: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  type: "molar" | "premolar" | "canine" | "incisor";
}

function pos(fdi: string): number { return parseInt(fdi[1]); }

function buildTeeth(): ToothSpec[] {
  const teeth: ToothSpec[] = [];
  const R = 2.2; // arch radius

  const sizes: Record<string, [number, number, number]> = {
    molar: [0.42, 0.5, 0.38],
    premolar: [0.3, 0.48, 0.28],
    canine: [0.24, 0.55, 0.24],
    incisor: [0.26, 0.5, 0.18],
  };

  // Place 16 teeth per jaw in a U-shape (viewed from front)
  // Upper: 18..11 (right→center) then 21..28 (center→left)
  // Lower: 48..41 (right→center) then 31..38 (center→left)
  const upperFdis = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
  const lowerFdis = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];

  function placeRow(fdis: string[], yOffset: number) {
    const n = fdis.length;
    for (let i = 0; i < n; i++) {
      const fdi = fdis[i];
      const p = pos(fdi);
      const type: ToothSpec["type"] = p >= 6 ? "molar" : p >= 4 ? "premolar" : p === 3 ? "canine" : "incisor";

      // Angle from -PI/2 to PI/2 along U-arch
      const t = ((i + 0.5) / n) * Math.PI - Math.PI / 2;
      const x = Math.sin(t) * R;
      const z = -Math.cos(t) * R * 0.6; // flatten the U
      const rotY = t; // face outward

      teeth.push({
        fdi,
        position: [x, yOffset, z],
        rotation: [0, rotY, 0],
        scale: sizes[type],
        type,
      });
    }
  }

  placeRow(upperFdis, 0.35);
  placeRow(lowerFdis, -0.35);

  return teeth;
}

const ALL_TEETH = buildTeeth();
console.log("Tooth positions:", ALL_TEETH.slice(0, 3).map(t => ({ fdi: t.fdi, pos: t.position })));

/* ── Single 3D Tooth ──────────────────────────────────────────────── */

function Tooth3D({
  spec,
  isSelected,
  isHovered,
  onClick,
  onHover,
}: {
  spec: ToothSpec;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = useRef(1);

  // Animate scale on hover/select
  targetScale.current = isSelected ? 1.12 : isHovered ? 1.06 : 1;

  useFrame(() => {
    if (!meshRef.current) return;
    const s = meshRef.current.scale;
    const t = targetScale.current;
    s.x += (spec.scale[0] * t - s.x) * 0.15;
    s.y += (spec.scale[1] * t - s.y) * 0.15;
    s.z += (spec.scale[2] * t - s.z) * 0.15;
  });

  // Crown geometry — rounded box
  const crownGeo = useMemo(() => {
    const { type } = spec;
    if (type === "molar") {
      // Slightly irregular box for molars
      const geo = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        // Round edges
        const d = Math.sqrt(x * x + z * z);
        const roundFactor = Math.max(0, 1 - d * 0.3);
        pos.setY(i, y + Math.sin(x * 3) * 0.05 + Math.sin(z * 4) * 0.04);
        // Taper slightly at top
        if (y > 0.3) {
          pos.setX(i, x * (1 - (y - 0.3) * 0.15));
          pos.setZ(i, z * (1 - (y - 0.3) * 0.15));
        }
      }
      geo.computeVertexNormals();
      return geo;
    }
    if (type === "canine") {
      // Pointed cone-ish
      const geo = new THREE.ConeGeometry(0.5, 1, 8, 4);
      geo.rotateX(Math.PI);
      geo.translate(0, 0.1, 0);
      return geo;
    }
    // Premolar / incisor — smooth rounded box
    const geo = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      // Round the edges
      const len = Math.sqrt(x * x + z * z);
      if (len > 0.35) {
        const scale = 0.35 / len;
        pos.setX(i, x * (1 - (1 - scale) * 0.5));
        pos.setZ(i, z * (1 - (1 - scale) * 0.5));
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, [spec.type]);

  // Root geometry — tapered cylinder
  const rootGeo = useMemo(() => {
    const { type } = spec;
    const segments = type === "molar" ? 6 : 8;
    const geo = new THREE.CylinderGeometry(0.15, 0.06, 0.8, segments);
    return geo;
  }, [spec.type]);

  const isUpper = parseInt(spec.fdi[0]) <= 2;
  const rootY = isUpper ? 0.7 : -0.7;

  // Colors
  const crownColor = isSelected ? "#2A5A3F" : isHovered ? "#E8E6E0" : "#F0EDE8";
  const rootColor = isSelected ? "#1E4530" : "#D4CFC7";

  return (
    <group position={spec.position} rotation={spec.rotation}>
      {/* Crown */}
      <mesh
        ref={meshRef}
        scale={spec.scale}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}
        castShadow
      >
        <primitive object={crownGeo} attach="geometry" />
        <meshStandardMaterial
          color={crownColor}
          roughness={isSelected ? 0.4 : 0.6}
          metalness={isSelected ? 0.1 : 0.02}
        />
      </mesh>

      {/* Root */}
      <mesh position={[0, rootY, 0]} scale={[spec.scale[0] * 0.7, 1, spec.scale[2] * 0.7]}>
        <primitive object={rootGeo} attach="geometry" />
        <meshStandardMaterial color={rootColor} roughness={0.8} transparent opacity={0.5} />
      </mesh>

      {/* Second root for molars */}
      {spec.type === "molar" && (
        <mesh position={[spec.scale[0] * 0.3, rootY, 0]} scale={[spec.scale[0] * 0.5, 0.8, spec.scale[2] * 0.5]}>
          <primitive object={rootGeo} attach="geometry" />
          <meshStandardMaterial color={rootColor} roughness={0.8} transparent opacity={0.4} />
        </mesh>
      )}

      {/* FDI label */}
      <Text
        position={[0, isUpper ? -0.05 : 0.05, spec.scale[2] * 0.6 + 0.05]}
        fontSize={0.12}
        color={isSelected ? "white" : "#9E9E9E"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/outfit-regular.woff"
      >
        {spec.fdi}
      </Text>
    </group>
  );
}

/* ── Gum mesh ─────────────────────────────────────────────────────── */

function Gum({ isUpper }: { isUpper: boolean }) {
  const geo = useMemo(() => {
    // Create a U-shaped gum using a lathe or extrusion
    const shape = new THREE.Shape();
    const R = 3.2;
    const points = 40;

    // Arch shape
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI;
      const x = Math.sin(t) * R;
      const z = Math.cos(t) * R * 0.7;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    // Close the inner edge
    for (let i = points; i >= 0; i--) {
      const t = (i / points) * Math.PI;
      const x = Math.sin(t) * (R - 0.8);
      const z = Math.cos(t) * (R - 0.8) * 0.7;
      shape.lineTo(x, z);
    }
    shape.closePath();

    const extrudeSettings = { depth: 0.25, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  return (
    <mesh geometry={geo} position={[0, isUpper ? 0.15 : -0.4, 0]} rotation={[0, 0, 0]}>
      <meshStandardMaterial color="#E8A0A0" roughness={0.7} transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Scene ────────────────────────────────────────────────────────── */

function Scene({ selected, onToggle }: { selected: string[]; onToggle: (t: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <color attach="background" args={["#1E1E1E"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 6, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.5} />
      <pointLight position={[0, -2, 4]} intensity={0.4} color="#FFE4C4" />

      {/* Debug: visible test cube at origin */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>

      <Gum isUpper />
      <Gum isUpper={false} />

      {ALL_TEETH.map((spec) => (
        <Tooth3D
          key={spec.fdi}
          spec={spec}
          isSelected={selected.includes(spec.fdi)}
          isHovered={hovered === spec.fdi}
          onClick={() => onToggle(spec.fdi)}
          onHover={(h) => setHovered(h ? spec.fdi : null)}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function ToothSelector3D({ selected, onToggle, disabled }: ToothSelector3DProps) {
  return (
    <div className={cn("select-none", disabled && "opacity-40 pointer-events-none")}>
      <div className="w-full h-[340px] rounded-lg overflow-hidden bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] border border-border">
        <Canvas
          camera={{ position: [0, 3, 4.5], fov: 40 }}
          shadows
          gl={{ antialias: true }}
        >
          <Scene selected={selected} onToggle={onToggle} />
        </Canvas>
      </div>

      <p className="text-center text-[10px] text-text-tertiary mt-1.5">
        Rotera: dra · Zooma: scroll · Klicka på en tand för att välja
      </p>

      {/* Selected teeth */}
      {selected.length > 0 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-text-secondary">
            Valda:{" "}
            {[...selected].sort().map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.5 bg-accent text-white text-[10px] font-mono font-semibold rounded"
              >
                {t}
                <button onClick={() => onToggle(t)} className="hover:opacity-70 ml-0.5 text-[9px]" aria-label={`Ta bort tand ${t}`}>×</button>
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
