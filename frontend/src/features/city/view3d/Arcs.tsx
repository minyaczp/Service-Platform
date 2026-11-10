import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Arc } from '../logic/arcs';
import { useAssets } from './assets';

const DOTS_PER_ARC = 2;

interface Track {
  readonly curve: THREE.QuadraticBezierCurve3;
  readonly off: number;
  readonly speed: number;
  readonly dir: 1 | -1;
}

const v = (p: { x: number; y: number; z: number }) => new THREE.Vector3(p.x, p.y, p.z);

function tracksOf(curves: readonly THREE.QuadraticBezierCurve3[]): Track[] {
  return curves.flatMap((curve, i) =>
    Array.from({ length: DOTS_PER_ARC }, (_, k): Track => ({ curve, off: k * 0.5 + i * 0.13, speed: 0.1 + (i % 3) * 0.04, dir: k % 2 ? -1 : 1 })),
  );
}

/** Traffic arcs with travelling glow dots (demo :827-837, :888). 3D only (Decided I2). */
export function Arcs({ arcs }: { readonly arcs: readonly Arc[] }) {
  const curves = useMemo(() => arcs.map((a) => new THREE.QuadraticBezierCurve3(v(a.from), v(a.control), v(a.to))), [arcs]);
  const lines = useArcLines(curves);
  return (
    <group>
      {lines.map((l, i) => <primitive key={i} object={l} />)}
      <Dots curves={curves} />
    </group>
  );
}

function useArcLines(curves: readonly THREE.QuadraticBezierCurve3[]): THREE.Line[] {
  const lines = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: 0x6aa2ff, transparent: true, opacity: 0.28 });
    return curves.map((c) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(48)), mat));
  }, [curves]);
  useEffect(() => () => lines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); }), [lines]);
  return lines;
}

function Dots({ curves }: { readonly curves: readonly THREE.QuadraticBezierCurve3[] }) {
  const { glow } = useAssets();
  const tracks = useMemo(() => tracksOf(curves), [curves]);
  const dots = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ clock }) => {
    tracks.forEach((tr, i) => {
      const k0 = (clock.elapsedTime * tr.speed + tr.off) % 1;
      dots.current[i]?.position.copy(tr.curve.getPoint(tr.dir < 0 ? 1 - k0 : k0));
    });
  });
  return (
    <group>
      {tracks.map((_, i) => (
        <sprite key={i} ref={(s) => { dots.current[i] = s; }} scale={[1.4, 1.4, 1]}>
          <spriteMaterial map={glow} color={0x9ff3fa} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
        </sprite>
      ))}
    </group>
  );
}
