import { useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { projectPin, samePlacement, type PinPlacement, type Viewport } from '../logic/pinProjection';
import type { Vec3 } from '../logic/world';

export interface PinProjectorProps {
  readonly anchors: ReadonlyMap<string, Vec3>;
  readonly elements: RefObject<Map<string, HTMLElement>>;
}

/** Per-frame scratch, reused so a frame allocates nothing per pin. */
interface Scratch {
  readonly matrix: THREE.Matrix4;
  readonly position: THREE.Vector3;
  readonly written: WeakMap<HTMLElement, PinPlacement>;
}

/** Same writes drei `<Html>` made: translate3d to the projected point, distance z-index, hidden behind the camera. */
function write(el: HTMLElement, p: PinPlacement): void {
  if (p.kind === 'hidden') {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
  el.style.zIndex = `${p.zIndex}`;
}

function cameraOf(camera: THREE.PerspectiveCamera, scratch: Scratch) {
  camera.updateMatrixWorld();
  scratch.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  scratch.position.setFromMatrixPosition(camera.matrixWorld);
  return { viewProj: scratch.matrix.elements, position: scratch.position, near: camera.near, far: camera.far };
}

/** Inside `<Canvas>`: projects every pin anchor each frame and writes only placements that changed (NI-04 DD3). */
export function PinProjector({ anchors, elements }: PinProjectorProps) {
  const scratch = useMemo<Scratch>(() => ({ matrix: new THREE.Matrix4(), position: new THREE.Vector3(), written: new WeakMap() }), []);
  useFrame(({ camera, size }) => {
    const cam = cameraOf(camera as THREE.PerspectiveCamera, scratch);
    const viewport: Viewport = { w: size.width, h: size.height };
    for (const [id, anchor] of anchors) {
      const el = elements.current.get(id);
      if (!el) continue;
      const next = projectPin(anchor, cam, viewport);
      const last = scratch.written.get(el);
      if (last && samePlacement(last, next)) continue;
      write(el, next);
      scratch.written.set(el, next);
    }
  });
  return null;
}
