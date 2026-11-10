import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Footprint, Kind, Service } from '../../../shared/domain/service';
import { constructionIndex, segmentsOf, type Segment } from '../logic/segments';
import { healthColor, heightOf, ISO_PX_PER_UNIT, PLANE_PX_PER_UNIT } from '../logic/visual';
import { toWorld } from '../logic/world';
import { roofMaterial, sideMaterial, useAssets } from './assets';
import { CAMERA } from './camera';

const BASE_Y = 0.3;
const ANTENNA = 6;

export interface BuildingProps {
  readonly service: Service;
  readonly kind: Kind;
  readonly fp: Footprint;
  readonly highlighted: boolean;
  readonly onSelect: (id: string) => void;
  readonly onHover: (id: string, on: boolean) => void;
}

/** Segment in world units, centred: [cx, cy, cz] and size [w, h, d]. */
interface Piece {
  readonly pos: [number, number, number];
  readonly size: [number, number, number];
  readonly seg: Segment;
}

function pieceOf(fp: Footprint, g: Segment): Piece {
  const w = g.w / PLANE_PX_PER_UNIT;
  const d = g.d / PLANE_PX_PER_UNIT;
  const h = g.h / ISO_PX_PER_UNIT;
  const y0 = g.base / ISO_PX_PER_UNIT + BASE_Y;
  return { pos: [toWorld(fp.x + g.x + g.w / 2), y0 + h / 2, toWorld(fp.z + g.z + g.d / 2)], size: [w, h, d], seg: g };
}

/** Top height of a building incl. antenna — beacon and pin sit here. */
export function topOf(service: Service, kind: Kind): number {
  return heightOf(service.status.rps) + BASE_Y + (kind === 'tower' ? ANTENNA : 0.8);
}

/** One service building: segments, scaffolding while deploying, beacon, kind extras (demo :785-819). */
export function Building(props: BuildingProps) {
  const { service, kind, fp, highlighted } = props;
  const color = healthColor(service.status.health.state);
  const H = heightOf(service.status.rps);
  const pieces = useMemo(() => segmentsOf(kind, fp, H * ISO_PX_PER_UNIT).map((g) => pieceOf(fp, g)), [kind, fp, H]);
  const scaffold = service.status.health.state === 'deploying' ? constructionIndex(kind) : -1;
  const edge = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }), [color]);
  useEffect(() => () => edge.dispose(), [edge]);
  useFrame(() => { edge.opacity = highlighted ? 1 : 0.5; });
  const handlers = usePickHandlers(service.reg.id, props.onSelect, props.onHover);
  return (
    <group {...handlers}>
      {pieces.map((p, i) => (i === scaffold
        ? <Scaffold key={i} piece={p} color={color} />
        : <Body key={i} piece={p} color={color} edge={edge} />))}
      <Extras service={service} kind={kind} fp={fp} color={color} />
    </group>
  );
}

/** Antenna (tower), rings (cylinder) and the roof beacon. */
function Extras({ service, kind, fp, color }: { readonly service: Service; readonly kind: Kind; readonly fp: Footprint; readonly color: string }) {
  const H = heightOf(service.status.rps);
  const x = toWorld(fp.x + fp.w / 2);
  const z = toWorld(fp.z + fp.d / 2);
  return (
    <>
      {kind === 'tower' && <Antenna x={x} z={z} top={H + BASE_Y} />}
      {kind === 'cylinder' && <Rings x={x} z={z} H={H} radius={fp.w * 0.04 + 0.6} color={color} />}
      <Beacon x={x} z={z} y={topOf(service, kind)} color={color} blink={service.status.health.state === 'degraded'} />
    </>
  );
}

function usePickHandlers(id: string, onSelect: (id: string) => void, onHover: (id: string, on: boolean) => void) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta <= CAMERA.clickPx) onSelect(id); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(id, true); },
    onPointerOut: () => onHover(id, false),
  };
}

function Body({ piece, color, edge }: { readonly piece: Piece; readonly color: string; readonly edge: THREE.LineBasicMaterial }) {
  const { windows } = useAssets();
  const [w, h, d] = piece.size;
  const round = piece.seg.round;
  const geo = useMemo(() => (round ? new THREE.CylinderGeometry(w / 2, w / 2, h, 40) : new THREE.BoxGeometry(w, h, d)), [round, w, h, d]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 30), [geo]);
  const mats = useMemo(() => {
    const side = sideMaterial(windows, color, 0.95, round ? w * 3 : w, h);
    const roof = roofMaterial(color);
    return round ? [side, roof, roof] : [side, side, roof, roof, side, side];
  }, [windows, color, round, w, h]);
  useEffect(() => () => { geo.dispose(); edges.dispose(); new Set(mats).forEach((m) => m.dispose()); }, [geo, edges, mats]);
  return (
    <group position={piece.pos}>
      <mesh geometry={geo} material={mats} />
      <lineSegments geometry={edges} material={edge} />
    </group>
  );
}

/** Deploying top segment: blue wireframe, a lit core, and a tower crane (demo :792-804). */
function Scaffold({ piece, color }: { readonly piece: Piece; readonly color: string }) {
  const { windows } = useAssets();
  const [w, h, d] = piece.size;
  const [cx, cy, cz] = piece.pos;
  const core = useMemo(() => sideMaterial(windows, color, 0.6, w, h), [windows, color, w, h]);
  useEffect(() => () => core.dispose(), [core]);
  return (
    <group>
      <mesh position={piece.pos}>
        <boxGeometry args={[w, h, d, 2, Math.max(3, Math.round(h / 1.2)), 2]} />
        <meshBasicMaterial color={0x6aa2ff} wireframe transparent opacity={0.65} />
      </mesh>
      <mesh position={[cx, cy - h / 2 + h * 0.225, cz]} material={core}>
        <boxGeometry args={[w * 0.72, h * 0.45, d * 0.72]} />
      </mesh>
      <Crane x={cx + w / 2 + 1.4} z={cz - d / 2 - 1.4} mastH={cy + h / 2 + 7} />
    </group>
  );
}

const steel = () => <meshStandardMaterial color={0x9fb4cc} emissive={0x6aa2ff} emissiveIntensity={0.3} roughness={0.5} />;

function Crane({ x, z, mastH }: { readonly x: number; readonly z: number; readonly mastH: number }) {
  return (
    <group>
      <mesh position={[x, mastH / 2, z]}><boxGeometry args={[0.5, mastH, 0.5]} />{steel()}</mesh>
      <Jib x={x} y={mastH} z={z} />
    </group>
  );
}

/** Rotating jib with counterweight, cable and a blinking red tip light (demo :799-804, :878). */
function Jib({ x, y, z }: { readonly x: number; readonly y: number; readonly z: number }) {
  const { glow } = useAssets();
  const jib = useRef<THREE.Group>(null);
  const tip = useRef<THREE.SpriteMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (jib.current) jib.current.rotation.y = Math.sin(t * 0.3) * 1.1;
    if (tip.current) tip.current.opacity = Math.sin(t * 4) > 0 ? 1 : 0.15;
  });
  return (
    <group ref={jib} position={[x, y, z]}>
      <mesh position-x={-4}><boxGeometry args={[14, 0.45, 0.45]} />{steel()}</mesh>
      <mesh position={[2.6, -0.6, 0]}><boxGeometry args={[1.6, 1, 0.9]} />{steel()}</mesh>
      <mesh position={[-8, -2.5, 0]}><boxGeometry args={[0.06, 5, 0.06]} />{steel()}</mesh>
      <sprite position={[0, 0.8, 0]} scale={[2.2, 2.2, 1]}>
        <spriteMaterial ref={tip} map={glow} color={0xff6b6b} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
    </group>
  );
}

function Antenna({ x, z, top }: { readonly x: number; readonly z: number; readonly top: number }) {
  return (
    <mesh position={[x, top + ANTENNA / 2, z]}>
      <cylinderGeometry args={[0.08, 0.16, ANTENNA, 8]} />
      <meshStandardMaterial color={0x9fb4cc} />
    </mesh>
  );
}

/** Three torus rings that expand and fade on a 2.9 s loop (handoff §Shapes: cylinder). */
function useRingWave(refs: { readonly current: (THREE.Mesh | null)[] }): void {
  useFrame(({ clock }) => {
    refs.current.forEach((r, i) => {
      if (!r) return;
      const k = (clock.elapsedTime * 0.35 + i / 3) % 1;
      r.scale.setScalar(1 + k * 0.7);
      (r.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - k);
    });
  });
}

function Rings({ x, z, H, radius, color }: { readonly x: number; readonly z: number; readonly H: number; readonly radius: number; readonly color: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useRingWave(refs);
  return (
    <group>
      {[0.3, 0.55, 0.8].map((k, i) => (
        <mesh key={k} ref={(m) => { refs.current[i] = m; }} rotation-x={Math.PI / 2} position={[x, BASE_Y + H * k, z]}>
          <torusGeometry args={[radius, 0.05, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Roof glow; degraded beacons blink at ~0.8 Hz (sin(5t)), others breathe (demo :877). */
function Beacon({ x, y, z, color, blink }: { readonly x: number; readonly y: number; readonly z: number; readonly color: string; readonly blink: boolean }) {
  const { glow } = useAssets();
  const mat = useRef<THREE.SpriteMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mat.current) mat.current.opacity = blink ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 5)) : 0.7 + 0.15 * Math.sin(t * 1.5 + x);
  });
  return (
    <sprite position={[x, y, z]} scale={[5, 5, 1]}>
      <spriteMaterial ref={mat} map={glow} color={color} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
    </sprite>
  );
}
