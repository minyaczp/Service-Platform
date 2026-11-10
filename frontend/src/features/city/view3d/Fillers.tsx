import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Filler } from '../logic/fillers';
import { ISO_PX_PER_UNIT, PLANE_PX_PER_UNIT } from '../logic/visual';
import { centreOf } from '../logic/world';
import { roofMaterial, sideMaterial, useAssets } from './assets';

const BASE_Y = 0.3;

/** Dim background buildings (demo :775-780). Non-interactive. */
export function Fillers({ list }: { readonly list: readonly Filler[] }) {
  const { windows } = useAssets();
  const roof = useMemo(() => roofMaterial('#6aa2ff'), []);
  const edge = useMemo(() => new THREE.LineBasicMaterial({ color: 0x3d6fa0, transparent: true, opacity: 0.3 }), []);
  useEffect(() => () => { roof.dispose(); edge.dispose(); }, [roof, edge]);
  return <group>{list.map((f, i) => <FillerBox key={i} f={f} windows={windows} roof={roof} edge={edge} />)}</group>;
}

interface FillerBoxProps {
  readonly f: Filler;
  readonly windows: THREE.Texture;
  readonly roof: THREE.Material;
  readonly edge: THREE.LineBasicMaterial;
}

function FillerBox({ f, windows, roof, edge }: FillerBoxProps) {
  const w = f.w / PLANE_PX_PER_UNIT;
  const d = f.d / PLANE_PX_PER_UNIT;
  const h = f.h / ISO_PX_PER_UNIT;
  const c = centreOf(f);
  const geo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const side = useMemo(() => sideMaterial(windows, '#7fb0e0', 0.35, w, h), [windows, w, h]);
  useEffect(() => () => { geo.dispose(); edges.dispose(); side.dispose(); }, [geo, edges, side]);
  return (
    <group position={[c.x, h / 2 + BASE_Y, c.z]}>
      <mesh geometry={geo} material={[side, side, roof, roof, side, side]} />
      <lineSegments geometry={edges} material={edge} />
    </group>
  );
}
