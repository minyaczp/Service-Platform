import { useEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import { CAMERA, tweenAt, type Cam } from './camera';

type Goal = Omit<Cam, 'th'>;

interface Tween {
  readonly from: Cam;
  readonly to: Goal;
  readonly t0: number;
}

interface Drag {
  x: number;
  y: number;
  moved: number;
  readonly pan: boolean;
}

interface RigState {
  cam: Cam;
  tween: Tween | null;
  drag: Drag | null;
}

const DRAG_START_PX = 4;

function orbit(cam: Cam, dx: number, dy: number): Cam {
  return { ...cam, th: cam.th + dx * 0.006, ph: Math.min(CAMERA.maxPh, Math.max(CAMERA.minPh, cam.ph - dy * 0.004)) };
}

function pan(cam: Cam, dx: number, dy: number): Cam {
  const k = cam.r * 0.0016;
  const s = Math.sin(cam.th);
  const c = Math.cos(cam.th);
  return { ...cam, tx: cam.tx - (s * dx * k + c * dy * k), tz: cam.tz + (c * dx * k - s * dy * k) };
}

function zoom(cam: Cam, deltaY: number): Cam {
  return { ...cam, r: Math.min(CAMERA.maxR, Math.max(CAMERA.minR, cam.r * (1 + deltaY * 0.0012))) };
}

/** Applies the spherical camera state to the three.js camera, including the 14 % view offset. */
function place(camera: THREE.PerspectiveCamera, cam: Cam, w: number, h: number): void {
  const sp = Math.sin(cam.ph);
  camera.position.set(cam.tx + cam.r * sp * Math.cos(cam.th), cam.ty + cam.r * Math.cos(cam.ph), cam.tz + cam.r * sp * Math.sin(cam.th));
  camera.lookAt(cam.tx, cam.ty, cam.tz);
  camera.setViewOffset(w, h, cam.shift * w, 0, w, h);
}

/** Drag: orbit, or pan with right button / shift; ignored until it moves 4 px. */
function onDragMove(rig: RigState, e: PointerEvent): void {
  const d = rig.drag;
  if (!d) return;
  const dx = e.clientX - d.x;
  const dy = e.clientY - d.y;
  d.x = e.clientX;
  d.y = e.clientY;
  d.moved += Math.abs(dx) + Math.abs(dy);
  if (d.moved < DRAG_START_PX) return;
  rig.tween = null;
  rig.cam = d.pan ? pan(rig.cam, dx, dy) : orbit(rig.cam, dx, dy);
}

function usePointerControls(el: HTMLElement, rig: RefObject<RigState>): void {
  useEffect(() => {
    const down = (e: PointerEvent) => { rig.current.drag = { x: e.clientX, y: e.clientY, moved: 0, pan: e.button === 2 || e.shiftKey }; };
    const move = (e: PointerEvent) => onDragMove(rig.current, e);
    const up = () => { rig.current.drag = null; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); rig.current.tween = null; rig.current.cam = zoom(rig.current.cam, e.deltaY); };
    const menu = (e: MouseEvent) => e.preventDefault();
    el.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false }); el.addEventListener('contextmenu', menu);
    return () => {
      el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel); el.removeEventListener('contextmenu', menu);
    };
  }, [el, rig]);
}

function step(rig: RigState, now: number, autoRotate: boolean): void {
  const tw = rig.tween;
  if (tw) {
    const k = (now - tw.t0) / CAMERA.flyMs;
    rig.cam = tweenAt(tw.from, tw.to, k);
    if (k >= 1) rig.tween = null;
  } else if (!rig.drag && autoRotate) {
    rig.cam = { ...rig.cam, th: rig.cam.th + CAMERA.autoRotate };
  }
}

/**
 * Custom orbit camera (handoff §City view 3D). `goal` changes start a 1200 ms tween;
 * the first goal on mount is applied instantly (mode switch snaps to the selection).
 */
export function OrbitRig({ goal, autoRotate }: { readonly goal: Goal; readonly autoRotate: boolean }) {
  const { camera, gl, size } = useThree();
  const rig = useRef<RigState>({ cam: { ...CAMERA.start, ...goal }, tween: null, drag: null });
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    rig.current.tween = { from: rig.current.cam, to: goal, t0: performance.now() };
  }, [goal]);
  usePointerControls(gl.domElement, rig);
  useFrame(() => {
    step(rig.current, performance.now(), autoRotate);
    place(camera as THREE.PerspectiveCamera, rig.current.cam, size.width, size.height);
  });
  return null;
}
