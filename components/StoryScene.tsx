"use client";

/**
 * StoryScene — "The ClipForge Flywheel": a scroll-driven 3D story, not decoration.
 *
 * One pinned ~500vh scroll flow. Scroll progress (0→1) drives a 5-chapter
 * narrative in WebGL + HTML overlays that crossfade per chapter:
 *   0 Hero    — glowing campaign card emits an opportunity pulse
 *   1 Brief   — camera dollies in, edge light traces the card
 *   2 Clips   — card splits into 5 orbiting glass clip-cards
 *   3 Views   — light-particle streams rise, progress rings fill
 *   4 Payout  — coins flow along curves into a glass vault
 *
 * Interactive: hover any 3D object (raycast) → brightens + cursor tooltip;
 * click clip cards → spin + particle burst; click vault → coin fountain;
 * damped mouse parallax; clickable chapter dots.
 *
 * Robustness: WebGL check → CSS-gradient fallback (never blank); reduced-motion
 * → single static frame; mobile → fewer particles, no parallax; dpr ≤ 1.5;
 * pauses offscreen. No text inside the canvas. No lime anywhere.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import StoryOverlay, { type HoverInfo } from "./StoryOverlay";

const ELECTRIC = "#2047FF";
const ELECTRIC_SOFT = "#5B7CFF";

/* ------------------------------------------------------------------ */
/* math helpers                                                        */
/* ------------------------------------------------------------------ */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function chapterOf(p: number): number {
  if (p < 0.15) return 0;
  if (p < 0.35) return 1;
  if (p < 0.55) return 2;
  if (p < 0.75) return 3;
  return 4;
}

/* ------------------------------------------------------------------ */
/* dark-mode hook (observes the .dark class ThemeToggle flips)          */
/* ------------------------------------------------------------------ */
function useDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(
      typeof matchMedia !== "undefined" &&
        (matchMedia("(pointer: coarse)").matches || window.innerWidth < 768)
    );
  }, []);
  return coarse;
}

/* ------------------------------------------------------------------ */
/* shared story bus (mutable, no react re-renders for 3D)               */
/* ------------------------------------------------------------------ */
export interface Burst { pos: THREE.Vector3; t0: number; dirs: Float32Array }
export interface StoryBus {
  progress: number;
  pointer: { x: number; y: number };
  time: number;
  bursts: Burst[];
  fountainAt: number; // timestamp of last vault click, -1 = none
  dark: boolean;
  coarse: boolean;
  reduced: boolean;
}

/* ------------------------------------------------------------------ */
/* procedural textures                                                 */
/* ------------------------------------------------------------------ */
function makeDotTexture(): THREE.Texture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.8)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

function ellipsePoints(rx: number, rz: number, segments = 220): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * rx, 0, Math.sin(a) * rz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/** points along a rounded-rect perimeter (for the edge-trace effect) */
function roundedRectPoints(w: number, h: number, r: number, segments = 120): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-(w / 2 - r), h / 2 - r, Math.PI / 2],
    [-(w / 2 - r), -(h / 2 - r), Math.PI],
    [w / 2 - r, -(h / 2 - r), (3 * Math.PI) / 2],
  ];
  const per = Math.floor(segments / 4);
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i < per; i++) {
      const a = start + (i / per) * (Math.PI / 2);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
    }
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* palette                                                             */
/* ------------------------------------------------------------------ */
interface Pal { card: string; cardOp: number; ice: string; electric: string; ring: string }
function palette(dark: boolean): Pal {
  return dark
    ? { card: "#182742", cardOp: 0.55, ice: "#8FA6CC", electric: ELECTRIC_SOFT, ring: "#3D5BA8" }
    : { card: "#DCE9F4", cardOp: 0.45, ice: "#B9CFE4", electric: ELECTRIC, ring: "#9DB4D6" };
}

/* ------------------------------------------------------------------ */
/* ambient dotted orbital ellipses (Vectr motif)                        */
/* ------------------------------------------------------------------ */
function OrbitDots({ bus }: { bus: React.MutableRefObject<StoryBus> }) {
  const tex = useMemo(() => makeDotTexture(), []);
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(
    () => [
      { geo: ellipsePoints(6.4, 4.2), pos: [0, 0.6, -3] as const, rot: [0.5, 0, 0.25] as const, size: 0.1 },
      { geo: ellipsePoints(8.2, 5.6), pos: [0, -0.8, -7] as const, rot: [-0.35, 0, -0.15] as const, size: 0.085 },
      { geo: ellipsePoints(5.0, 3.4), pos: [0, 1.6, -10] as const, rot: [0.7, 0, 0.5] as const, size: 0.07 },
    ],
    []
  );
  useEffect(
    () => () => {
      tex.dispose();
      rings.forEach((r) => r.geo.dispose());
    },
    [tex, rings]
  );
  useFrame((_, dt) => {
    if (bus.current.reduced || !group.current) return;
    group.current.rotation.y += dt * 0.03;
  });
  const pal = palette(bus.current.dark);
  return (
    <group ref={group}>
      {rings.map((r, i) => (
        <points key={i} geometry={r.geo} position={[r.pos[0], r.pos[1], r.pos[2]]} rotation={[r.rot[0], r.rot[1], r.rot[2]]}>
          <pointsMaterial size={r.size} map={tex} color={pal.electric} transparent opacity={0.5} depthWrite={false} sizeAttenuation />
        </points>
      ))}
    </group>
  );
}

/* brighten/dim every physical material under a group (hover feedback).
   Remembers each material's base emissiveIntensity so hover never
   permanently dims an already-glowy part. */
function setGroupGlow(group: THREE.Group | null, hovered: boolean) {
  group?.traverse((o) => {
    const m = (o as THREE.Mesh).material as
      | (THREE.MeshPhysicalMaterial & { userData: { baseEI?: number } })
      | undefined;
    if (m && "emissiveIntensity" in m) {
      if (m.userData.baseEI === undefined) m.userData.baseEI = m.emissiveIntensity;
      m.emissiveIntensity = (m.userData.baseEI ?? 0.1) + (hovered ? 0.5 : 0);
    }
  });
}

interface HoverBind {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
}

/* ------------------------------------------------------------------ */
/* Chapter 0–1: the campaign card — glowing glass brief                */
/* ------------------------------------------------------------------ */
const CARD_W = 3.4;
const CARD_H = 2.1;

function CampaignCard({
  bus,
  pal,
  bindHover,
}: {
  bus: React.MutableRefObject<StoryBus>;
  pal: Pal;
  bindHover: (label: string) => HoverBind;
}) {
  const group = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const traceRef = useRef<THREE.Group>(null);
  const tracerRef = useRef<THREE.Mesh>(null);
  const tracePts = useMemo(() => roundedRectPoints(CARD_W + 0.28, CARD_H + 0.28, 0.2), []);
  const traceGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(tracePts), [tracePts]);
  useEffect(() => () => traceGeo.dispose(), [traceGeo]);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const { progress: p, time } = bus.current;
    if (bus.current.reduced) return;

    const ch1Grow = 1 + 0.3 * sstep(0.15, 0.3, p);
    const exit = 1 - sstep(0.34, 0.4, p);
    const s = Math.max(0.0001, ch1Grow * exit);
    g.scale.setScalar(s);
    g.visible = exit > 0.01;

    const spinW = 1 - sstep(0.1, 0.22, p);
    g.rotation.y = Math.sin(time * 0.28) * 0.35 * spinW;
    g.rotation.x = Math.sin(time * 0.4) * 0.06 * spinW;
    // ch0: card sits low as ambient backdrop (clear of the centered headline);
    // rises to center as ch1 begins
    const heroDip = 1 - sstep(0.08, 0.2, p);
    g.position.y = Math.sin(time * 0.9) * 0.16 * (1 - sstep(0.12, 0.28, p)) - heroDip * 2.6;
    g.position.z = -heroDip * 2.0;

    // opportunity pulse ring (ch 0 → early ch 1)
    if (ringRef.current) {
      const pulseW = 1 - sstep(0.28, 0.4, p);
      const frac = (time * 0.42) % 1;
      ringRef.current.scale.setScalar((1 + frac * 2.4) * s);
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (1 - frac) * 0.45 * pulseW;
      ringRef.current.visible = pulseW > 0.01;
    }
    // edge trace (ch 1)
    if (traceRef.current) {
      const traceW = sstep(0.15, 0.23, p) * (1 - sstep(0.32, 0.4, p));
      traceRef.current.visible = traceW > 0.01;
      const lm = (traceRef.current.children[0] as THREE.Line).material as THREE.LineBasicMaterial;
      lm.opacity = traceW * 0.9;
      if (tracerRef.current) {
        const idx = Math.floor(((time * 0.55) % 1) * tracePts.length) % tracePts.length;
        tracerRef.current.position.copy(tracePts[idx]);
        (tracerRef.current.material as THREE.MeshBasicMaterial).opacity = traceW;
      }
    }
  });

  return (
    <group>
      <group ref={group} {...bindHover("Campaign · $120 / 100K views")}>
        <RoundedBox args={[CARD_W, CARD_H, 0.28]} radius={0.09} smoothness={6}>
          <meshPhysicalMaterial
            color={pal.card}
            roughness={0.08}
            metalness={0}
            transmission={0.92}
            thickness={1.4}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={pal.electric}
            emissiveIntensity={0.1}
          />
        </RoundedBox>
        {/* abstract brief content — geometry only, no text */}
        <mesh position={[0, 0.62, 0.17]}>
          <boxGeometry args={[2.3, 0.3, 0.06]} />
          <meshStandardMaterial color={pal.electric} emissive={pal.electric} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
        {[0.18, -0.08, -0.34].map((y, i) => (
          <mesh key={y} position={[-0.15 - i * 0.1, y, 0.16]}>
            <boxGeometry args={[2.6 - i * 0.4, 0.13, 0.05]} />
            <meshStandardMaterial color={pal.ice} emissive={pal.ice} emissiveIntensity={0.12} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[-1.28, 0.62, 0.16]}>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color={pal.ice} emissive={pal.ice} emissiveIntensity={0.2} roughness={0.4} />
        </mesh>
        <RoundedBox args={[1.15, 0.44, 0.1]} radius={0.05} smoothness={4} position={[0.95, -0.62, 0.17]}>
          <meshStandardMaterial color={pal.electric} emissive={pal.electric} emissiveIntensity={0.65} roughness={0.35} />
        </RoundedBox>
      </group>

      {/* pulse ring */}
      <mesh ref={ringRef} position={[0, 0, -0.35]}>
        <ringGeometry args={[1.85, 1.95, 72]} />
        <meshBasicMaterial color={pal.electric} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* edge trace */}
      <group ref={traceRef} position={[0, 0, 0.18]} visible={false}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <lineLoop geometry={traceGeo}>
          <lineBasicMaterial color={pal.electric} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineLoop>
        <mesh ref={tracerRef}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 2+: five glass clip-cards fanning into orbit                 */
/* ------------------------------------------------------------------ */
const CLIP_VIEWS = ["84K", "120K", "45K", "210K", "67K"];

export function clipOrbitPos(i: number, time: number, p: number, out: THREE.Vector3): THREE.Vector3 {
  const w = easeOut(sstep(0.36, 0.52, p));
  const orbitW = sstep(0.4, 0.56, p);
  const ang = (i / 5) * Math.PI * 2 + time * 0.13 * orbitW + p * 1.5;
  const R = 2.8;
  const ox = 1.2 + Math.cos(ang) * R;
  const oz = Math.sin(ang) * R * 0.72 - 1.1;
  const oy = 0.25 + Math.sin(time * 0.8 + i * 1.7) * 0.4;
  out.set(lerp(0, ox, w), lerp(0.1, oy, w), lerp(1.4, oz, w));
  return out;
}

function ClipField({
  bus,
  pal,
  bindHover,
}: {
  bus: React.MutableRefObject<StoryBus>;
  pal: Pal;
  bindHover: (label: string) => HoverBind;
}) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const spinUntil = useRef<number[]>([0, 0, 0, 0, 0]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (bus.current.reduced) return;
    const { progress: p, time } = bus.current;
    const w = easeOut(sstep(0.36, 0.52, p));
    const shrink = 1 - 0.3 * sstep(0.8, 0.92, p);
    for (let i = 0; i < 5; i++) {
      const g = groups.current[i];
      if (!g) continue;
      clipOrbitPos(i, time, p, tmp);
      g.position.copy(tmp);
      const spinning = time < spinUntil.current[i];
      g.rotation.y = Math.sin(time * 0.5 + i * 1.3) * 0.25 + (spinning ? (time - spinUntil.current[i] + 0.9) * 9 : 0);
      g.rotation.x = Math.sin(time * 0.6 + i) * 0.08;
      const s = Math.max(0.0001, w * shrink);
      g.scale.setScalar(s);
      g.visible = w > 0.01;
    }
  });

  const onCardClick = (i: number) => {
    const now = bus.current.time;
    spinUntil.current[i] = now + 0.9;
    const g = groups.current[i];
    if (g) {
      bus.current.bursts.push({ pos: g.position.clone(), t0: now, dirs: burstDirs() });
    }
  };

  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
          visible={false}
          {...bindHover(`Clip · ${CLIP_VIEWS[i]} views`)}
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(i);
          }}
          onPointerDown={(e) => {
            if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType !== "mouse") return;
            e.stopPropagation();
            onCardClick(i);
          }}
        >
          <RoundedBox args={[1.5, 1.9, 0.16]} radius={0.07} smoothness={5}>
            <meshPhysicalMaterial
              color={pal.card}
              transparent
              opacity={0.62}
              roughness={0.12}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.15}
              emissive={pal.electric}
              emissiveIntensity={0.1}
            />
          </RoundedBox>
          {/* play glyph */}
          <mesh position={[0, 0.28, 0.1]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.22, 0.34, 3]} />
            <meshStandardMaterial color={pal.electric} emissive={pal.electric} emissiveIntensity={0.7} roughness={0.3} />
          </mesh>
          {[0, 1].map((r) => (
            <mesh key={r} position={[-0.1 + r * 0.08, -0.42 - r * 0.26, 0.09]}>
              <boxGeometry args={[1.05 - r * 0.25, 0.1, 0.04]} />
              <meshStandardMaterial color={pal.ice} emissive={pal.ice} emissiveIntensity={0.12} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* random burst directions (up-biased sphere) */
function burstDirs(): Float32Array {
  const d = new Float32Array(16 * 3);
  for (let j = 0; j < 16; j++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    d[j * 3] = Math.sin(ph) * Math.cos(th);
    d[j * 3 + 1] = Math.abs(Math.cos(ph)) * 0.9 + 0.25;
    d[j * 3 + 2] = Math.sin(ph) * Math.sin(th);
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* Chapter 3: light-particle streams rising from each clip card         */
/* ------------------------------------------------------------------ */
function Streams({ bus, pal, tex }: { bus: React.MutableRefObject<StoryBus>; pal: Pal; tex: THREE.Texture }) {
  const coarse = bus.current.coarse;
  const PER = coarse ? 18 : 36;
  const N = 5 * PER;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, [N]);
  const seeds = useMemo(() => {
    const s = new Float32Array(N * 4);
    for (let j = 0; j < N; j++) {
      s[j * 4] = j % 5;
      s[j * 4 + 1] = Math.random();
      s[j * 4 + 2] = (Math.random() - 0.5) * 2;
      s[j * 4 + 3] = (Math.random() - 0.5) * 2;
    }
    return s;
  }, [N]);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const ptsRef = useRef<THREE.Points>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    if (bus.current.reduced) return;
    const { progress: p, time } = bus.current;
    const w = sstep(0.55, 0.63, p) * (1 - sstep(0.78, 0.86, p));
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let j = 0; j < N; j++) {
      const card = seeds[j * 4];
      const seed = seeds[j * 4 + 1];
      clipOrbitPos(card, time, p, tmp);
      const life = (time * 0.42 + seed) % 1;
      arr[j * 3] = tmp.x + seeds[j * 4 + 2] * (0.22 + life * 0.75);
      arr[j * 3 + 1] = tmp.y + 0.7 + life * 3.8;
      arr[j * 3 + 2] = tmp.z + seeds[j * 4 + 3] * (0.22 + life * 0.75);
    }
    attr.needsUpdate = true;
    if (matRef.current) matRef.current.opacity = w * 0.9;
    if (ptsRef.current) ptsRef.current.visible = w > 0.01;
  });

  return (
    <points ref={ptsRef} geometry={geo} visible={false} frustumCulled={false}>
      <pointsMaterial ref={matRef} size={0.11} map={tex} color={pal.electric} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 3: progress ring under each clip card (shader arc)          */
/* ------------------------------------------------------------------ */
const ARC_VERT = `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ARC_FRAG = `
  varying vec2 vP;
  uniform float uProgress; uniform vec3 uColor; uniform float uOpacity;
  void main(){
    float ang = fract((atan(vP.y, vP.x) + 3.14159265) / 6.2831853 + 0.25);
    float fill = smoothstep(ang, ang + 0.02, uProgress);
    float head = smoothstep(0.07, 0.0, abs(ang - uProgress)) * step(0.002, uProgress) * step(uProgress, 0.998);
    float alpha = (fill * 0.8 + head * 1.2) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }`;

function ProgressRing({ bus, pal, index }: { bus: React.MutableRefObject<StoryBus>; pal: Pal; index: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const base = useRef<THREE.Mesh>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const uniforms = useMemo(
    () => ({ uProgress: { value: 0 }, uColor: { value: new THREE.Color(pal.electric) }, uOpacity: { value: 0 } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => {
    uniforms.uColor.value.set(pal.electric);
  }, [pal.electric, uniforms]);

  useFrame(() => {
    if (bus.current.reduced) return;
    const { progress: p, time } = bus.current;
    clipOrbitPos(index, time, p, tmp);
    const w = sstep(0.55, 0.63, p) * (1 - sstep(0.8, 0.88, p));
    if (mesh.current) {
      mesh.current.position.set(tmp.x, -1.3, tmp.z);
      mesh.current.visible = w > 0.01;
    }
    if (base.current) {
      base.current.position.set(tmp.x, -1.3, tmp.z);
      base.current.visible = w > 0.01;
      (base.current.material as THREE.MeshBasicMaterial).opacity = w * 0.14;
    }
    uniforms.uProgress.value = sstep(0.58 + index * 0.02, 0.74, p);
    uniforms.uOpacity.value = w;
  });

  return (
    <group>
      <mesh ref={base} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.62, 0.7, 64]} />
        <meshBasicMaterial color={pal.electric} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.62, 0.7, 64]} />
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={uniforms} vertexShader={ARC_VERT} fragmentShader={ARC_FRAG} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 4: coins flowing along curves into the vault                */
/* ------------------------------------------------------------------ */
function Coins({ bus, pal }: { bus: React.MutableRefObject<StoryBus>; pal: Pal }) {
  const COUNT = bus.current.coarse ? 30 : 56;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lanes = useMemo(
    () => Array.from({ length: COUNT }, (_, k) => ({ lane: k % 5, off: Math.random(), dur: 2.0 + Math.random() * 1.4, spin: Math.random() * Math.PI * 2 })),
    [COUNT]
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const ctrl = useMemo(() => new THREE.Vector3(), []);
  const end = useMemo(() => new THREE.Vector3(0, 0.75, 0), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m || bus.current.reduced) return;
    const { progress: p, time } = bus.current;
    const w = sstep(0.75, 0.83, p);
    m.visible = w > 0.01;
    if (!m.visible) return;
    for (let k = 0; k < COUNT; k++) {
      const L = lanes[k];
      const t = (time / L.dur + L.off) % 1;
      clipOrbitPos(L.lane, time, p, tmp);
      const sx = tmp.x, sy = tmp.y + 0.4, sz = tmp.z;
      ctrl.set((sx + end.x) / 2, Math.max(sy, end.y) + 2.4, (sz + end.z) / 2);
      const a = 1 - t;
      dummy.position.set(
        a * a * sx + 2 * a * t * ctrl.x + t * t * end.x,
        a * a * sy + 2 * a * t * ctrl.y + t * t * end.y,
        a * a * sz + 2 * a * t * ctrl.z + t * t * end.z
      );
      dummy.rotation.set(time * 3 + L.spin, L.spin, 0.4);
      dummy.scale.setScalar(Math.max(0.0001, w * (0.7 + 0.3 * Math.sin(t * Math.PI))));
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} visible={false} frustumCulled={false}>
      <cylinderGeometry args={[0.1, 0.1, 0.035, 20]} />
      <meshStandardMaterial color={pal.electric} emissive={pal.electric} emissiveIntensity={1.5} metalness={0.85} roughness={0.25} transparent opacity={0.95} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 4: the glass vault                                          */
/* ------------------------------------------------------------------ */
function Vault({
  bus,
  pal,
  bindHover,
}: {
  bus: React.MutableRefObject<StoryBus>;
  pal: Pal;
  bindHover: (label: string) => HoverBind;
}) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!group.current || bus.current.reduced) return;
    const { progress: p, time } = bus.current;
    const w = easeOut(sstep(0.74, 0.84, p));
    group.current.scale.setScalar(Math.max(0.0001, w));
    group.current.visible = w > 0.01;
    group.current.position.y = 0.35 + Math.sin(time * 1.1) * 0.1;
    if (core.current) {
      core.current.rotation.y = time * 0.8;
      core.current.rotation.x = time * 0.35;
    }
  });

  return (
    <group
      ref={group}
      position={[0, 0.35, 0]}
      visible={false}
      {...bindHover("Payout · $201.60")}
      onClick={(e) => {
        e.stopPropagation();
        bus.current.fountainAt = bus.current.time;
      }}
      onPointerDown={(e) => {
        if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType !== "mouse") return;
        e.stopPropagation();
        bus.current.fountainAt = bus.current.time;
      }}
    >
      <RoundedBox args={[1.7, 1.7, 1.7]} radius={0.14} smoothness={5}>
        <meshPhysicalMaterial color={pal.card} roughness={0.08} metalness={0} transmission={0.9} thickness={1.6} ior={1.45} clearcoat={1} clearcoatRoughness={0.1} emissive={pal.electric} emissiveIntensity={0.12} />
      </RoundedBox>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={pal.electric} emissive={pal.electric} emissiveIntensity={2.4} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.87, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.14]} />
        <meshBasicMaterial color={pal.electric} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* click bursts (clip cards) + vault coin fountain                      */
/* ------------------------------------------------------------------ */
function Bursts({ bus, pal }: { bus: React.MutableRefObject<StoryBus>; pal: Pal }) {
  const COUNT = 96;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    if (bus.current.reduced) {
      m.visible = false;
      return;
    }
    const now = bus.current.time;
    bus.current.bursts = bus.current.bursts.filter((b) => now - b.t0 < 1.1);
    let slot = 0;
    for (const b of bus.current.bursts) {
      const age = now - b.t0;
      for (let j = 0; j < 16 && slot < COUNT; j++) {
        const dx = b.dirs[j * 3], dy = b.dirs[j * 3 + 1], dz = b.dirs[j * 3 + 2];
        dummy.position.set(b.pos.x + dx * age * 4.4, b.pos.y + dy * age * 4.4 - 1.7 * age * age, b.pos.z + dz * age * 4.4);
        dummy.scale.setScalar(Math.max(0.0001, (1 - age / 1.1) * 0.8));
        dummy.updateMatrix();
        m.setMatrixAt(slot, dummy.matrix);
        slot++;
      }
    }
    for (let s = slot; s < COUNT; s++) {
      dummy.position.set(0, -100, 0);
      dummy.scale.setScalar(0.0001);
      dummy.updateMatrix();
      m.setMatrixAt(s, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.visible = slot > 0;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} visible={false} frustumCulled={false}>
      <sphereGeometry args={[0.075, 10, 10]} />
      <meshBasicMaterial color={pal.electric} transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function Fountain({ bus, pal }: { bus: React.MutableRefObject<StoryBus>; pal: Pal }) {
  const COUNT = 26;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const vels = useMemo(() => {
    const v: number[][] = [];
    for (let k = 0; k < COUNT; k++) {
      const th = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 1.6;
      v.push([Math.cos(th) * r, 3.2 + Math.random() * 2.4, Math.sin(th) * r]);
    }
    return v;
  }, [COUNT]);

  useFrame(() => {
    const m = mesh.current;
    if (!m || bus.current.reduced) return;
    const age = bus.current.time - bus.current.fountainAt;
    const active = age > 0 && age < 1.5;
    m.visible = active;
    if (!active) return;
    for (let k = 0; k < COUNT; k++) {
      const v = vels[k];
      dummy.position.set(v[0] * age, 1.35 + v[1] * age - 4.6 * age * age, v[2] * age);
      dummy.scale.setScalar(Math.max(0.0001, 1 - age / 1.5));
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} visible={false} frustumCulled={false}>
      <cylinderGeometry args={[0.09, 0.09, 0.03, 18]} />
      <meshStandardMaterial color={pal.electric} emissive={pal.electric} emissiveIntensity={1.6} metalness={0.85} roughness={0.25} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* cinematic camera: keyframed dolly + slow orbit + damped parallax     */
/* ------------------------------------------------------------------ */
const CAM_KEYS: { p: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { p: 0.0, pos: [0, 0.9, 13.5], look: [0, 0.9, 0] },
  { p: 0.15, pos: [0, 0.5, 10.5], look: [0, 0.7, 0] },
  { p: 0.35, pos: [0.4, 0.35, 7.6], look: [-3.2, 0.1, 0] },
  { p: 0.55, pos: [0.4, 1.7, 12.5], look: [-3.2, 0, 0] },
  { p: 0.75, pos: [1.0, 2.7, 11.2], look: [-3.2, 0.4, 0] },
  { p: 1.0, pos: [0.4, 0.7, 9.6], look: [-3.2, 0.25, 0] },
];

function CameraRig({ bus }: { bus: React.MutableRefObject<StoryBus> }) {
  const des = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookT = useMemo(() => new THREE.Vector3(), []);
  const par = useRef({ x: 0, y: 0 });

  useFrame(({ camera, clock }, dt) => {
    const b = bus.current;
    const p = b.progress;
    if (b.reduced) {
      camera.position.set(0, 0.9, 13.5);
      camera.lookAt(0, 0, 0);
      return;
    }
    // keyframe interpolation with smoothstep easing
    let i = 0;
    while (i < CAM_KEYS.length - 2 && p > CAM_KEYS[i + 1].p) i++;
    const A = CAM_KEYS[i], B = CAM_KEYS[i + 1];
    const t = sstep(A.p, B.p, p);
    des.set(lerp(A.pos[0], B.pos[0], t), lerp(A.pos[1], B.pos[1], t), lerp(A.pos[2], B.pos[2], t));
    lookT.set(lerp(A.look[0], B.look[0], t), lerp(A.look[1], B.look[1], t), lerp(A.look[2], B.look[2], t));

    // slow orbit drift during the clips/views chapters
    const orbitW = sstep(0.4, 0.55, p) * (1 - sstep(0.72, 0.8, p));
    const az = orbitW * clock.elapsedTime * 0.1;
    if (az !== 0) {
      const dx = des.x - lookT.x, dz = des.z - lookT.z;
      const c = Math.cos(az), s = Math.sin(az);
      des.x = lookT.x + dx * c - dz * s;
      des.z = lookT.z + dx * s + dz * c;
    }

    // damped mouse parallax (no touch)
    if (!b.coarse) {
      const k2 = 1 - Math.exp(-2.6 * dt);
      par.current.x += (b.pointer.x * 0.85 - par.current.x) * k2;
      par.current.y += (b.pointer.y * 0.55 - par.current.y) * k2;
      des.x += par.current.x;
      des.y += par.current.y;
    }

    const k = 1 - Math.exp(-3.4 * Math.min(dt, 0.05));
    camera.position.lerp(des, k);
    look.lerp(lookT, k);
    camera.lookAt(look);
  });
  return null;
}

/** keeps bus.time on the r3f clock (click handlers read it outside useFrame) */
function TimeSync({ bus }: { bus: React.MutableRefObject<StoryBus> }) {
  useFrame(({ clock }) => {
    bus.current.time = clock.elapsedTime;
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* static CSS fallback — layered gradients, never a blank hole        */
/* ------------------------------------------------------------------ */
function StaticFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: [
          "radial-gradient(42% 38% at 24% 32%, rgba(32,71,255,0.16), transparent 70%)",
          "radial-gradient(38% 36% at 76% 60%, rgba(32,71,255,0.10), transparent 70%)",
          "radial-gradient(30% 26% at 52% 78%, rgba(32,71,255,0.08), transparent 70%)",
          "radial-gradient(60% 50% at 50% 45%, rgba(255,255,255,0.45), transparent 75%)",
        ].join(","),
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* the WebGL canvas                                                    */
/* ------------------------------------------------------------------ */
function StoryCanvas({
  bus,
  dark,
  visible,
  setHover,
}: {
  bus: React.MutableRefObject<StoryBus>;
  dark: boolean;
  visible: boolean;
  setHover: (h: HoverInfo | null) => void;
}) {
  const pal = useMemo(() => palette(dark), [dark]);
  const tex = useMemo(() => makeDotTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);

  const bindHover = useCallback(
    (label: string): HoverBind => ({
      onPointerOver: (e) => {
        e.stopPropagation();
        setGroupGlow(e.eventObject as THREE.Group, true);
        document.body.style.cursor = "pointer";
        setHover({ label, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
      },
      onPointerOut: (e) => {
        e.stopPropagation();
        setGroupGlow(e.eventObject as THREE.Group, false);
        document.body.style.cursor = "";
        setHover(null);
      },
    }),
    [setHover]
  );

  const reduced = bus.current.reduced;

  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 42, position: [0, 0.9, 13.5], near: 0.1, far: 90 }}
      frameloop={reduced || !visible ? "never" : "always"}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.25} color="#ffffff" />
      <pointLight position={[-4, 3, 4]} intensity={26} distance={26} color={ELECTRIC} />
      <pointLight position={[5, -2, 3]} intensity={14} distance={24} color={pal.ice} />
      <TimeSync bus={bus} />
      <OrbitDots bus={bus} />
      <CampaignCard bus={bus} pal={pal} bindHover={bindHover} />
      <ClipField bus={bus} pal={pal} bindHover={bindHover} />
      <Streams bus={bus} pal={pal} tex={tex} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ProgressRing key={i} bus={bus} pal={pal} index={i} />
      ))}
      <Coins bus={bus} pal={pal} />
      <Vault bus={bus} pal={pal} bindHover={bindHover} />
      <Bursts bus={bus} pal={pal} />
      <Fountain bus={bus} pal={pal} />
      <CameraRig bus={bus} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* StoryFlow — pinned 500vh track + sticky viewport + overlay          */
/* ------------------------------------------------------------------ */
const CHAPTER_MID = [0.25, 0.45, 0.65, 0.875]; // chapters 1..4

export default function StoryFlow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const busRef = useRef<StoryBus>({
    progress: 0, pointer: { x: 0, y: 0 }, time: 0,
    bursts: [], fountainAt: -10, dark: false, coarse: false, reduced: false,
  });
  const progressRef = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [glOk, setGlOk] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const dark = useDark();
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setReduced(typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    setCoarse(
      typeof matchMedia !== "undefined" &&
        (matchMedia("(pointer: coarse)").matches || window.innerWidth < 768)
    );
    try {
      const c = document.createElement("canvas");
      setGlOk(!!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))));
    } catch {
      setGlOk(false);
    }
  }, []);

  useEffect(() => {
    busRef.current.dark = dark;
    busRef.current.reduced = reduced;
    busRef.current.coarse = coarse;
  }, [dark, reduced, coarse]);

  // scroll progress → bus + chapter state (runs even with reduced motion)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight);
        const p = Math.min(1, Math.max(0, -r.top / total));
        busRef.current.progress = p;
        progressRef.current = p;
        setChapter((c) => {
          const n = chapterOf(p);
          if (n !== c) setHover(null); // stale tooltips must not survive a chapter change
          return n === c ? c : n;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // pointer parallax (mouse only)
  useEffect(() => {
    if (reduced || coarse) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        busRef.current.pointer = {
          x: e.clientX / window.innerWidth - 0.5,
          y: -(e.clientY / window.innerHeight - 0.5),
        };
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, coarse]);

  // pause rendering offscreen
  useEffect(() => {
    const el = stickyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // tooltip follows cursor
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h));
  }, []);

  const goToChapter = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const frac = CHAPTER_MID[Math.min(3, Math.max(0, i - 1))];
      const top = el.getBoundingClientRect().top + window.scrollY;
      const total = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + frac * total, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced]
  );

  return (
    <div ref={trackRef} className="relative" style={{ height: "500vh" }} onMouseMove={onMouseMove}>
      <div ref={stickyRef} className="sticky top-0 overflow-hidden" style={{ height: "100svh" }}>
        {glOk === true ? (
          <StoryCanvas bus={busRef} dark={dark} visible={visible} setHover={setHover} />
        ) : glOk === false ? (
          <StaticFallback />
        ) : null}
        <StoryOverlay chapter={chapter} hover={hover} goToChapter={goToChapter} progressRef={progressRef} />
      </div>
    </div>
  );
}
