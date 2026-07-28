"use client";

/**
 * Pay3 — landing page (v2, TON-inspired)
 * Product of mecozx · pay3.space
 *
 * Structure and section rhythm (glow hero, stat strip, feature-tile grid,
 * minimal nav) are modeled on ton.org's actual current layout, pulled live
 * rather than guessed — adapted into Pay3's white/black/#67C6FE brand
 * instead of TON's dark theme, since the brand brief calls for a white
 * theme. No wallet code lives here — the wallet is a separate deployment
 * at app.pay3.space, the testnet at testnet.pay3.space, and the docs at
 * docs.pay3.space.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Chrome,
  Cpu,
  Zap,
  ShieldCheck,
  Gauge,
  Layers,
  Network,
  Repeat,
  BookOpen,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";

const WALLET_URL = "https://app.pay3.space";
const TESTNET_URL = "https://testnet.pay3.space";
const DOCS_URL = "https://docs.pay3.space";
const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/"; // TODO: replace with real listing URL once published

/* ------------------------------------------------------------------ */
/*  Voxel sphere hero visual (Three.js, client-only)                   */
/* ------------------------------------------------------------------ */

function VoxelSphere() {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let renderer, scene, camera, mesh, rafId, clock;
    let disposed = false;
    let handleResize;

    async function init() {
      const mount = mountRef.current;
      if (!mount) return;
      try {
        const THREE = await import("three");
        if (disposed || !mount) return;

        const width = mount.clientWidth || 1;
        const height = mount.clientHeight || 1;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 0, 9.2);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0x33465a, 1.3));
        const key = new THREE.DirectionalLight(0x67c6fe, 2.4);
        key.position.set(4, 5, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xffffff, 0.5);
        rim.position.set(-5, -3, -4);
        scene.add(rim);

        const COUNT = 420;
        const geometry = new THREE.BoxGeometry(0.16, 0.16, 0.16);
        const material = new THREE.MeshStandardMaterial({
          metalness: 0.4,
          roughness: 0.4,
          emissive: 0x081420,
          emissiveIntensity: 0.6,
        });
        const inst = new THREE.InstancedMesh(geometry, material, COUNT);

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        const baseColor = new THREE.Color(0x0d2438);
        const accentColor = new THREE.Color(0x67c6fe);
        const whiteColor = new THREE.Color(0xdff3ff);

        for (let i = 0; i < COUNT; i++) {
          const y = 1 - (i / (COUNT - 1)) * 2;
          const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
          const theta = i * Math.PI * (3 - Math.sqrt(5));
          const x = Math.cos(theta) * radiusAtY;
          const z = Math.sin(theta) * radiusAtY;

          const jitter = 1 + Math.sin(i * 12.9898) * 0.05;
          const spike = i % 41 === 0 ? 1.3 : i % 17 === 0 ? 1.12 : 1;
          const r = 2.15 * jitter * spike;

          dummy.position.set(x * r, y * r, z * r);
          const scale = 0.5 + Math.abs(Math.sin(i * 7.13)) * 0.8;
          dummy.scale.setScalar(scale);
          dummy.rotation.set(x * 2.1, y * 2.1, z * 2.1);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);

          const t = (y + 1) / 2;
          const facing = Math.max(0, x * 0.4 + z * 0.6);
          color.copy(baseColor).lerp(accentColor, Math.min(1, t * 0.9 + facing * 0.5));
          if (facing > 0.75 && t > 0.55) color.lerp(whiteColor, 0.35);
          inst.setColorAt(i, color);
        }
        inst.instanceMatrix.needsUpdate = true;
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;

        scene.add(inst);
        mesh = inst;

        const reduceMotion =
          typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        clock = new THREE.Clock();
        function animate() {
          if (disposed) return;
          const dt = clock.getDelta();
          if (!reduceMotion) {
            mesh.rotation.y += dt * 0.2;
            mesh.rotation.x = Math.sin(clock.elapsedTime * 0.16) * 0.1;
          }
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        }
        animate();
        setReady(true);

        handleResize = () => {
          const m = mountRef.current;
          if (!m || !renderer || !camera) return;
          const w = m.clientWidth || 1;
          const h = m.clientHeight || 1;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);
      } catch {
        /* WebGL unavailable — the CSS fallback glow behind this mount stays visible */
      }
    }

    init();

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
        const el = renderer.domElement;
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }
    };
  }, []);

  return (
    <div className="lp-voxel-wrap">
      <div className="lp-voxel-fallback" style={{ opacity: ready ? 0 : 1 }} />
      <div ref={mountRef} className="lp-voxel-mount" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll reveal + count-up                                           */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`lp-reveal ${visible ? "in" : ""} ${className}`} style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}>
      {children}
    </Tag>
  );
}

function useCountUp(target, visible, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, duration]);
  return value;
}

function StatItem({ label, value, numeric, suffix = "", prefix = "", statusDot }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const n = useCountUp(numeric ?? 0, visible && numeric != null);

  return (
    <div className="lp-stat" ref={ref}>
      <div className="lp-stat-value">
        {statusDot && <span className="lp-stat-dot" />}
        {numeric != null ? (
          <>
            {prefix}
            {Math.round(n)}
            {suffix}
          </>
        ) : (
          value
        )}
      </div>
      <div className="lp-stat-label">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Brand mark                                                         */
/* ------------------------------------------------------------------ */

function BrandMark() {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="lp-brand-mark">P3</div>;
  return <img src="/logo.png" alt="Pay3" className="lp-brand-mark-img" onError={() => setFailed(true)} />;
}

/* ------------------------------------------------------------------ */
/*  Content data                                                       */
/* ------------------------------------------------------------------ */

const VISION = [
  {
    icon: Gauge,
    title: "Speed that feels instant",
    body: "Deterministic, sub-second finality is the target — once validators agree, it's settled, not \"probably safe after a few blocks.\"",
  },
  {
    icon: Zap,
    title: "Fees you stop thinking about",
    body: "Low fees fall out of throughput, not a subsidy — the same demand spread across a much higher capacity ceiling.",
  },
  {
    icon: Network,
    title: "EVM-compatible from day one",
    body: "Existing wallets, tooling, and contracts work against Pay3 with little to no changes — including the wallet you can use right now.",
  },
];

const FEATURES = [
  { icon: ShieldCheck, title: "BFT-style consensus", body: "Deterministic finality once ≥2/3 of staked validators agree — the target, replacing today's single-authority testnet sealing." },
  { icon: Cpu, title: "Parallel execution", body: "Non-conflicting transactions run across cores simultaneously instead of one after another." },
  { icon: Layers, title: "Merkle-proven state", body: "Every balance and contract provable against a single root hash, with pruning planned from day one." },
  { icon: Network, title: "EVM-compatible RPC", body: "The same eth_* interface wallets already speak — zero rewrites for existing tooling." },
  { icon: Zap, title: "Low, predictable fees", body: "A direct consequence of throughput, not a promotional discount that runs out." },
  { icon: Cpu, title: "Built in Rust", body: "No GC pauses, memory safety enforced at compile time — the same reasoning nearly every recent high-performance L1 has reached for." },
];

const AVAILABLE = [
  {
    icon: Repeat,
    title: "Pay3 Wallet",
    status: "Live",
    body: "Self-custody, multi-chain — 9 chains including Solana, WalletConnect, gas-optimized sends.",
    href: WALLET_URL,
    cta: "Launch Wallet",
  },
  {
    icon: FlaskConical,
    title: "Pay3 Testnet",
    status: "Live",
    body: "A real running prototype of the Pay3 chain — send transactions, check balances, watch blocks seal.",
    href: TESTNET_URL,
    cta: "Try the Testnet",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    status: "Docs",
    body: "Architecture, design goals, and exactly how to run or deploy the testnet yourself.",
    href: DOCS_URL,
    cta: "Read the Docs",
  },
];

const ROADMAP = [
  { stage: "Pay3 Wallet", detail: "Multi-chain self-custody wallet, WalletConnect, 9 chains", status: "live" },
  { stage: "Pay3 L1 Testnet", detail: "Single-node prototype — mempool, blocks, transfers, live today", status: "live" },
  { stage: "Networked Testnet", detail: "Real P2P gossip and BFT-style voting across multiple validators", status: "progress" },
  { stage: "Pay3 L1 Mainnet", detail: "Production network launch", status: "planned" },
  { stage: "Chrome Extension", detail: "Pay3 Wallet as a browser extension", status: "planned" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="lp-root">
      <style jsx global>{`
        @font-face {
          font-family: "Pay3Hero";
          src: url("/fonts/font.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        :root {
          --lp-accent: #67c6fe;
          --lp-ink: #000000;
          --lp-ink-soft: rgba(0, 0, 0, 0.6);
          --lp-ink-faint: rgba(0, 0, 0, 0.4);
          --lp-line: rgba(0, 0, 0, 0.1);
        }
        * {
          box-sizing: border-box;
        }
        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }
        body {
          font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
          color: var(--lp-ink);
          -webkit-font-smoothing: antialiased;
        }
        a {
          color: inherit;
        }
        .lp-root {
          overflow-x: hidden;
        }
        .lp-hero-word {
          font-family: "Pay3Hero", "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
        }
        .lp-container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 28px;
        }

        .lp-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-reveal.in {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-reveal {
            transition: none;
            opacity: 1;
            transform: none;
          }
        }

        /* ---------- nav ---------- */
        .lp-nav {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--lp-line);
        }
        .lp-nav-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 15px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.02em;
          text-decoration: none;
          flex-shrink: 0;
        }
        .lp-brand-mark,
        .lp-brand-mark-img {
          width: 27px;
          height: 27px;
          border-radius: 7px;
        }
        .lp-brand-mark {
          background: linear-gradient(135deg, #000 0%, #333 45%, var(--lp-accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--lp-accent);
          font-size: 12px;
          font-weight: 700;
        }
        .lp-brand-mark-img {
          object-fit: cover;
        }
        .lp-navlinks {
          display: flex;
          align-items: center;
          gap: 26px;
          font-size: 13.5px;
          font-weight: 500;
          margin-left: auto;
        }
        .lp-navlinks a {
          text-decoration: none;
          color: var(--lp-ink-soft);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .lp-navlinks a:hover {
          color: var(--lp-ink);
        }
        @media (max-width: 720px) {
          .lp-navlinks .hide-mobile {
            display: none;
          }
        }

        /* ---------- buttons ---------- */
        .lp-btn {
          appearance: none;
          border: none;
          border-radius: 11px;
          padding: 12px 20px;
          font-family: inherit;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
          white-space: nowrap;
        }
        .lp-btn:active {
          transform: scale(0.97);
        }
        .lp-btn.primary {
          background: var(--lp-accent);
          color: #000;
        }
        .lp-btn.primary:hover {
          background: #7fd0fe;
        }
        .lp-btn.dark {
          background: #000;
          color: #fff;
        }
        .lp-btn.dark:hover {
          background: #1a1a1a;
        }
        .lp-btn.outline {
          background: transparent;
          border: 1.5px solid var(--lp-line);
          color: var(--lp-ink);
        }
        .lp-btn.outline:hover {
          border-color: rgba(0, 0, 0, 0.35);
        }
        .lp-btn.ghost-light {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.28);
        }
        .lp-btn.ghost-light:hover {
          background: rgba(255, 255, 255, 0.16);
        }
        .lp-btn.disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .lp-btn.sm {
          padding: 9px 15px;
          font-size: 13px;
        }
        .lp-soon-tag {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 7px;
          border-radius: 6px;
          margin-left: 2px;
        }
        .lp-cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* ---------- hero ---------- */
        .lp-hero {
          position: relative;
          background: linear-gradient(160deg, #000 0%, #0a0a0a 55%, #103a52 150%);
          color: #fff;
          overflow: hidden;
        }
        .lp-hero-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: var(--lp-accent);
          filter: blur(150px);
          opacity: 0.25;
          right: -160px;
          top: -180px;
          pointer-events: none;
        }
        .lp-hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
          padding: 76px 0 0;
        }
        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(103, 198, 254, 0.35);
          background: rgba(103, 198, 254, 0.08);
          padding: 7px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
        }
        .lp-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3ddc7a;
          box-shadow: 0 0 0 3px rgba(61, 220, 122, 0.2);
        }
        .lp-hero-word {
          font-size: clamp(46px, 8vw, 96px);
          line-height: 0.95;
          letter-spacing: -0.01em;
          margin: 0 0 14px;
          color: #fff;
        }
        .lp-hero h2.tagline {
          font-size: clamp(19px, 2.4vw, 27px);
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0 0 16px;
          color: rgba(255, 255, 255, 0.92);
        }
        .lp-hero p.sub {
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.62);
          max-width: 480px;
          margin: 0 0 32px;
          line-height: 1.65;
        }
        .lp-voxel-wrap {
          position: relative;
          width: min(420px, 82vw);
          height: min(420px, 82vw);
          margin: 0 auto;
        }
        .lp-voxel-fallback {
          position: absolute;
          inset: 10%;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 32%, #7fd0fe 0%, #103a52 55%, #061420 100%);
          transition: opacity 0.4s ease;
        }
        .lp-voxel-mount {
          position: absolute;
          inset: 0;
        }
        .lp-voxel-mount canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }
        @media (max-width: 860px) {
          .lp-hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 56px;
          }
          .lp-hero p.sub {
            margin-left: auto;
            margin-right: auto;
          }
          .lp-cta-row {
            justify-content: center;
          }
          .lp-voxel-wrap {
            margin-top: 20px;
          }
        }

        /* ---------- stat strip ---------- */
        .lp-stats {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 56px;
        }
        .lp-stat {
          padding: 22px 18px;
          text-align: center;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        .lp-stat:first-child {
          border-left: none;
        }
        .lp-stat-value {
          font-size: clamp(20px, 2.6vw, 28px);
          font-weight: 700;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .lp-stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3ddc7a;
          box-shadow: 0 0 0 4px rgba(61, 220, 122, 0.18);
        }
        .lp-stat-label {
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 5px;
        }
        @media (max-width: 720px) {
          .lp-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .lp-stat:nth-child(3) {
            border-left: none;
          }
        }

        /* ---------- section shell ---------- */
        .lp-section {
          padding: 90px 0;
        }
        .lp-section.tight {
          padding: 70px 0;
        }
        .lp-section-head {
          text-align: center;
          max-width: 620px;
          margin: 0 auto 50px;
        }
        .lp-kicker {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--lp-accent);
          margin-bottom: 12px;
        }
        .lp-section-head h2 {
          font-size: clamp(26px, 3.6vw, 38px);
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin: 0 0 12px;
        }
        .lp-section-head p {
          font-size: 15px;
          color: var(--lp-ink-soft);
          line-height: 1.6;
          margin: 0;
        }

        /* ---------- vision cards ---------- */
        .lp-vision {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lp-vision-card {
          padding: 28px 24px;
          border-radius: 18px;
          border: 1px solid var(--lp-line);
        }
        .lp-vision-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #000;
          color: var(--lp-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .lp-vision-card h3 {
          font-size: 16px;
          margin: 0 0 8px;
        }
        .lp-vision-card p {
          font-size: 13.5px;
          color: var(--lp-ink-soft);
          line-height: 1.6;
          margin: 0;
        }
        @media (max-width: 860px) {
          .lp-vision {
            grid-template-columns: 1fr;
          }
        }

        /* ---------- feature tiles ---------- */
        .lp-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--lp-line);
          border: 1px solid var(--lp-line);
          border-radius: 20px;
          overflow: hidden;
        }
        .lp-feature {
          background: #fff;
          padding: 26px 22px;
        }
        .lp-feature-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(103, 198, 254, 0.12);
          color: #1c8fd6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .lp-feature h3 {
          font-size: 14.5px;
          margin: 0 0 7px;
        }
        .lp-feature p {
          font-size: 12.5px;
          color: var(--lp-ink-soft);
          line-height: 1.55;
          margin: 0;
        }
        @media (max-width: 860px) {
          .lp-features {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .lp-features {
            grid-template-columns: 1fr;
          }
        }

        /* ---------- available today ---------- */
        .lp-available {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lp-avail-card {
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          border: 1.5px solid var(--lp-line);
          padding: 28px 24px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .lp-avail-card:hover {
          border-color: rgba(0, 0, 0, 0.3);
          transform: translateY(-3px);
        }
        .lp-avail-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .lp-avail-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #000;
          color: var(--lp-accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-avail-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 9px;
          border-radius: 20px;
          background: rgba(61, 220, 122, 0.12);
          color: #1a9e4a;
        }
        .lp-avail-status.docs {
          background: rgba(103, 198, 254, 0.14);
          color: #1c8fd6;
        }
        .lp-avail-card h3 {
          font-size: 17px;
          margin: 0 0 8px;
        }
        .lp-avail-card p {
          font-size: 13px;
          color: var(--lp-ink-soft);
          line-height: 1.6;
          margin: 0 0 20px;
          flex: 1;
        }
        .lp-avail-link {
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        @media (max-width: 860px) {
          .lp-available {
            grid-template-columns: 1fr;
          }
        }

        /* ---------- roadmap ---------- */
        .lp-roadmap {
          max-width: 640px;
          margin: 0 auto;
        }
        .lp-road-row {
          display: grid;
          grid-template-columns: 120px 24px 1fr;
        }
        .lp-road-stage {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 20px 0;
        }
        .lp-road-stage.live {
          color: #1a9e4a;
        }
        .lp-road-stage.progress {
          color: #1c8fd6;
        }
        .lp-road-stage.planned {
          color: var(--lp-ink-faint);
        }
        .lp-road-line {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .lp-road-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          margin-top: 22px;
          flex-shrink: 0;
        }
        .lp-road-dot.live {
          background: #1a9e4a;
        }
        .lp-road-dot.progress {
          background: #1c8fd6;
        }
        .lp-road-dot.planned {
          background: var(--lp-line);
        }
        .lp-road-bar {
          width: 1.5px;
          flex: 1;
          background: var(--lp-line);
        }
        .lp-road-body {
          padding: 16px 0 30px;
          border-bottom: 1px solid var(--lp-line);
        }
        .lp-road-row:last-child .lp-road-body {
          border-bottom: none;
        }
        .lp-road-body h4 {
          font-size: 16px;
          margin: 0 0 5px;
        }
        .lp-road-body p {
          font-size: 13px;
          color: var(--lp-ink-soft);
          margin: 0;
        }

        /* ---------- footer ---------- */
        .lp-footer {
          background: #fafafa;
          border-top: 1px solid var(--lp-line);
          padding: 64px 0 30px;
        }
        .lp-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 32px;
          padding-bottom: 40px;
        }
        .lp-footer-brand p {
          font-size: 13px;
          color: var(--lp-ink-soft);
          line-height: 1.6;
          margin: 14px 0 0;
          max-width: 260px;
        }
        .lp-footer-col h5 {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--lp-ink-faint);
          margin: 0 0 14px;
        }
        .lp-footer-col a {
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--lp-ink-soft);
          margin-bottom: 11px;
        }
        .lp-footer-col a:hover {
          color: var(--lp-ink);
        }
        .lp-footer-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #1a9e4a;
          margin-top: 2px;
        }
        .lp-footer-bottom {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 24px;
          border-top: 1px solid var(--lp-line);
          font-size: 11.5px;
          color: var(--lp-ink-faint);
        }
        .lp-footer-bottom .tags {
          color: var(--lp-ink-faint);
        }
        @media (max-width: 780px) {
          .lp-footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .lp-footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-brand">
            <BrandMark />
            Pay3
          </Link>
          <div className="lp-navlinks">
            <a href={DOCS_URL} className="hide-mobile">
              Docs
            </a>
            <a href={TESTNET_URL} className="hide-mobile">
              Testnet
            </a>
          </div>
          <Link href={WALLET_URL} className="lp-btn dark sm">
            Launch Wallet <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-container">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-eyebrow">
                <span className="lp-eyebrow-dot" />
                Testnet live — try it now
              </div>
              <h1 className="lp-hero-word">PAY3</h1>
              <h2 className="tagline">A Layer 1 built to settle in under a second.</h2>
              <p className="sub">
                Pay3 is a new blockchain designed for high throughput, deterministic finality, and fees low
                enough to stop thinking about — EVM-compatible from day one, with a live testnet and wallet
                you can use right now.
              </p>
              <div className="lp-cta-row">
                <a href={WALLET_URL} className="lp-btn primary">
                  <Repeat size={16} /> Launch Wallet
                </a>
                <a href={TESTNET_URL} className="lp-btn ghost-light">
                  <FlaskConical size={16} /> Try the Testnet
                </a>
                <button className="lp-btn ghost-light disabled" disabled title="Coming soon">
                  <Chrome size={16} /> Chrome
                  <span className="lp-soon-tag">SOON</span>
                </button>
              </div>
            </div>
            <VoxelSphere />
          </div>

          <div className="lp-stats">
            <StatItem label="Testnet status" value="Live" statusDot />
            <StatItem label="Chains supported" numeric={9} />
            <StatItem label="Finality target" value="<1s" />
            <StatItem label="TPS target" numeric={10000} suffix="+" />
          </div>
        </div>
      </header>

      {/* Vision */}
      <section className="lp-section">
        <div className="lp-container">
          <Reveal as="div" className="lp-section-head">
            <div className="lp-kicker">Vision</div>
            <h2>Blockchain that doesn't feel like one</h2>
            <p>Three things Pay3's architecture is built around, in order of how much they shape everything else.</p>
          </Reveal>
          <div className="lp-vision">
            {VISION.map((v, i) => (
              <Reveal key={v.title} delay={i * 90} className="lp-vision-card">
                <div className="lp-vision-icon">
                  <v.icon size={19} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="lp-section tight" style={{ background: "#fafafa" }}>
        <div className="lp-container">
          <Reveal as="div" className="lp-section-head">
            <div className="lp-kicker">Key features</div>
            <h2>Technological direction</h2>
            <p>Where the engineering effort actually goes — some of this runs today in prototype form, all of it is the target design.</p>
          </Reveal>
          <Reveal as="div" className="lp-features">
            {FEATURES.map((f) => (
              <div className="lp-feature" key={f.title}>
                <div className="lp-feature-icon">
                  <f.icon size={16} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Available today */}
      <section className="lp-section" id="available">
        <div className="lp-container">
          <Reveal as="div" className="lp-section-head">
            <div className="lp-kicker">Available now</div>
            <h2>You don't have to wait for mainnet</h2>
            <p>Three things are real and running today — try any of them directly.</p>
          </Reveal>
          <div className="lp-available">
            {AVAILABLE.map((a, i) => (
              <Reveal key={a.title} delay={i * 90}>
                <a href={a.href} className="lp-avail-card">
                  <div className="lp-avail-top">
                    <div className="lp-avail-icon">
                      <a.icon size={19} />
                    </div>
                    <span className={`lp-avail-status ${a.status === "Docs" ? "docs" : ""}`}>
                      {a.status !== "Docs" && <CheckCircle2 size={11} />}
                      {a.status}
                    </span>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                  <span className="lp-avail-link">
                    {a.cta} <ArrowUpRight size={14} />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="lp-section tight" style={{ background: "#fafafa" }} id="roadmap">
        <div className="lp-container">
          <Reveal as="div" className="lp-section-head">
            <div className="lp-kicker">Where things stand</div>
            <h2>Built in stages, on purpose</h2>
            <p>No fixed dates yet — this is the order things are happening in, updated as it moves.</p>
          </Reveal>
          <Reveal as="div" className="lp-roadmap">
            {ROADMAP.map((r, i) => (
              <div className="lp-road-row" key={r.stage}>
                <div className={`lp-road-stage ${r.status}`}>
                  {r.status === "live" ? "Live" : r.status === "progress" ? "In progress" : "Planned"}
                </div>
                <div className="lp-road-line">
                  <div className={`lp-road-dot ${r.status}`} />
                  {i < ROADMAP.length - 1 && <div className="lp-road-bar" />}
                </div>
                <div className="lp-road-body">
                  <h4>{r.stage}</h4>
                  <p>{r.detail}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Link href="/" className="lp-brand">
                <BrandMark />
                Pay3
              </Link>
              <p>A Layer 1 blockchain built for speed, security, and fees you barely notice. In active development.</p>
            </div>
            <div className="lp-footer-col">
              <h5>Product</h5>
              <a href={WALLET_URL}>
                Wallet <ArrowUpRight size={12} />
              </a>
              <a href={TESTNET_URL}>
                Testnet <ArrowUpRight size={12} />
              </a>
              <a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer">
                Chrome extension <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="lp-footer-col">
              <h5>Developers</h5>
              <a href={DOCS_URL}>
                Documentation <ArrowUpRight size={12} />
              </a>
              <a href={`${DOCS_URL}/architecture`}>
                Architecture <ArrowUpRight size={12} />
              </a>
              <a href={`${DOCS_URL}/testnet`}>
                Run a node <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="lp-footer-col">
              <h5>Status</h5>
              <div className="lp-footer-status">
                <CheckCircle2 size={13} /> Wallet — live
              </div>
              <div className="lp-footer-status" style={{ marginTop: 8 }}>
                <CheckCircle2 size={13} /> Testnet — live
              </div>
              <a href="#roadmap" style={{ marginTop: 12 }}>
                Full roadmap <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© Pay3 · a product of mecozx</span>
            <span className="tags">[ L1 ] &nbsp; [ EVM Compatible ] &nbsp; [ Testnet Live ]</span>
            <span>pay3.space © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
