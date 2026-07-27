"use client";

/**
 * Pay3 — landing page (poster style)
 * Product of mecozx · pay3.space
 *
 * Standalone marketing page for the upcoming Pay3 L1. No wallet code lives
 * here on purpose — the wallet is a separate deployment at app.pay3.space.
 *
 * Two URLs to keep an eye on:
 * - WALLET_URL points at the live wallet app (a different deployment/domain).
 * - CHROME_EXTENSION_URL is a placeholder (Chrome Web Store homepage) until
 *   the real extension exists — swap it for the real listing URL once it's
 *   published. The button is enabled (not "coming soon") per request, so
 *   make sure this is updated before launch or it'll send people somewhere
 *   generic instead of to your actual extension.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Chrome } from "lucide-react";

const WALLET_URL = "https://app.pay3.space";
const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/"; // TODO: replace with real listing URL

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

        const COUNT = 460;
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
          const spike = i % 41 === 0 ? 1.32 : i % 17 === 0 ? 1.14 : 1;
          const r = 2.15 * jitter * spike;

          dummy.position.set(x * r, y * r, z * r);
          const scale = 0.55 + Math.abs(Math.sin(i * 7.13)) * 0.85;
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
            mesh.rotation.y += dt * 0.22;
            mesh.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.12;
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
/*  Dither transition band (deterministic — no hydration mismatch)     */
/* ------------------------------------------------------------------ */

function DitherBand() {
  const cols = 56;
  const rows = 9;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c + 1;
      const seed = Math.abs(Math.sin(i * 12.9898 + r * 78.233) * 43758.5453);
      const rand = seed - Math.floor(seed);
      const rowT = r / (rows - 1);
      cells.push(rand < rowT * 1.05);
    }
  }
  return (
    <div className="lp-dither" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden="true">
      {cells.map((isWhite, i) => (
        <span key={i} className={isWhite ? "w" : "b"} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll reveal                                                       */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "" }) {
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
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`lp-reveal ${visible ? "in" : ""} ${className}`}>
      {children}
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
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="lp-root">
      <style jsx global>{`
        :root {
          --lp-accent: #67c6fe;
        }
        * {
          box-sizing: border-box;
        }
        html,
        body {
          margin: 0;
          padding: 0;
          background: #000;
        }
        body {
          font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        a {
          color: inherit;
        }
        .lp-root {
          overflow-x: hidden;
        }
        .lp-pixel {
          font-family: "Press Start 2P", "Space Grotesk", monospace;
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-reveal,
          .lp-hero-enter {
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* ---------- nav ---------- */
        .lp-nav {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.01em;
          text-decoration: none;
          color: #fff;
        }
        .lp-brand-mark,
        .lp-brand-mark-img {
          width: 26px;
          height: 26px;
          border-radius: 6px;
        }
        .lp-brand-mark {
          background: linear-gradient(135deg, #000 0%, #333 45%, var(--lp-accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--lp-accent);
          font-size: 11px;
          font-weight: 700;
        }
        .lp-brand-mark-img {
          object-fit: cover;
        }
        .lp-nav-ctas {
          display: flex;
          gap: 10px;
        }
        .lp-navbtn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .lp-navbtn:active {
          transform: scale(0.96);
        }
        .lp-navbtn.primary {
          background: var(--lp-accent);
          color: #000;
          border-color: var(--lp-accent);
        }
        .lp-navbtn:not(.primary):hover {
          background: rgba(255, 255, 255, 0.08);
        }

        /* ---------- hero ---------- */
        .lp-hero {
          position: relative;
          background: #000;
          padding: 64px 24px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          overflow: hidden;
        }
        .lp-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 7px 14px;
          border-radius: 20px;
          margin-bottom: 34px;
          opacity: 0;
          animation: lpFadeUp 0.7s ease forwards;
        }
        .lp-hero-tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--lp-accent);
        }
        .lp-hero h1 {
          margin: 0;
          color: #fff;
          line-height: 1.5;
          font-size: clamp(30px, 8vw, 74px);
        }
        .lp-hero h1 span {
          display: block;
          opacity: 0;
          animation: lpFadeUp 0.8s ease forwards;
        }
        .lp-hero h1 span.accent {
          color: var(--lp-accent);
          animation-delay: 0.15s;
        }
        @keyframes lpFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .lp-voxel-wrap {
          position: relative;
          width: min(560px, 88vw);
          height: min(560px, 88vw);
          margin-top: -28px;
          margin-bottom: -10px;
          opacity: 0;
          animation: lpFadeUp 1s ease forwards;
          animation-delay: 0.3s;
        }
        .lp-voxel-fallback {
          position: absolute;
          inset: 12%;
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
        .lp-hero-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.02em;
          margin-top: 10px;
          opacity: 0;
          animation: lpFadeUp 0.8s ease forwards;
          animation-delay: 0.5s;
        }

        /* ---------- dither ---------- */
        .lp-dither {
          display: grid;
          background: #000;
          gap: 3px;
          padding: 3px 0;
        }
        .lp-dither span {
          aspect-ratio: 1;
        }
        .lp-dither span.w {
          background: #fff;
        }
        .lp-dither span.b {
          background: transparent;
        }

        /* ---------- content ---------- */
        .lp-content {
          background: #fff;
          padding: 70px 28px 60px;
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-wordmark {
          font-size: clamp(26px, 4vw, 40px);
          color: var(--lp-accent);
          line-height: 1.5;
        }
        .lp-wordmark-sub {
          margin-top: 16px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.45);
        }
        .lp-para {
          display: flex;
          gap: 18px;
          max-width: 480px;
        }
        .lp-para .dash {
          color: rgba(0, 0, 0, 0.3);
          font-size: 20px;
          line-height: 1.5;
        }
        .lp-para p {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          line-height: 1.6;
        }
        .lp-caption-row {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin: 34px 0 26px;
          max-width: 560px;
          flex-wrap: wrap;
        }
        .lp-caption-row div {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.4);
          max-width: 220px;
          line-height: 1.5;
        }
        .lp-cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 22px;
          border-radius: 9px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border: 2px solid #000;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .lp-btn:active {
          transform: scale(0.97);
        }
        .lp-btn.primary {
          background: var(--lp-accent);
          color: #000;
          border-color: var(--lp-accent);
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
        @media (max-width: 860px) {
          .lp-content {
            grid-template-columns: 1fr;
            padding: 50px 24px 50px;
          }
        }

        /* ---------- reveal ---------- */
        .lp-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .lp-reveal.in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ---------- footer ---------- */
        .lp-footer {
          background: #fff;
          border-top: 1.5px solid rgba(0, 0, 0, 0.12);
          padding: 22px 28px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(0, 0, 0, 0.55);
        }
        .lp-footer .tags {
          color: rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* Nav */}
      <div style={{ background: "#000" }}>
        <nav className="lp-nav">
          <a href="/" className="lp-brand">
            <BrandMark />
            PAY3
          </a>
          <div className="lp-nav-ctas">
            <a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer" className="lp-navbtn">
              <Chrome size={13} /> Chrome
            </a>
            <a href={WALLET_URL} className="lp-navbtn primary">
              Launch Wallet
            </a>
          </div>
        </nav>

        {/* Hero */}
        <header className="lp-hero">
          <div className="lp-hero-tag">
            <span className="lp-hero-tag-dot" />
            Pay3 L1 — coming soon
          </div>
          <h1 className="lp-pixel">
            <span>PAY3</span>
            <span className="accent">IS COMING</span>
          </h1>
          <VoxelSphere />
          <div className="lp-hero-sub">A LAYER 1 BLOCKCHAIN BUILT FOR SPEED — IN DEVELOPMENT</div>
        </header>
      </div>

      <DitherBand />

      {/* Content */}
      <div className="lp-content">
        <Reveal>
          <div className="lp-pixel lp-wordmark">PAY3</div>
          <div className="lp-wordmark-sub">Layer 1 · Est. 2026</div>
        </Reveal>

        <div>
          <Reveal className="lp-para">
            <span className="dash">—</span>
            <p>
              An upcoming Layer 1 blockchain built for high throughput, deterministic finality, and fees
              low enough to stop thinking about.
            </p>
          </Reveal>

          <Reveal className="lp-caption-row">
            <div>Ready to try it now?</div>
            <div>Get the wallet or the Chrome extension below.</div>
          </Reveal>

          <Reveal className="lp-cta-row">
            <a href={WALLET_URL} className="lp-btn primary">
              Launch Wallet <ArrowRight size={15} />
            </a>
            <a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer" className="lp-btn dark">
              <Chrome size={16} /> Add to Chrome
            </a>
          </Reveal>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer">
        <span>© Pay3 · a product of mecozx</span>
        <span className="tags">[ L1 ] &nbsp; [ EVM Compatible ]</span>
        <span>pay3.space © 2026</span>
      </footer>
    </div>
  );
}
