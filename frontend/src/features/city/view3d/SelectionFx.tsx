import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Footprint } from '../../../shared/domain/service';
import { PLANE_PX_PER_UNIT } from '../logic/visual';
import { centreOf } from '../logic/world';

const ACCENT = '#5fe1ec';

/** Pulsing ground ring and a faint light beam over the selected building (demo :821-825, :881-886). */
export function SelectionFx({ fp, H }: { readonly fp: Footprint; readonly H: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const c = centreOf(fp);
  const rad = (Math.max(fp.w, fp.d) / PLANE_PX_PER_UNIT) * 0.85;
  useFrame(({ clock }) => {
    ring.current?.scale.setScalar(rad * (1 + 0.06 * Math.sin(clock.elapsedTime * 3)));
  });
  return (
    <group>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[c.x, 0.36, c.z]}>
        <ringGeometry args={[1, 1.1, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.9} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[c.x, H + 40.3, c.z]} scale={[rad * 0.7, 80, rad * 0.7]}>
        <cylinderGeometry args={[1, 1, 1, 48, 1, true]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.06} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
