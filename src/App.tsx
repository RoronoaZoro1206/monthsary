import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties, type ReactNode } from "react";

type Page = "letter" | "gallery" | "bouquet";
type HeartStyle = CSSProperties & Record<`--${string}`, string>;
type RevealStyle = CSSProperties & { "--reveal-delay": string };

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

function RevealSection({ children, className = "", id, delay = 0 }: RevealSectionProps) {
  const style: RevealStyle = { "--reveal-delay": `${delay}ms` };
  return (
    <section id={id} className={`glass-card reveal ${className}`.trim()} style={style}>
      {children}
    </section>
  );
}

const defaultLetter = `My dearest Shelly,

Happy 1st Monthsary, Love.

Thank you for being my peace, my joy, and my favorite person to share every day with. Since April 30, 2026, every moment with you feels more meaningful and more beautiful.

I adore your smile, your kindness, and the way your presence makes my heart feel safe and full.

I promise to keep loving you gently, honestly, and deeply through every chapter we write together.

Forever yours.`;

const galleryImages = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  src: `/images/${i + 1}.png`,
  alt: `A cherished memory together`,
}));

const NAV_ITEMS: { id: Page; label: string; emoji: string }[] = [
  { id: "letter", label: "Love Letter", emoji: "💌" },
  { id: "gallery", label: "Our Memories", emoji: "📸" },
  { id: "bouquet", label: "Digital Bouquet", emoji: "💐" },
];

/* ── Floating Hearts Background ── */
function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const style: HeartStyle = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${14 + Math.random() * 18}s`,
          animationDelay: `${-Math.random() * 22}s`,
          opacity: `${0.15 + Math.random() * 0.5}`,
          "--size": `${8 + Math.random() * 18}px`,
          "--drift": `${-80 + Math.random() * 160}px`,
          "--hue": `${338 + Math.random() * 22}`,
        };
        return { id: i, style };
      }),
    []
  );

  return (
    <div className="heart-field" aria-hidden="true">
      {hearts.map((h) => (
        <span key={h.id} className="floating-heart" style={h.style} />
      ))}
    </div>
  );
}

/* ── Navigation ── */
function Navigation({ active, onChange }: { active: Page; onChange: (p: Page) => void }) {
  return (
    <nav className="nav-bar" aria-label="Page navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-tab${active === item.id ? " active" : ""}`}
          onClick={() => onChange(item.id)}
          aria-current={active === item.id ? "page" : undefined}
        >
          <span className="nav-emoji">{item.emoji}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── Letter Page ── */
function LetterPage() {
  return (
    <>
      <RevealSection className="hero-card">
        <p className="date-badge">✦ April 30, 2026 ✦</p>
        <h1>Happy 1st Monthsary!</h1>
        <p className="hero-subtitle">For Shelly S. Quijano — my forever baby girl and Love of my life</p>
        <p className="hero-description">
          This page is a little love story made for you: soft, gentle, and full of the moments
          that made our first month unforgettable.
        </p>
      </RevealSection>

      <RevealSection id="love-letter" className="letter-card" delay={120}>
        <header className="section-header">
          <h2>My Letter to You</h2>
          <p className="section-sub">Words written from the heart.</p>
        </header>
        <article className="letter-preview" aria-live="polite">
          {defaultLetter}
        </article>
      </RevealSection>
    </>
  );
}

/* ── Gallery Page ── */
function GalleryPage() {
  return (
    <RevealSection className="gallery-card">
      <header className="section-header">
        <h2>Our Memories</h2>
        <p className="section-sub">Every photo, a love story frozen in time.</p>
      </header>
      <div className="memory-grid" role="list" aria-label="Photo gallery">
        {galleryImages.map((img) => (
          <figure className="memory-tile" role="listitem" key={img.id}>
            <img src={img.src} alt={img.alt} loading={img.id <= 4 ? "eager" : "lazy"} />
          </figure>
        ))}
      </div>
    </RevealSection>
  );
}

/* ══════════════════════════════════════
   PHOTOREALISTIC BOUQUET — Canvas
   ══════════════════════════════════════ */

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t: number) { return t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
function prog(elapsed: number, start: number, dur: number) {
  return clamp01((elapsed - start) / dur);
}
function hsla(h: number, s: number, l: number, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

// ── Color Palettes (rich, realistic flower hues) ──
const ROSE_PALETTES = [
  { hue: 350, sat: 85, light: 38 },  // deep crimson red
  { hue: 342, sat: 78, light: 48 },  // classic rose pink
  { hue: 355, sat: 82, light: 42 },  // vivid red
  { hue: 14,  sat: 75, light: 58 },  // warm coral
  { hue: 338, sat: 62, light: 70 },  // soft blush pink
  { hue: 30,  sat: 45, light: 82 },  // cream / ivory
  { hue: 330, sat: 72, light: 52 },  // hot pink
  { hue: 0,   sat: 78, light: 46 },  // pure red
  { hue: 348, sat: 88, light: 35 },  // dark ruby
  { hue: 325, sat: 65, light: 60 },  // mauve pink
];

// Rose arrangement — dome shape, 20 roses
interface RoseConfig {
  dx: number; dy: number; size: number; delay: number;
  hue: number; sat: number; light: number;
  tilt: number; // rotation for variety
}

const ROSES: RoseConfig[] = (() => {
  const rows = [
    { y: -115, count: 2, spread: 28,  sz: 21, delayBase: 1100 },
    { y: -92,  count: 4, spread: 56,  sz: 24, delayBase: 1200 },
    { y: -68,  count: 5, spread: 80,  sz: 27, delayBase: 1350 },
    { y: -44,  count: 5, spread: 88,  sz: 28, delayBase: 1500 },
    { y: -22,  count: 4, spread: 72,  sz: 25, delayBase: 1650 },
  ];
  const out: RoseConfig[] = [];
  let idx = 0;
  for (const row of rows) {
    for (let i = 0; i < row.count; i++) {
      const t = row.count === 1 ? 0.5 : i / (row.count - 1);
      const pal = ROSE_PALETTES[idx % ROSE_PALETTES.length];
      out.push({
        dx: (t - 0.5) * row.spread * 2,
        dy: row.y,
        size: row.sz + (idx % 3) * 2.5,
        delay: row.delayBase + i * 70,
        hue: pal.hue, sat: pal.sat, light: pal.light,
        tilt: ((idx * 1337) % 100) / 100 * 0.35 - 0.175,
      });
      idx++;
    }
  }
  return out;
})();

// Leaves
interface LeafConfig { dx: number; dy: number; angle: number; len: number; width: number; delay: number; hue: number }
const LEAVES: LeafConfig[] = [];
for (let i = 0; i < 22; i++) {
  const a = (i / 22) * Math.PI * 2 + 0.2;
  const d = 65 + (i % 4) * 15;
  LEAVES.push({
    dx: Math.cos(a) * d + (i % 3 - 1) * 10,
    dy: Math.sin(a) * d * 0.5 - 50 + (i % 4 - 2) * 8,
    angle: a + Math.PI * 0.55 + ((i % 3) - 1) * 0.25,
    len: 22 + (i % 4) * 8,
    width: 9 + (i % 3) * 3,
    delay: 2200 + i * 28,
    hue: 115 + (i % 4) * 8,
  });
}

// Baby's breath
interface BabyBreath { dx: number; dy: number; r: number; delay: number }
const BABY_BREATHS: BabyBreath[] = [];
for (let i = 0; i < 55; i++) {
  const a = (i / 55) * Math.PI * 2 + i * 0.13;
  const d = 60 + (i % 6) * 16;
  BABY_BREATHS.push({
    dx: Math.cos(a) * d + (i % 5 - 2) * 10,
    dy: Math.sin(a) * d * 0.48 - 52 + (i % 5 - 2) * 8,
    r: 1.5 + (i % 3) * 0.7,
    delay: 2400 + i * 18,
  });
}

// Falling petals
interface Petal { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; hue: number; opacity: number }

// ── Draw one realistic rose petal ──
function drawPetalPath(
  ctx: CanvasRenderingContext2D,
  length: number, width: number,
  angle: number,
  hue: number, sat: number, baseLight: number,
  alpha: number,
  curlBack: number = 0,
  highlight: boolean = false
) {
  ctx.save();
  ctx.rotate(angle);

  const l = length;
  const w = width;

  // Petal outline — broad teardrop with slightly wavy top
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w * 0.52, -l * 0.16, -w * 0.9, -l * 0.52, -w * 0.48 + curlBack * w * 0.2, -l * (0.92 + curlBack * 0.12));
  // Wavy top edge
  ctx.bezierCurveTo(-w * 0.22 + curlBack * w * 0.08, -l * (1.08 + curlBack * 0.06),
                     w * 0.22 - curlBack * w * 0.08, -l * (1.08 + curlBack * 0.06),
                     w * 0.48 - curlBack * w * 0.2, -l * (0.92 + curlBack * 0.12));
  ctx.bezierCurveTo(w * 0.9, -l * 0.52, w * 0.52, -l * 0.16, 0, 0);
  ctx.closePath();

  // Rich gradient: dark at base, lighter in middle, near-white at tip
  const g = ctx.createLinearGradient(0, 0, 0, -l * 1.1);
  g.addColorStop(0,    hsla(hue, sat + 12, baseLight - 22, alpha));
  g.addColorStop(0.18, hsla(hue, sat + 8,  baseLight - 12, alpha));
  g.addColorStop(0.45, hsla(hue, sat + 2,  baseLight + 4,  alpha));
  g.addColorStop(0.72, hsla(hue, sat - 5,  baseLight + 14, alpha));
  g.addColorStop(1,    hsla(hue - 4, sat - 14, baseLight + 22, alpha * 0.9));
  ctx.fillStyle = g;
  ctx.fill();

  if (highlight) {
    // Subtle sheen highlight along left side
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-w * 0.15, -l * 0.25, -w * 0.12, -l * 0.62, -w * 0.04, -l * 0.88);
    ctx.bezierCurveTo(w * 0.04, -l * 0.65, w * 0.06, -l * 0.3, 0, 0);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// ── Draw a fully-detailed realistic rose ──
function drawRealisticRose(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bloom: number,
  hue: number, sat: number, light: number,
  tilt: number = 0
) {
  if (bloom <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Ambient soft glow behind rose
  if (bloom > 0.25) {
    const ga = (bloom - 0.25) * 0.22;
    const gr = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 2.4);
    gr.addColorStop(0, hsla(hue, sat - 5, light + 25, ga));
    gr.addColorStop(1, hsla(hue, sat - 5, light + 20, 0));
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Outer petals (7) — fully open, curl back at edges ===
  const ob = easeOutCubic(clamp01(bloom * 2.2));
  if (ob > 0) {
    // Shadow beneath this layer
    ctx.shadowBlur = size * 0.55;
    ctx.shadowColor = hsla(hue, sat + 5, light - 28, 0.32);
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + 0.18;
      const j = ((i * 2741) % 100) * 0.001 * 0.18 - 0.09; // jitter
      drawPetalPath(ctx, size * 0.92, size * 0.58, angle + j, hue - 2, sat - 3, light + 12, ob, 0.25, true);
    }
    ctx.shadowBlur = 0;
  }

  // === Middle petals (6) — half-open ===
  const mb = easeOutCubic(clamp01((bloom - 0.10) * 2.6));
  if (mb > 0) {
    ctx.shadowBlur = size * 0.4;
    ctx.shadowColor = hsla(hue, sat + 8, light - 24, 0.28);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.52;
      drawPetalPath(ctx, size * 0.65, size * 0.42, angle, hue, sat + 3, light + 4, mb, 0.08, true);
    }
    ctx.shadowBlur = 0;
  }

  // === Inner petals (5) — slightly open ===
  const ib = easeOutCubic(clamp01((bloom - 0.28) * 2.8));
  if (ib > 0) {
    ctx.shadowBlur = size * 0.3;
    ctx.shadowColor = hsla(hue, sat + 12, light - 26, 0.3);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 0.25;
      drawPetalPath(ctx, size * 0.44, size * 0.3, angle, hue, sat + 7, light - 3, ib, -0.05, false);
    }
    ctx.shadowBlur = 0;
  }

  // === Innermost cupped petals (4) — tightly curled ===
  const sp = easeOutCubic(clamp01((bloom - 0.48) * 3.2));
  if (sp > 0) {
    ctx.shadowBlur = size * 0.2;
    ctx.shadowColor = hsla(hue, sat + 15, light - 30, 0.35);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.7;
      drawPetalPath(ctx, size * 0.26, size * 0.18, angle, hue, sat + 12, light - 11, sp, -0.18, false);
    }
    ctx.shadowBlur = 0;
  }

  // === Tight spiral center bud (3 tiny petals) ===
  const tp = easeOutCubic(clamp01((bloom - 0.68) * 4));
  if (tp > 0) {
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 1.1;
      drawPetalPath(ctx, size * 0.14, size * 0.09, angle, hue, sat + 14, light - 18, tp * 0.9, -0.25, false);
    }
  }

  // === Center dot (stamens / pistil) ===
  const cb = easeOutCubic(clamp01((bloom - 0.82) * 6));
  if (cb > 0.01) {
    const r = size * 0.06 * cb;
    const cg = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 0, 0, 0, r * 1.1);
    cg.addColorStop(0, hsla(hue, sat + 18, light - 24, 1));
    cg.addColorStop(0.55, hsla(hue, sat + 14, light - 18, 1));
    cg.addColorStop(1, hsla(hue, sat + 8, light - 10, 1));
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.shadowBlur = 0;
    ctx.fill();
  }

  ctx.restore();
}

// ── Draw a realistic leaf ──
function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number, len: number, width: number,
  hue: number, bloom: number
) {
  if (bloom <= 0) return;
  const s = easeOutCubic(bloom);
  const l = len * s;
  const w = width * s;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Leaf shadow
  ctx.shadowBlur = 6;
  ctx.shadowColor = hsla(hue - 10, 60, 22, 0.25);

  // Leaf body
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w * 0.6, -l * 0.22, -w * 0.8, -l * 0.65, 0, -l);
  ctx.bezierCurveTo(w * 0.8, -l * 0.65, w * 0.6, -l * 0.22, 0, 0);
  ctx.closePath();

  const g = ctx.createLinearGradient(-w * 0.5, -l * 0.3, w * 0.5, -l * 0.7);
  g.addColorStop(0, hsla(hue, 55, 30, 0.92));
  g.addColorStop(0.35, hsla(hue + 5, 60, 38, 0.9));
  g.addColorStop(0.65, hsla(hue + 8, 58, 44, 0.88));
  g.addColorStop(1, hsla(hue + 3, 52, 36, 0.9));
  ctx.fillStyle = g;
  ctx.fill();

  ctx.shadowBlur = 0;

  // Midrib
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -l);
  ctx.strokeStyle = hsla(hue - 5, 48, 25, 0.3);
  ctx.lineWidth = w * 0.06;
  ctx.lineCap = "round";
  ctx.stroke();

  // Leaf sheen
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(0, -l * 0.1);
  ctx.bezierCurveTo(-w * 0.15, -l * 0.35, -w * 0.2, -l * 0.65, -w * 0.08, -l * 0.88);
  ctx.bezierCurveTo(-w * 0.02, -l * 0.6, w * 0.02, -l * 0.35, 0, -l * 0.1);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ── Draw a realistic stem ──
function drawStem(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  growP: number, thickness = 2
) {
  if (growP <= 0) return;
  const p = easeOutCubic(growP);
  ctx.save();
  const ex = x1 + (x2 - x1) * p;
  const ey = y1 + (y2 - y1) * p;
  const cpx = x1 + (x2 - x1) * 0.45 + (x2 - x1) * 0.08;
  const cpy = y1 + (y2 - y1) * 0.5 - 4;

  // Stem shadow
  ctx.shadowBlur = 3;
  ctx.shadowColor = "rgba(0,0,0,0.2)";

  // Stem gradient (dark green at base, lighter green toward flower)
  const sg = ctx.createLinearGradient(x1, y1, ex, ey);
  sg.addColorStop(0, "#2d5a1b");
  sg.addColorStop(0.5, "#3d7a28");
  sg.addColorStop(1, "#4a9030");

  ctx.strokeStyle = sg;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, ex, ey);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ── Draw realistic bouquet wrapping ──
function drawWrapping(
  ctx: CanvasRenderingContext2D,
  cx: number, topY: number, wrapW: number, wrapH: number, p: number
) {
  if (p <= 0) return;
  const sc = easeOutCubic(p);
  ctx.save();
  ctx.translate(cx, topY);
  ctx.scale(sc, sc);

  const topHalf = wrapW * 0.56;
  const botHalf = wrapW * 0.04;
  const ribbonY = wrapH * 0.21;
  const ribbonHalfW = topHalf - (topHalf - botHalf) * (ribbonY / wrapH) + 5;

  // ── Tissue paper peeking at top ──
  const tissueColors = [
    "rgba(255,255,255,0.65)",
    "rgba(255,240,248,0.5)",
    "rgba(255,220,235,0.45)",
  ];
  for (let layer = 0; layer < 3; layer++) {
    const tw = topHalf + 14 + layer * 7;
    const lo = layer * 4;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-tw, -lo);
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const wx = -tw + t * tw * 2;
      const wy = -lo - 14 - Math.sin(t * Math.PI * 3.5 + layer * 1.3) * 9 - Math.cos(t * Math.PI * 6 + layer * 0.8) * 4;
      ctx.lineTo(wx, wy);
    }
    ctx.lineTo(tw, -lo);
    ctx.lineTo(topHalf + 5, 8);
    ctx.lineTo(-topHalf - 5, 8);
    ctx.closePath();
    ctx.fillStyle = tissueColors[layer];
    ctx.fill();
    ctx.restore();
  }

  // ── Main cone wrapping paper ──
  ctx.beginPath();
  ctx.moveTo(-topHalf, 0);
  ctx.lineTo(topHalf, 0);
  ctx.quadraticCurveTo(topHalf * 0.38, wrapH * 0.62, botHalf, wrapH);
  ctx.lineTo(-botHalf, wrapH);
  ctx.quadraticCurveTo(-topHalf * 0.38, wrapH * 0.62, -topHalf, 0);
  ctx.closePath();

  // Rich gradient — warm ivory/pink paper
  const wg = ctx.createLinearGradient(-topHalf, 0, topHalf, 0);
  wg.addColorStop(0,    "#c9a8b4");
  wg.addColorStop(0.15, "#dfc0c9");
  wg.addColorStop(0.38, "#efd4db");
  wg.addColorStop(0.5,  "#f5dde3");
  wg.addColorStop(0.62, "#efd4db");
  wg.addColorStop(0.85, "#dfc0c9");
  wg.addColorStop(1,    "#c9a8b4");
  ctx.fillStyle = wg;
  ctx.fill();

  // Vertical depth gradient
  const vg = ctx.createLinearGradient(0, 0, 0, wrapH);
  vg.addColorStop(0,   "rgba(255,255,255,0.18)");
  vg.addColorStop(0.35,"rgba(255,255,255,0.05)");
  vg.addColorStop(0.7, "rgba(0,0,0,0.04)");
  vg.addColorStop(1,   "rgba(0,0,0,0.12)");
  ctx.fillStyle = vg;
  ctx.fill();

  // Paper edge stroke
  ctx.strokeStyle = "rgba(140,70,95,0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Clip and draw texture inside ──
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-topHalf, 0);
  ctx.lineTo(topHalf, 0);
  ctx.quadraticCurveTo(topHalf * 0.38, wrapH * 0.62, botHalf, wrapH);
  ctx.lineTo(-botHalf, wrapH);
  ctx.quadraticCurveTo(-topHalf * 0.38, wrapH * 0.62, -topHalf, 0);
  ctx.closePath();
  ctx.clip();

  // Subtle dot pattern
  ctx.fillStyle = "rgba(180,130,145,0.1)";
  for (let row = 0; row < 13; row++) {
    const frac = row / 13;
    const curHalf = topHalf - (topHalf - botHalf) * frac;
    const dotY = 10 + row * (wrapH / 13);
    const cols = Math.floor(curHalf * 2 / 14);
    for (let col = 0; col < cols; col++) {
      const dotX = -curHalf + 7 + col * 14 + (row % 2 === 0 ? 0 : 7);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Radiating crease lines for realism
  ctx.strokeStyle = "rgba(160,95,115,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const angle = -0.7 + (i / 8) * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, wrapH);
    ctx.lineTo(Math.sin(angle) * wrapH * 1.3, -wrapH * 0.08);
    ctx.stroke();
  }
  ctx.restore();

  // ── Left flap fold shadow ──
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(-topHalf, 0);
  ctx.lineTo(-topHalf + 22, 0);
  ctx.quadraticCurveTo(-topHalf * 0.32 + 16, wrapH * 0.62, botHalf + 5, wrapH);
  ctx.lineTo(-botHalf, wrapH);
  ctx.quadraticCurveTo(-topHalf * 0.38, wrapH * 0.62, -topHalf, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fill();
  ctx.restore();

  // ── Right flap fold highlight ──
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.beginPath();
  ctx.moveTo(topHalf, 0);
  ctx.lineTo(topHalf - 22, 0);
  ctx.quadraticCurveTo(topHalf * 0.32 - 16, wrapH * 0.62, -botHalf - 5, wrapH);
  ctx.lineTo(botHalf, wrapH);
  ctx.quadraticCurveTo(topHalf * 0.38, wrapH * 0.62, topHalf, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fill();
  ctx.restore();

  // ── Ribbon ──
  const rP = clamp01((p - 0.3) * 2.2);
  if (rP > 0) {
    ctx.globalAlpha = rP;

    const bandW = ribbonHalfW + 5;
    const bandT = 10;

    // Satin ribbon gradient
    const rg = ctx.createLinearGradient(0, ribbonY - bandT, 0, ribbonY + bandT);
    rg.addColorStop(0,    "#b02850");
    rg.addColorStop(0.18, "#d64070");
    rg.addColorStop(0.42, "#e86080");
    rg.addColorStop(0.5,  "#f07090");
    rg.addColorStop(0.58, "#e86080");
    rg.addColorStop(0.82, "#d04068");
    rg.addColorStop(1,    "#a02248");
    ctx.fillStyle = rg;

    ctx.beginPath();
    ctx.moveTo(-bandW, ribbonY - bandT);
    ctx.quadraticCurveTo(0, ribbonY - bandT - 3, bandW, ribbonY - bandT);
    ctx.lineTo(bandW, ribbonY + bandT);
    ctx.quadraticCurveTo(0, ribbonY + bandT + 3, -bandW, ribbonY + bandT);
    ctx.closePath();
    ctx.fill();

    // Ribbon highlight
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(-bandW, ribbonY - bandT);
    ctx.quadraticCurveTo(0, ribbonY - bandT - 3, bandW, ribbonY - bandT);
    ctx.lineTo(bandW, ribbonY - 2);
    ctx.quadraticCurveTo(0, ribbonY - 4, -bandW, ribbonY - 2);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    // ── Bow ──
    const bowCY = ribbonY - bandT - 1;

    // Bow shadow
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.ellipse(2, bowCY + 5, 30, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();

    // Left bow loop
    ctx.beginPath();
    ctx.moveTo(0, bowCY);
    ctx.bezierCurveTo(-14, bowCY - 20, -38, bowCY - 16, -30, bowCY + 3);
    ctx.bezierCurveTo(-24, bowCY + 12, -7, bowCY + 5, 0, bowCY);
    ctx.closePath();
    const blg = ctx.createRadialGradient(-18, bowCY - 7, 2, -18, bowCY - 4, 22);
    blg.addColorStop(0, "#f08098");
    blg.addColorStop(0.5, "#e06080");
    blg.addColorStop(1, "#b83060");
    ctx.fillStyle = blg;
    ctx.fill();

    // Right bow loop
    ctx.beginPath();
    ctx.moveTo(0, bowCY);
    ctx.bezierCurveTo(14, bowCY - 20, 38, bowCY - 16, 30, bowCY + 3);
    ctx.bezierCurveTo(24, bowCY + 12, 7, bowCY + 5, 0, bowCY);
    ctx.closePath();
    const brg = ctx.createRadialGradient(18, bowCY - 7, 2, 18, bowCY - 4, 22);
    brg.addColorStop(0, "#f08098");
    brg.addColorStop(0.5, "#e06080");
    brg.addColorStop(1, "#b83060");
    ctx.fillStyle = brg;
    ctx.fill();

    // Bow loop sheen
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.ellipse(-20, bowCY - 9, 9, 4.5, -0.32, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(20, bowCY - 9, 9, 4.5, 0.32, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    // Center knot
    ctx.beginPath();
    ctx.ellipse(0, bowCY, 7, 6, 0, 0, Math.PI * 2);
    const bcg = ctx.createRadialGradient(-1, bowCY - 1, 0, 0, bowCY, 7);
    bcg.addColorStop(0, "#e86080");
    bcg.addColorStop(1, "#a82848");
    ctx.fillStyle = bcg;
    ctx.fill();

    // Ribbon tails
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#cc3860";
    // Left tail
    ctx.beginPath();
    ctx.moveTo(-5, bowCY + 5);
    ctx.bezierCurveTo(-14, bowCY + 24, -20, bowCY + 38, -10, bowCY + 52);
    ctx.stroke();
    // Left tail V-cut
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-13, bowCY + 48);
    ctx.lineTo(-10, bowCY + 52);
    ctx.lineTo(-7, bowCY + 48);
    ctx.stroke();
    // Right tail
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, bowCY + 5);
    ctx.bezierCurveTo(14, bowCY + 24, 20, bowCY + 38, 10, bowCY + 52);
    ctx.stroke();
    // Right tail V-cut
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(7, bowCY + 48);
    ctx.lineTo(10, bowCY + 52);
    ctx.lineTo(13, bowCY + 48);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ── Date tag card ──
function drawCard(ctx: CanvasRenderingContext2D, cx: number, cardY: number, p: number) {
  if (p <= 0) return;
  const sc = easeOutCubic(p);
  ctx.save();
  ctx.translate(cx + 44, cardY);
  ctx.rotate(-0.07);
  ctx.scale(sc, sc);

  // String
  ctx.strokeStyle = "#c4a870";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-40, -22);
  ctx.quadraticCurveTo(-20, -12, 0, 0);
  ctx.stroke();

  // Card shadow
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(3, 3, 78, 44);
  // Card body
  ctx.fillStyle = "#fffef5";
  ctx.fillRect(0, 0, 78, 44);
  ctx.strokeStyle = "#d4bc82";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, 78, 44);
  ctx.strokeStyle = "rgba(212,188,130,0.35)";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(3.5, 3.5, 71, 37);

  // Text
  ctx.fillStyle = "#7a4c3b";
  ctx.font = "bold 10px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("April 30, 2026", 39, 22);
  ctx.restore();
}

interface Sparkle { x: number; y: number; r: number; speed: number; phase: number }

/* ── BouquetPage ── */
function BouquetPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const sparklesRef = useRef<Sparkle[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const startRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    sparklesRef.current = Array.from({ length: 45 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 1.8,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));
    petalsRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.65,
      r: 3.5 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.018,
      hue: [350, 342, 355, 14, 338][Math.floor(Math.random() * 5)],
      opacity: 0.22 + Math.random() * 0.3,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    startRef.current = performance.now();
    let raf = 0;
    let msgShown = false;

    const animate = (now: number) => {
      const el = now - startRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const bouquetCy = h * 0.30;
      const wrapTopY  = bouquetCy + 18;
      const wrapH     = h * 0.54;
      const wrapW     = w * 0.50;

      // Background radial glow
      const bgP = prog(el, 0, 900);
      if (bgP > 0) {
        ctx.globalAlpha = bgP * 0.28;
        const bg = ctx.createRadialGradient(cx, bouquetCy - 10, 0, cx, bouquetCy, w * 0.7);
        bg.addColorStop(0, "rgba(255,200,220,1)");
        bg.addColorStop(0.55, "rgba(255,225,235,0.4)");
        bg.addColorStop(1, "rgba(255,235,242,0)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      // Falling petals
      if (el > 3200) {
        for (const p of petalsRef.current) {
          p.x += p.vx + Math.sin(now * 0.0009 + p.rot) * 0.22;
          p.y += p.vy;
          p.rot += p.vr;
          if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 0.7, p.r * 1.3, 0, 0, Math.PI * 2);
          ctx.fillStyle = hsla(p.hue, 68, 72, 1);
          ctx.fill();
          ctx.restore();
        }
      }

      // Wrapping paper (draw before flowers so it appears behind)
      drawWrapping(ctx, cx, wrapTopY, wrapW, wrapH, prog(el, 250, 680));

      // Leaves
      for (const lf of LEAVES) {
        drawLeaf(ctx, cx + lf.dx, bouquetCy + lf.dy, lf.angle, lf.len, lf.width, lf.hue, prog(el, lf.delay, 420));
      }

      // Stems
      for (const rose of ROSES) {
        const stemStart = rose.delay - 450;
        const convergePt = { x: cx + rose.dx * 0.04, y: wrapTopY + wrapH * 0.24 };
        drawStem(
          ctx,
          convergePt.x, convergePt.y,
          cx + rose.dx, bouquetCy + rose.dy,
          prog(el, stemStart, 380),
          1.8
        );
      }

      // Baby's breath
      for (const bb of BABY_BREATHS) {
        const bp = prog(el, bb.delay, 320);
        if (bp <= 0) continue;
        const s = easeOutCubic(bp);
        ctx.globalAlpha = s * 0.72;
        ctx.beginPath();
        ctx.arc(cx + bb.dx, bouquetCy + bb.dy, bb.r * s, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
        ctx.globalAlpha = s * 0.12;
        ctx.beginPath();
        ctx.arc(cx + bb.dx, bouquetCy + bb.dy, bb.r * s * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Roses — draw back-to-front (by dy ascending)
      const sortedRoses = [...ROSES].sort((a, b) => a.dy - b.dy);
      for (const rose of sortedRoses) {
        const bloomP = prog(el, rose.delay, 900);
        drawRealisticRose(
          ctx,
          cx + rose.dx, bouquetCy + rose.dy,
          rose.size, bloomP,
          rose.hue, rose.sat, rose.light,
          rose.tilt
        );
      }

      // Date card
      drawCard(ctx, cx, wrapTopY + wrapH * 0.17, prog(el, 2100, 650));

      // Sparkles
      if (el > 3200) {
        const t = now * 0.001;
        for (const sp of sparklesRef.current) {
          const twinkle = Math.sin(t * sp.speed * 3.2 + sp.phase);
          if (twinkle < 0.25) continue;
          const alpha = (twinkle - 0.25) * 0.75;
          ctx.globalAlpha = alpha;
          const sr = sp.r * (0.7 + twinkle * 0.5);
          ctx.save();
          ctx.translate(sp.x, sp.y);
          ctx.fillStyle = "#fffde0";
          ctx.beginPath();
          ctx.moveTo(0, -sr * 2.2);
          ctx.lineTo(sr * 0.22, -sr * 0.22);
          ctx.lineTo(sr * 2.2, 0);
          ctx.lineTo(sr * 0.22, sr * 0.22);
          ctx.lineTo(0, sr * 2.2);
          ctx.lineTo(-sr * 0.22, sr * 0.22);
          ctx.lineTo(-sr * 2.2, 0);
          ctx.lineTo(-sr * 0.22, -sr * 0.22);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }

      if (el > 4000 && !msgShown) {
        msgShown = true;
        setShowMessage(true);
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [initParticles]);

  return (
    <div className="bouquet-scene">
      <canvas ref={canvasRef} className="bouquet-canvas" />
      <div className={`bouquet-message${showMessage ? " visible" : ""}`}>
        <span className="bq-heart">🌹</span>
        <h2>A digital bouquet for you, my Love</h2>
        <p>30 roses for 30 days of loving you.</p>
      </div>
    </div>
  );
}

/* ── Main App ── */
function App() {
  const [activePage, setActivePage] = useState<Page>("letter");

  return (
    <>
      <div className="background-layer" aria-hidden="true">
        <div className="mesh-glow mesh-1" />
        <div className="mesh-glow mesh-2" />
        <div className="mesh-glow mesh-3" />
      </div>

      <FloatingHearts />

      <Navigation active={activePage} onChange={setActivePage} />

      <main className="page-shell" key={activePage}>
        {activePage === "letter" && <LetterPage />}
        {activePage === "gallery" && <GalleryPage />}
        {activePage === "bouquet" && <BouquetPage />}
      </main>

      <footer className="page-footer">
        Built with love for Shelly S. Quijano — Happy 1st Monthsary, Love. 💕
      </footer>
    </>
  );
}

export default App;