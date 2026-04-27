import { useState, useEffect, useRef, useCallback } from "react";

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

// ─────────────────────────────────────────────────────────────
// FILLER FLOWER ARRAYS
// ─────────────────────────────────────────────────────────────

interface FillerFlower {
  dx: number; dy: number; size: number;
  hue: number; sat: number; light: number;
  delay: number; rot: number;
}

/** Wax flowers — small star-shaped 5-petal blooms (pink / white / mauve) */
const WAX_FLOWERS: FillerFlower[] = (() => {
  const out: FillerFlower[] = [];
  // Hug the outer ring of roses and fill inter-rose gaps
  const seeds: [number, number, number][] = [
    // [dx, dy, sizeMult]
    [-105, -105, 0.9], [ -68, -118, 1.0], [  12, -128, 0.95],
    [  72, -114, 1.0], [ 112, -98,  0.9], [ 130,  -58, 0.85],
    [ 118,  -18, 0.9], [  98,   15, 0.85],[ -98,   10, 0.85],
    [-120,  -32, 0.9], [-130,  -72, 0.85],[ -82,  -52, 0.78],
    [  88,  -60, 0.8], [  42,  -50, 0.75],[ -45,  -48, 0.75],
    [  -5,  -40, 0.72],[  58,  -90, 0.82],[ -60,  -88, 0.82],
    [  24,  -88, 0.78],[ -28,  -95, 0.78],[ 100, -140, 0.88],
    [ -95, -140, 0.88],[  38, -145, 0.9], [ -40, -145, 0.9],
  ];
  const palettes = [
    { hue: 300, sat: 35, light: 78 }, // mauve
    { hue:  10, sat: 20, light: 92 }, // near-white blush
    { hue: 280, sat: 38, light: 74 }, // soft lavender
    { hue: 340, sat: 42, light: 80 }, // pale pink
    { hue:  45, sat: 18, light: 90 }, // cream
  ];
  seeds.forEach(([dx, dy, sm], i) => {
    const pal = palettes[i % palettes.length];
    out.push({
      dx, dy,
      size: (9 + (i % 3) * 2.5) * sm,
      hue: pal.hue, sat: pal.sat, light: pal.light,
      delay: 1900 + i * 55,
      rot: (i * 1.618) % (Math.PI * 2),
    });
  });
  return out;
})();

/** Mini daisies — white petals + yellow dome, like feverfew / chamomile */
const MINI_DAISIES: FillerFlower[] = (() => {
  const out: FillerFlower[] = [];
  const seeds: [number, number][] = [
    [-92, -80], [90, -78], [-50, -130], [52, -132],
    [0,  -160], [125, -115], [-122, -110], [75,  30],
    [-76, 25], [140, -40], [-138, -45],  [30, -170],
    [-30,-168], [108, -168], [-106,-165],
  ];
  seeds.forEach(([dx, dy], i) => {
    out.push({
      dx, dy,
      size: 7 + (i % 3) * 2,
      hue: 50, sat: 90, light: 58,   // center color (yellow)
      delay: 2050 + i * 45,
      rot: (i * 0.9) % (Math.PI * 2),
    });
  });
  return out;
})();

/** Statice / limonium — tiny papery clustered blooms in purple & lilac */
const STATICE_CLUSTERS: FillerFlower[] = (() => {
  const out: FillerFlower[] = [];
  const seeds: [number, number, number, number, number][] = [
    // [dx, dy, size, hue, light]
    [-115, -130, 10, 265, 68],
    [  85, -148, 9,  272, 70],
    [-140,  -90, 10, 258, 64],
    [ 140,  -95, 9,  280, 72],
    [ -30, -175, 8,  268, 70],
    [  32, -178, 8,  262, 66],
    [ -68,  -62, 7,  275, 74],
    [  70,  -58, 7,  270, 72],
    [ 115,   10, 8,  260, 66],
    [-112,    5, 8,  278, 72],
    [   4, -108, 7,  266, 70],
    [  55,  -18, 6,  272, 68],
    [ -58,  -18, 6,  268, 68],
  ];
  seeds.forEach(([dx, dy, size, hue, light], i) => {
    out.push({
      dx, dy, size,
      hue, sat: 48, light,
      delay: 2100 + i * 40,
      rot: (i * 1.23) % (Math.PI * 2),
    });
  });
  return out;
})();

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
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + 0.18;
      const j = ((i * 2741) % 100) * 0.001 * 0.18 - 0.09; // jitter
      drawPetalPath(ctx, size * 0.92, size * 0.58, angle + j, hue - 2, sat - 3, light + 12, ob, 0.25, true);
    }
  }

  // === Middle petals (6) — half-open ===
  const mb = easeOutCubic(clamp01((bloom - 0.10) * 2.6));
  if (mb > 0) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.52;
      drawPetalPath(ctx, size * 0.65, size * 0.42, angle, hue, sat + 3, light + 4, mb, 0.08, true);
    }
  }

  // === Inner petals (5) — slightly open ===
  const ib = easeOutCubic(clamp01((bloom - 0.28) * 2.8));
  if (ib > 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 0.25;
      drawPetalPath(ctx, size * 0.44, size * 0.3, angle, hue, sat + 7, light - 3, ib, -0.05, false);
    }
  }

  // === Innermost cupped petals (4) — tightly curled ===
  const sp = easeOutCubic(clamp01((bloom - 0.48) * 3.2));
  if (sp > 0) {
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.7;
      drawPetalPath(ctx, size * 0.26, size * 0.18, angle, hue, sat + 12, light - 11, sp, -0.18, false);
    }
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

  // Leaf depth (shadow removed for performance)

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

  // Stem (shadow removed for performance)

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

  const topHalf = wrapW * 0.58;
  const botHalf = wrapW * 0.38;
  const ribbonY = wrapH * 0.22;

  // The wrapper shape: wide at top, gently tapering with subtle curves
  const drawWrapPath = () => {
    ctx.beginPath();
    ctx.moveTo(-topHalf, 0);
    ctx.lineTo(topHalf, 0);
    // Right side — mostly straight with very subtle inward curve
    ctx.lineTo(botHalf, wrapH);
    // Bottom — pointed/narrow base
    ctx.lineTo(-botHalf, wrapH);
    // Left side — mirror
    ctx.lineTo(-topHalf, 0);
    ctx.closePath();
  };

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

  // ── Main wrapping paper ──
  drawWrapPath();

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
  drawWrapPath();
  ctx.clip();

  // Grid / checkered pattern like reference image
  ctx.strokeStyle = "rgba(180,130,145,0.10)";
  ctx.lineWidth = 0.7;
  const gridSpacing = 12;
  for (let gy = 0; gy < wrapH; gy += gridSpacing) {
    const frac = gy / wrapH;
    const halfAtY = topHalf - (topHalf - botHalf) * frac;
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(-halfAtY, gy);
    ctx.lineTo(halfAtY, gy);
    ctx.stroke();
  }
  // Vertical lines that follow the taper
  for (let col = -20; col <= 20; col++) {
    const t = col / 20;
    ctx.beginPath();
    ctx.moveTo(t * topHalf, 0);
    ctx.lineTo(t * botHalf, wrapH);
    ctx.stroke();
  }

  // Subtle dot pattern at intersections
  ctx.fillStyle = "rgba(180,130,145,0.08)";
  for (let row = 0; row < Math.floor(wrapH / gridSpacing); row++) {
    const frac = row / Math.floor(wrapH / gridSpacing);
    const curHalf = topHalf - (topHalf - botHalf) * frac;
    const dotY = row * gridSpacing;
    const cols = Math.floor(curHalf * 2 / gridSpacing);
    for (let col = 0; col < cols; col++) {
      const dotX = -curHalf + gridSpacing / 2 + col * gridSpacing;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Radiating crease lines from center-bottom for realism
  ctx.strokeStyle = "rgba(160,95,115,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const angle = -0.55 + (i / 8) * 1.1;
    ctx.beginPath();
    ctx.moveTo(0, wrapH * 0.92);
    ctx.lineTo(Math.sin(angle) * wrapH * 1.1, -wrapH * 0.05);
    ctx.stroke();
  }
  ctx.restore();

  // ── Center fold V-line shadow ──
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.beginPath();
  ctx.moveTo(-3, wrapH * 0.25);
  ctx.lineTo(0, wrapH);
  ctx.lineTo(3, wrapH * 0.25);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fill();
  ctx.restore();

  // ── Left flap fold shadow ──
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.beginPath();
  ctx.moveTo(-topHalf, 0);
  ctx.lineTo(-topHalf + 20, 0);
  ctx.lineTo(-botHalf + 4, wrapH);
  ctx.lineTo(-botHalf, wrapH);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fill();
  ctx.restore();

  // ── Right flap fold highlight ──
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.beginPath();
  ctx.moveTo(topHalf, 0);
  ctx.lineTo(topHalf - 20, 0);
  ctx.lineTo(botHalf - 4, wrapH);
  ctx.lineTo(botHalf, wrapH);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fill();
  ctx.restore();

  // ── Ribbon ──
  const ribbonHalfW = topHalf - (topHalf - botHalf) * (ribbonY / wrapH) + 5;
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

// ─────────────────────────────────────────────────────────────
// FILLER FLOWER DRAW FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Wax flower — 5 rounded petals, golden stamens center.
 * Mimics Chamelaucium or small spray stock flowers.
 */
function drawWaxFlower(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  hue: number, sat: number, light: number,
  bloom: number, rot: number
) {
  if (bloom <= 0) return;
  const s = easeOutCubic(bloom);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = s;

  // Wax flower (shadow removed for performance)

  // 5 petals
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);

    // Petal shape: oval shifted outward from center
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.52, size * 0.30 * s, size * 0.38 * s, 0, 0, Math.PI * 2);

    const pg = ctx.createRadialGradient(0, -size * 0.48, 0, 0, -size * 0.52, size * 0.4);
    pg.addColorStop(0,   hsla(hue, sat - 6,  light + 16, 1));
    pg.addColorStop(0.5, hsla(hue, sat,       light + 6,  1));
    pg.addColorStop(1,   hsla(hue, sat + 8,  light - 10, 1));
    ctx.fillStyle = pg;
    ctx.fill();

    // Petal vein highlight
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.ellipse(-size * 0.06, -size * 0.52, size * 0.06, size * 0.24, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }


  // Stamens ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const sr = size * 0.22 * s;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * sr * 0.6, Math.sin(a) * sr * 0.6, size * 0.045 * s, 0, Math.PI * 2);
    ctx.fillStyle = "#d4a820";
    ctx.fill();
  }

  // Center disk
  const cg = ctx.createRadialGradient(-size * 0.06 * s, -size * 0.06 * s, 0, 0, 0, size * 0.22 * s);
  cg.addColorStop(0, "#fffacc");
  cg.addColorStop(0.55, "#e8c840");
  cg.addColorStop(1, "#b8920c");
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2 * s, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Mini daisy — 10 narrow white petals + raised yellow dome.
 * Mimics feverfew, chamomile, or button mums.
 */
function drawMiniDaisy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  bloom: number, rot: number
) {
  if (bloom <= 0) return;
  const s = easeOutCubic(bloom);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = s;

  // Daisy (shadow removed for performance)

  const pCount = 10;
  for (let i = 0; i < pCount; i++) {
    const a = (i / pCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);

    ctx.beginPath();
    ctx.moveTo(-size * 0.13, -size * 0.2);
    ctx.bezierCurveTo(-size * 0.16, -size * 0.52, -size * 0.11, -size * 0.85, 0, -size * 0.96);
    ctx.bezierCurveTo(size * 0.11, -size * 0.85, size * 0.16, -size * 0.52, size * 0.13, -size * 0.2);
    ctx.closePath();

    const pg = ctx.createLinearGradient(0, -size * 0.2, 0, -size * 0.96);
    pg.addColorStop(0, "rgba(240,240,230,0.85)");
    pg.addColorStop(0.4, "rgba(255,255,250,0.92)");
    pg.addColorStop(1, "rgba(255,255,255,0.88)");
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.restore();
  }

  // shadows removed for performance

  // Yellow dome center with texture dots
  const domR = size * 0.32 * s;
  const dg = ctx.createRadialGradient(-domR * 0.25, -domR * 0.3, 0, 0, 0, domR);
  dg.addColorStop(0, "#fff8a0");
  dg.addColorStop(0.35, "#f5d020");
  dg.addColorStop(0.72, "#d49010");
  dg.addColorStop(1, "#a86000");
  ctx.beginPath();
  ctx.arc(0, 0, domR, 0, Math.PI * 2);
  ctx.fillStyle = dg;
  ctx.fill();

  // Tiny bumps on dome
  ctx.fillStyle = "rgba(80,40,0,0.18)";
  for (let i = 0; i < 6; i++) {
    const ba = (i / 6) * Math.PI * 2 + 0.3;
    ctx.beginPath();
    ctx.arc(Math.cos(ba) * domR * 0.55, Math.sin(ba) * domR * 0.55, domR * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Statice / limonium cluster — tiny 4-petal papery florets
 * packed into a small cloud. Purple, lavender, or creamy white.
 */
function drawStaticeCluster(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  hue: number, sat: number, light: number,
  bloom: number, rot: number
) {
  if (bloom <= 0) return;
  const s = easeOutCubic(bloom);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = s;

  // Draw 9 tiny florets in a cloud arrangement
  const offsets: [number, number, number][] = [
    [0, 0, 1.0],
    [-size * 0.55,  size * 0.22, 0.85],
    [ size * 0.55,  size * 0.18, 0.82],
    [-size * 0.25, -size * 0.52, 0.88],
    [ size * 0.28, -size * 0.50, 0.85],
    [-size * 0.70, -size * 0.15, 0.75],
    [ size * 0.68, -size * 0.18, 0.75],
    [-size * 0.38,  size * 0.62, 0.72],
    [ size * 0.40,  size * 0.60, 0.72],
  ];

  for (const [ox, oy, sc] of offsets) {
    const fr = size * 0.36 * sc;
    ctx.save();
    ctx.translate(ox, oy);

    // 4-petal floret (tiny cross-like)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * fr * 0.55, Math.sin(a) * fr * 0.55, fr * 0.42, fr * 0.30, a, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(Math.cos(a)*fr*0.4, Math.sin(a)*fr*0.4, 0, Math.cos(a)*fr*0.55, Math.sin(a)*fr*0.55, fr*0.5);
      pg.addColorStop(0, hsla(hue, sat - 8, light + 14, 0.95));
      pg.addColorStop(1, hsla(hue, sat + 6, light - 8,  0.9));
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // Tiny yellow-white center
    ctx.beginPath();
    ctx.arc(0, 0, fr * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = hsla(50, 60, 88, 0.95);
    ctx.fill();

    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

interface Sparkle { x: number; y: number; r: number; speed: number; phase: number }

/* ── BouquetPage ── */
export function BouquetTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const sparklesRef = useRef<Sparkle[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const startRef = useRef(0);
  const cachedBouquetRef = useRef<HTMLCanvasElement | null>(null);

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
      cachedBouquetRef.current = null;
    };
    resize();
    window.addEventListener("resize", resize);

    startRef.current = performance.now();
    let raf = 0;

    
    const drawBouquetElements = (context: CanvasRenderingContext2D, w: number, h: number, cx: number, bouquetCy: number, wrapTopY: number, wrapW: number, wrapH: number, elapsed: number) => {
      // Stems for Roses (drawn behind wrapping paper)
      for (const rose of ROSES) {
        const stemStart = rose.delay - 450;
        const convergePt = { x: cx + rose.dx * 0.04, y: wrapTopY + wrapH * 0.24 };
        drawStem(
          context,
          convergePt.x, convergePt.y,
          cx + rose.dx, bouquetCy + rose.dy,
          prog(elapsed, stemStart, 380),
          1.8
        );
      }

      // Stems for Filler Flowers (drawn behind wrapping paper)
      const drawFillerStem = (f: any) => {
        const stemStart = f.delay - 450;
        const convergePt = { x: cx + f.dx * 0.05, y: wrapTopY + wrapH * 0.22 };
        drawStem(
          context,
          convergePt.x, convergePt.y,
          cx + f.dx, bouquetCy + f.dy + 6,
          prog(elapsed, stemStart, 380),
          1.2
        );
      };

      for (const wf of WAX_FLOWERS) drawFillerStem(wf);
      for (const md of MINI_DAISIES) drawFillerStem(md);
      for (const sc of STATICE_CLUSTERS) drawFillerStem(sc);

      // Wrapping paper (draw after stems so they appear tucked inside)
      drawWrapping(context, cx, wrapTopY, wrapW, wrapH, prog(elapsed, 250, 680));

      // Leaves
      for (const lf of LEAVES) {
        drawLeaf(context, cx + lf.dx, bouquetCy + lf.dy, lf.angle, lf.len, lf.width, lf.hue, prog(elapsed, lf.delay, 420));
      }

      // Baby's breath
      for (const bb of BABY_BREATHS) {
        const bp = prog(elapsed, bb.delay, 320);
        if (bp <= 0) continue;
        const s = easeOutCubic(bp);
        context.globalAlpha = s * 0.72;
        context.beginPath();
        context.arc(cx + bb.dx, bouquetCy + bb.dy, bb.r * s, 0, Math.PI * 2);
        context.fillStyle = "rgba(255,255,255,0.9)";
        context.fill();
        context.globalAlpha = s * 0.12;
        context.beginPath();
        context.arc(cx + bb.dx, bouquetCy + bb.dy, bb.r * s * 2.4, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }

      // ── Wax flowers ──
      for (const wf of WAX_FLOWERS) {
        drawWaxFlower(
          context, cx + wf.dx, bouquetCy + wf.dy,
          wf.size, wf.hue, wf.sat, wf.light,
          prog(elapsed, wf.delay, 550), wf.rot
        );
      }

      // ── Mini daisies ──
      for (const md of MINI_DAISIES) {
        drawMiniDaisy(
          context, cx + md.dx, bouquetCy + md.dy,
          md.size,
          prog(elapsed, md.delay, 500), md.rot
        );
      }

      // ── Statice clusters ──
      for (const sc of STATICE_CLUSTERS) {
        drawStaticeCluster(
          context, cx + sc.dx, bouquetCy + sc.dy,
          sc.size, sc.hue, sc.sat, sc.light,
          prog(elapsed, sc.delay, 480), sc.rot
        );
      }

      // Roses — draw back-to-front (by dy ascending)
      const sortedRoses = [...ROSES].sort((a, b) => a.dy - b.dy);
      for (const rose of sortedRoses) {
        const bloomP = prog(elapsed, rose.delay, 900);
        drawRealisticRose(
          context,
          cx + rose.dx, bouquetCy + rose.dy,
          rose.size, bloomP,
          rose.hue, rose.sat, rose.light,
          rose.tilt
        );
      }

      // Date card
      drawCard(context, cx, wrapTopY + wrapH * 0.17, prog(elapsed, 2100, 650));
    };

    const animate = (now: number) => {
      const el = (now - startRef.current); 
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const bouquetCy = h * 0.44; // Lowered to prevent cropping flowers at the top
      const wrapTopY  = bouquetCy + 18;
      const wrapH     = h * 0.46; // Adjusted so the bottom reaches closer to the text/rose
      const wrapW     = w * 0.45;

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

      if (el > 3000) {
        if (!cachedBouquetRef.current) {
          const offscreen = document.createElement("canvas");
          offscreen.width = canvas.width;
          offscreen.height = canvas.height;
          const oCtx = offscreen.getContext("2d");
          if (oCtx) {
            oCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawBouquetElements(oCtx, w, h, cx, bouquetCy, wrapTopY, wrapW, wrapH, 3000);
          }
          cachedBouquetRef.current = offscreen;
        }
        ctx.save();
        ctx.drawImage(cachedBouquetRef.current, 0, 0, w, h);
        ctx.restore();
      } else {
        drawBouquetElements(ctx, w, h, cx, bouquetCy, wrapTopY, wrapW, wrapH, el);
      }

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

      raf = requestAnimationFrame(animate);
    };

    // Trigger entrance animations shortly after mount for smooth transition
    const enterTimer = setTimeout(() => {
      setShowMessage(true);
      setShowCanvas(true);
    }, 50);

    raf = requestAnimationFrame(animate);
    return () => {
      clearTimeout(enterTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [initParticles]);

  return (
    <div className="bouquet-scene">
      <canvas ref={canvasRef} className={`bouquet-canvas${showCanvas ? " visible" : ""}`} />
      <div className={`bouquet-message${showMessage ? " visible" : ""}`}>
        <span className="bq-heart">🌹</span>
        <h2>A digital bouquet for you, my Love</h2>
        <p>30 roses for 30 days of officially being together.</p>
      </div>
    </div>
  );
}

