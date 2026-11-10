import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { District } from '../../../shared/domain/service';
import { PLANE_PX_PER_UNIT } from '../logic/visual';
import { centreOf } from '../logic/world';
import { labelTexture } from './textures';

const PLATE_H = 0.3;
/** Demo sizes in plane px (road 84, grid 120 world units at 10 px/unit), so they follow PLANE_PX_PER_UNIT. */
const ROAD_LEN = 840 / PLANE_PX_PER_UNIT;
const GRID_SIZE = 1200 / PLANE_PX_PER_UNIT;

/** Ground, grid, crossing roads (demo :754-758). */
export function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color={0x070c16} roughness={1} />
      </mesh>
      <gridHelper args={[GRID_SIZE, 30, 0x1b3a5a, 0x10213a]} position-y={0.02} />
      {[[ROAD_LEN, 0.25], [0.25, ROAD_LEN]].map(([w, d]) => (
        <mesh key={`${w}`} rotation-x={-Math.PI / 2} position-y={0.05}>
          <planeGeometry args={[w ?? 0, d ?? 0]} />
          <meshBasicMaterial color={0x5fe1ec} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

/** One district plate with cyan edges and its flat label at the front-left corner (demo :763-769). */
export function Plate({ district }: { readonly district: District }) {
  const w = district.plate.w / PLANE_PX_PER_UNIT;
  const d = district.plate.d / PLANE_PX_PER_UNIT;
  const c = centreOf(district.plate);
  const geo = useMemo(() => new THREE.BoxGeometry(w, PLATE_H, d), [w, d]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const label = useMemo(() => labelTexture(district.label), [district.label]);
  useEffect(() => () => { geo.dispose(); edges.dispose(); label.dispose(); }, [geo, edges, label]);
  return (
    <group position={[c.x, PLATE_H / 2, c.z]}>
      <mesh geometry={geo}><meshStandardMaterial color={0x0b1526} roughness={0.9} /></mesh>
      <lineSegments geometry={edges}><lineBasicMaterial color={0x5fe1ec} transparent opacity={0.3} /></lineSegments>
      <mesh rotation-x={-Math.PI / 2} position={[-w / 2 + 8.8, PLATE_H / 2 + 0.02, d / 2 - 1.3]}>
        <planeGeometry args={[16, 1.5]} />
        <meshBasicMaterial map={label} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
