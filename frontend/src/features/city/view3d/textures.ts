import * as THREE from 'three';

/*
 * Canvas-generated textures (handoff §Assets: no external images). Effectful: they create DOM canvases.
 * Values are the demo's (:760, :771, :782).
 */

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) throw new Error('2D canvas context unavailable');
  return [c, g];
}

/** Mono uppercase label lying flat on a district plate. */
export function labelTexture(text: string): THREE.CanvasTexture {
  const [c, g] = canvas(1024, 96);
  g.font = "500 46px 'JetBrains Mono', monospace";
  g.fillStyle = '#7fd6e0';
  g.textBaseline = 'middle';
  g.fillText(text.toUpperCase(), 8, 48);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Lit-window pattern used as an emissive map; seeded so every load looks the same. */
export function windowTexture(random: () => number): THREE.CanvasTexture {
  const [c, g] = canvas(64, 128);
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 128);
  for (let r = 0; r < 16; r++)
    for (let k = 0; k < 4; k++) {
      if (random() >= 0.55) continue;
      g.fillStyle = `rgba(255,255,255,${0.25 + random() * 0.75})`;
      g.fillRect(k * 16 + 3, r * 8 + 2, 10, 4);
    }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Soft radial glow for beacons, arc dots and the crane tip. */
export function glowTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Small deterministic generator for texture patterns (not shared with layout fillers on purpose). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
