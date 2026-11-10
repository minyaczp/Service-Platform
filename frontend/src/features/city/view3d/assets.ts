import { createContext, useContext } from 'react';
import * as THREE from 'three';
import { glowTexture, seeded, windowTexture } from './textures';

/** Textures shared by every mesh in one scene. Created once per Canvas, disposed with it. */
export interface Assets {
  readonly windows: THREE.CanvasTexture;
  readonly glow: THREE.CanvasTexture;
}

const WINDOW_SEED = 7;

export function createAssets(): Assets {
  return { windows: windowTexture(seeded(WINDOW_SEED)), glow: glowTexture() };
}

export function disposeAssets(a: Assets): void {
  a.windows.dispose();
  a.glow.dispose();
}

export const AssetsContext = createContext<Assets | null>(null);

export function useAssets(): Assets {
  const a = useContext(AssetsContext);
  if (!a) throw new Error('useAssets outside <AssetsContext.Provider>');
  return a;
}

/** Window-lit body material (demo :772): dark metal, emissive windows tinted by health. */
export function sideMaterial(windows: THREE.Texture, color: string, intensity: number, w: number, h: number): THREE.MeshStandardMaterial {
  const t = windows.clone();
  t.needsUpdate = true;
  t.repeat.set(Math.max(1, Math.round(w / 2.5)), Math.max(1, Math.round(h / 4)));
  return new THREE.MeshStandardMaterial({
    color: 0x0b1322, roughness: 0.5, metalness: 0.45,
    emissive: new THREE.Color(color), emissiveMap: t, emissiveIntensity: intensity,
  });
}

/** Roof material (demo :773). */
export function roofMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x101b2e, roughness: 0.8, emissive: new THREE.Color(color), emissiveIntensity: 0.08 });
}
