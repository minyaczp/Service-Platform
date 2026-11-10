import { useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { CityLayout, Footprint, Selection, Service } from '../../../shared/domain/service';
import { healthTone } from '../../../shared/ui/tone';
import { districtOf, districtTable } from '../logic/districts';
import { fillers } from '../logic/fillers';
import { buildingBoxes, fillerBoxes, isoHeightOf, MARKER_H, markerBoxes, type IsoBox } from './isoBoxes';
import { clampZoom, ISO, stageScale, stageTransform } from './isoTransform';
import s from './CityViewIso.module.css';

export interface CityViewProps {
  readonly services: readonly Service[];
  readonly layout: CityLayout;
  readonly selection: Selection;
  readonly onSelect: (id: string) => void;
}

const FILLER_SEED = 11;
const DRAG_PX = 4;
const kindOf = (svc: Service) => districtOf(svc.reg.domain, districtTable).kind;
const px = (n: number): string => `${n.toFixed(1)}px`;

interface Focus {
  readonly fp: Footprint & { h: number };
  readonly id: string;
}

function focusOf(services: readonly Service[], city: CityLayout, sel: Selection, heightOf: (s: Service) => number): Focus[] {
  if (sel.kind === 'none') return [];
  const svc = services.find((x) => x.reg.id === sel.id);
  const fp = city.footprints.get(sel.id);
  return svc && fp ? [{ fp: { ...fp, h: heightOf(svc) }, id: sel.id }] : [];
}

/** Drag-to-rotate state; `moved` tells a click from a drag. */
function useRotate() {
  const [rot, setRot] = useState<number>(ISO.startRot);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(0);
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const x0 = e.clientX;
    const rot0 = rot;
    moved.current = 0;
    const move = (ev: PointerEvent) => {
      moved.current = Math.max(moved.current, Math.abs(ev.clientX - x0));
      if (moved.current > DRAG_PX) { setDragging(true); setRot(rot0 + (ev.clientX - x0) * ISO.degPerPx); }
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); setDragging(false); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return { rot, dragging, moved, onPointerDown };
}

/** CSS-3D isometric city (handoff §Isometric). */
export function CityViewIso({ services, layout, selection, onSelect }: CityViewProps) {
  const { rot, dragging, moved, onPointerDown } = useRotate();
  const [zoom, setZoom] = useState(1);
  const [buildings, setBuildings] = useState(true);
  const lift = buildings ? isoHeightOf : markerHeight;
  const focus = focusOf(services, layout, selection, lift);
  const selectedFp = focus[0]?.fp;
  const S = stageScale(zoom, selectedFp);
  const select = (id: string) => { if (moved.current <= DRAG_PX) onSelect(id); };
  const view = { rot, S, dragging, selectedId: focus[0]?.id ?? '', select, lift, buildings };
  return (
    <div className={`${s.host} ${dragging ? s.dragging : ''}`} onPointerDown={onPointerDown}
      onWheel={(e) => setZoom((z) => clampZoom(z * (1 - e.deltaY * 0.0012)))}>
      <div className={`${s.stage} ${dragging ? '' : s.animated}`} style={{ transform: stageTransform(rot, zoom, selectedFp) }}>
        <Plane services={services} layout={layout} focus={focus} view={view} />
      </div>
      <BuildingsToggle on={buildings} onToggle={() => setBuildings((b) => !b)} />
    </div>
  );
}

interface View {
  readonly rot: number;
  readonly S: number;
  readonly dragging: boolean;
  readonly selectedId: string;
  readonly select: (id: string) => void;
  /** Height the label and focus sit at: the building, or the flat marker when buildings are off. */
  readonly lift: (s: Service) => number;
  readonly buildings: boolean;
}

const markerHeight = (): number => MARKER_H;

/** Buildings on/off chip (NI-03): off draws plates, flat health markers and labels only. */
function BuildingsToggle({ on, onToggle }: { readonly on: boolean; readonly onToggle: () => void }) {
  return (
    <button type="button" className={s.toggle} onPointerDown={(e) => e.stopPropagation()} onClick={onToggle} aria-pressed={on}>
      Buildings: <span className={on ? s.toggleOn : s.toggleOff}>{on ? 'On' : 'Off'}</span>
    </button>
  );
}

function Plane({ services, layout, focus, view }: { services: readonly Service[]; layout: CityLayout; focus: Focus[]; view: View }) {
  const boxes = useCityBoxes(services, layout, view.selectedId, view.buildings);
  return (
    <div className={s.plane}>
      <div className={s.ground} />
      {layout.districts.map((d) => (
        <div key={d.id} className={s.plate} style={{ left: d.plate.x, top: d.plate.z, width: d.plate.w, height: d.plate.d }}>
          <div className={s.plateLabel}>{d.label}</div>
        </div>
      ))}
      <div className={s.roadV} /><div className={s.roadH} />
      {focus.map((f) => <Ring key={f.id} fp={f.fp} />)}
      {boxes.map((b) => <Box key={b.key} box={b} onSelect={view.select} />)}
      {services.map((svc) => <Label key={svc.reg.id} service={svc} layout={layout} view={view} />)}
    </div>
  );
}

/** Fillers + building segments, or one flat marker per service when buildings are off. */
function useCityBoxes(services: readonly Service[], layout: CityLayout, selectedId: string, buildings: boolean): IsoBox[] {
  const filler = useMemo(() => fillerBoxes(fillers(layout, FILLER_SEED)), [layout]);
  return useMemo(
    () => (buildings ? [...filler, ...buildingBoxes(services, kindOf, layout, selectedId)] : markerBoxes(services, layout, selectedId)),
    [buildings, filler, services, layout, selectedId],
  );
}

function Ring({ fp }: { readonly fp: Footprint }) {
  const size = Math.max(fp.w, fp.d) * 1.45;
  return <div className={s.ring} style={{ left: fp.x + fp.w / 2 - size / 2, top: fp.z + fp.d / 2 - size / 2, width: size, height: size }} />;
}

function Box({ box, onSelect }: { readonly box: IsoBox; readonly onSelect: (id: string) => void }) {
  const { w, d, h, look } = box;
  const face = (extra: CSSProperties, bg: string): CSSProperties => ({ ...extra, background: bg, boxShadow: look.edge, border: look.border });
  const id = box.serviceId[0];
  return (
    <div className={s.box} onClick={id ? () => onSelect(id) : undefined}
      style={{ left: px(box.x), top: px(box.z), width: px(w), height: px(d), transform: `translateZ(${px(box.base)})`, cursor: id ? 'pointer' : 'inherit' }}>
      <div className={s.face} style={face({ left: 0, top: px(d), width: px(w), height: px(h), transform: 'rotateX(90deg)' }, look.sideA)} />
      <div className={s.face} style={face({ left: 0, top: 0, width: px(w), height: px(h), transform: 'rotateX(90deg)' }, look.sideA)} />
      <div className={s.face} style={face({ left: px(w), top: 0, width: px(h), height: px(d), transform: 'rotateY(-90deg)' }, look.sideB)} />
      <div className={s.face} style={face({ left: 0, top: 0, width: px(h), height: px(d), transform: 'rotateY(-90deg)' }, look.sideB)} />
      <div className={s.top} style={{ transform: `translateZ(${px(h)})`, background: look.top, boxShadow: look.topShadow, border: look.border }} />
    </div>
  );
}

function Label({ service, layout, view }: { readonly service: Service; readonly layout: CityLayout; readonly view: View }) {
  const fp = layout.footprints.get(service.reg.id);
  if (!fp) return null;
  const on = view.selectedId === service.reg.id;
  const transform = `translateZ(${view.lift(service) + 16}px) rotateZ(${-view.rot}deg) rotateX(-${ISO.tilt}deg) scale(${(1 / view.S).toFixed(3)}) translate(-50%, -100%)`;
  return (
    <div className={`${s.label} ${view.dragging ? '' : s.animated}`} onClick={() => view.select(service.reg.id)}
      style={{ left: fp.x + fp.w / 2, top: fp.z + fp.d / 2, transform }}>
      <div className={`${s.pill} ${on ? s.pillOn : ''}`}>
        <span className={s.pillDot} style={{ '--tone': healthTone(service.status.health.state) } as CSSProperties} />{service.reg.name}
      </div>
      <div className={s.stem} />
    </div>
  );
}
