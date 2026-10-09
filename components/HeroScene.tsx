"use client";

/**
 * HeroScene — real Three.js scroll-driven 3D hero (Vectr/K95-inspired).
 *
 * Abstract "precision" scene: translucent glass geometric forms in ice-blue
 * and electric blue + dotted orbital ellipses (Vectr's motif), floating in a
 * soft void. Scrolling the pinned hero drives a cinematic camera dolly;
 * the pointer adds subtle parallax.
 *
 * Robustness (non-negotiable):
 * - No WebGL -> layered CSS gradient fallback (never a blank hole)
 * - pixelRatio capped at 1.5, rendering pauses when offscreen
 * - prefers-reduced-motion -> a single static frame
 * - No text inside the canvas (SEO/a11y); canvas is aria-hidden
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const ICE = "#CFE0EC";
const ELECTRIC = "#2047FF";

/* ------------------------------------------------------------------ */
/* Procedural soft-dot sprite for the orbital ellipses                 */
/* ------------------------------------------------------------------ */
function makeDotTexture(): THREE.Texture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

function ellipseGeometry(rx: number, rz: number, segments = 240): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * rx, 0, Math.sin(a) * rz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/* ------------------------------------------------------------------ */
/* Scene contents                                                      */
/* ------------------------------------------------------------------ */

function GlassShapes() {
  const mat = (color: string, opacity: number) => (
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={opacity}
      roughness={0.12}
      metalness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.12}
    />
  );
  return (
    <group>
      <Float speed={1.1} rotationIntensity={0.5} floatIntensity={1.1}>
        <mesh position={[-3.6, 1.1, 1.5]}>
          <icosahedronGeometry args={[1.7, 0]} />
          {mat(ICE, 0.38)}
        </mesh>
      </Float>
      <Float speed={1.4} rotationIntensity={0.7} floatIntensity={1.4}>
        <mesh position={[3.4, -1.3, -1.2]} rotation={[0.6, 0.2, 0]}>
          <torusGeometry args={[1.0, 0.34, 32, 90, 4.4]} />
          {mat(ELECTRIC, 0.5)}
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.9}>
        <mesh position={[0.6, 2.3, -4.2]}>
          <octahedronGeometry args={[1.15, 0]} />
          {mat(ICE, 0.32)}
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.9} floatIntensity={1.6}>
        <mesh position={[-1.6, -2.5, -7]}>
          <icosahedronGeometry args={[0.85, 1]} />
          {mat(ELECTRIC, 0.42)}
        </mesh>
      </Float>
      <Float speed={1.0} rotationIntensity={0.3} floatIntensity={1.0}>
        <mesh position={[2.2, 2.8, -9.5]} rotation={[1.1, 0.4, 0.2]}>
          <torusGeometry args={[1.3, 0.16, 24, 80]} />
          {mat(ICE, 0.28)}
        </mesh>
      </Float>
    </group>
  );
}

function OrbitDots() {
  const tex = useMemo(() => makeDotTexture(), []);
  const rings = useMemo(
    () => [
      { geo: ellipseGeometry(5.2, 3.4), pos: [0, 0.4, -2] as const, rot: [0.5, 0, 0.25] as const, color: ELECTRIC, size: 0.1 },
      { geo: ellipseGeometry(6.8, 4.6), pos: [0, -0.6, -5] as const, rot: [-0.35, 0, -0.15] as const, color: ICE, size: 0.085 },
      { geo: ellipseGeometry(4.2, 2.8), pos: [0, 1.2, -8] as const, rot: [0.7, 0, 0.5] as const, color: ELECTRIC, size: 0.075 },
    ],
    []
  );
  useEffect(() => () => {
    tex.dispose();
    rings.forEach((r) => r.geo.dispose());
  }, [tex, rings]);
  return (
    <group>
      {rings.map((r, i) => (
        <points key={i} geometry={r.geo} position={[r.pos[0], r.pos[1], r.pos[2]]} rotation={[r.rot[0], r.rot[1], r.rot[2]]}>
          <pointsMaterial
            size={r.size}
            map={tex}
            color={r.color}
            transparent
            opacity={0.85}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-driven cinematic camera + pointer parallax                   */
/* ------------------------------------------------------------------ */

function CameraRig({
  progressRef,
  pointerRef,
  reduced,
}: {
  progressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, dt) => {
    if (reduced) return;
    const p = progressRef.current;
    // Cinematic dolly: push forward + drift as the user scrolls
    target.set(
      THREE.MathUtils.lerp(0, 1.9, p) + pointerRef.current.x * 0.7,
      THREE.MathUtils.lerp(0.6, -0.9, p) + pointerRef.current.y * 0.45,
      THREE.MathUtils.lerp(13, 5.2, p)
    );
    const k = 1 - Math.exp(-3.2 * dt);
    camera.position.lerp(target, k);
    lookTarget.set(
      THREE.MathUtils.lerp(0, 0.6, p),
      THREE.MathUtils.lerp(0, -0.4, p),
      THREE.MathUtils.lerp(0, -2.5, p)
    );
    look.lerp(lookTarget, k);
    camera.lookAt(look);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Static CSS fallback — layered gradients, never a blank hole        */
/* ------------------------------------------------------------------ */

function StaticFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: [
          "radial-gradient(42% 38% at 22% 30%, rgba(32,71,255,0.16), transparent 70%)",
          "radial-gradient(36% 34% at 78% 62%, rgba(32,71,255,0.10), transparent 70%)",
          "radial-gradient(60% 50% at 50% 45%, rgba(255,255,255,0.5), transparent 75%)",
        ].join(","),
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Public component: pinned ~170vh hero with sticky 3D canvas          */
/* ------------------------------------------------------------------ */

export default function HeroScene({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [glOk, setGlOk] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [reduced] = useState(
    () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // WebGL capability check (client-only; SSR renders the fallback first)
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const ok = !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl2") || c.getContext("webgl"))
      );
      setGlOk(ok);
    } catch {
      setGlOk(false);
    }
  }, []);

  // Scroll progress (0..1 across the pinned track)
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight);
        progressRef.current = Math.min(1, Math.max(0, -r.top / total));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Pointer parallax
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        pointerRef.current = {
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
  }, [reduced]);

  // Pause rendering when the hero is offscreen
  useEffect(() => {
    const el = stickyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={trackRef} className="relative" style={{ height: "170vh" }}>
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden" style={{ height: "100svh" }}>
        {glOk === true ? (
          <Canvas
            aria-hidden
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ fov: 42, position: [0, 0.6, 13], near: 0.1, far: 60 }}
            frameloop={reduced || !visible ? "never" : "always"}
            className="!absolute !inset-0"
            style={{ position: "absolute", inset: 0 }}
          >
            <ambientLight intensity={0.75} />
            <directionalLight position={[5, 8, 5]} intensity={1.3} color="#ffffff" />
            <pointLight position={[-4, 2, 3]} intensity={30} distance={24} color={ELECTRIC} />
            <pointLight position={[4, -2, 2]} intensity={18} distance={22} color={ICE} />
            <GlassShapes />
            <OrbitDots />
            <CameraRig progressRef={progressRef} pointerRef={pointerRef} reduced={reduced} />
          </Canvas>
        ) : (
          <StaticFallback />
        )}
        {/* Content overlay — headline etc. */}
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="pointer-events-auto w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
