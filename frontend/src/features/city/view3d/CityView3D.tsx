import { Component, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import type { CityLayout, Kind, Selection, Service } from '../../../shared/domain/service';
import { arcsOf } from '../logic/arcs';
import { districtOf, districtTable } from '../logic/districts';
import { fillers } from '../logic/fillers';
import { heightOf } from '../logic/visual';
import { centreOf } from '../logic/world';
import { Arcs } from './Arcs';
import { AssetsContext, createAssets, disposeAssets } from './assets';
import { Building, topOf } from './Building';
import { flyTarget, overviewOf } from './camera';
import { Fillers } from './Fillers';
import { Ground, Plate } from './Ground';
import { OrbitRig } from './OrbitRig';
import { Pin } from './Pins';
import { SelectionFx } from './SelectionFx';
import s from './CityView3D.module.css';

export interface CityViewProps {
  readonly services: readonly Service[];
  readonly layout: CityLayout;
  readonly selection: Selection;
  readonly onSelect: (id: string) => void;
}

const FILLER_SEED = 11;
export const WEBGL_FAILED = 'WebGL is unavailable here. Switch to Isometric view.';
const kindOf = (svc: Service): Kind => districtOf(svc.reg.domain, districtTable).kind;

/** WebGL or scene errors land here instead of blanking the app (failure path: suggest Isometric). */
class GlBoundary extends Component<{ readonly children: ReactNode }, { readonly failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className={s.error}>{WEBGL_FAILED}</div> : this.props.children; }
}

/** WebGL city (handoff §City view 3D). */
export function CityView3D(props: CityViewProps) {
  const [ready, setReady] = useState(false);
  return (
    <div className={s.host}>
      <GlBoundary>
        <Canvas dpr={[1, 2]} camera={{ fov: 36, near: 0.5, far: 800 }} fallback={<div className={s.error}>{WEBGL_FAILED}</div>}
          onCreated={({ gl }) => { gl.setClearColor(0x070b13, 1); setReady(true); }}>
          <Scene {...props} />
        </Canvas>
      </GlBoundary>
      {!ready && <div className={s.message}>LOADING CITY…</div>}
    </div>
  );
}

function useGoal(services: readonly Service[], layout: CityLayout, selection: Selection) {
  const id = selection.kind === 'service' ? selection.id : '';
  return useMemo(() => {
    const svc = services.find((x) => x.reg.id === id);
    const fp = layout.footprints.get(id);
    return svc && fp ? flyTarget(fp, heightOf(svc.status.rps)) : overviewOf(layout.districts.map((d) => d.plate));
  }, [services, layout, id]);
}

function Scene({ services, layout, selection, onSelect }: CityViewProps) {
  const assets = useMemo(createAssets, []);
  useEffect(() => () => disposeAssets(assets), [assets]);
  const { hover, onHover } = useHover();
  const selectedId = selection.kind === 'service' ? selection.id : '';
  const goal = useGoal(services, layout, selection);
  const filler = useMemo(() => fillers(layout, FILLER_SEED), [layout]);
  const arcs = useMemo(() => arcsOf(services, layout), [services, layout]);
  return (
    <AssetsContext.Provider value={assets}>
      <Atmosphere layout={layout} />
      <Ground />
      {layout.districts.map((d) => <Plate key={d.id} district={d} />)}
      <Fillers list={filler} />
      <Buildings services={services} layout={layout} selectedId={selectedId} hover={hover} onSelect={onSelect} onHover={onHover} />
      <Arcs arcs={arcs} />
      <OrbitRig goal={goal} autoRotate={selectedId === ''} />
    </AssetsContext.Provider>
  );
}

/** Hovered building id ('' for none); the cursor turns into a pointer over a building. */
function useHover() {
  const [hover, setHover] = useState('');
  const onHover = (id: string, on: boolean) => setHover((h) => (on ? id : h === id ? '' : h));
  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : '';
    return () => { document.body.style.cursor = ''; };
  }, [hover]);
  return { hover, onHover };
}

/** Demo fog 150→320 at overview r 120: fog starts 30 past the overview camera and fades over 170. */
const FOG_START_PAST_R = 30;
const FOG_DEPTH = 170;

/** Fog and lights (demo :750-753); fog distance follows the overview radius so a larger city is not swallowed. */
function Atmosphere({ layout }: { readonly layout: CityLayout }) {
  const near = useMemo(() => overviewOf(layout.districts.map((d) => d.plate)).r, [layout]) + FOG_START_PAST_R;
  return (
    <>
      <fog attach="fog" args={[0x070b13, near, near + FOG_DEPTH]} />
      <hemisphereLight args={[0x6b95d8, 0x04060a, 0.8]} />
      <directionalLight color={0xa9c8ff} intensity={1} position={[-50, 90, 40]} />
    </>
  );
}

interface BuildingsProps {
  readonly services: readonly Service[];
  readonly layout: CityLayout;
  readonly selectedId: string;
  readonly hover: string;
  readonly onSelect: (id: string) => void;
  readonly onHover: (id: string, on: boolean) => void;
}

function Buildings({ services, layout, selectedId, hover, onSelect, onHover }: BuildingsProps) {
  return (
    <>
      {services.flatMap((svc) => {
        const fp = layout.footprints.get(svc.reg.id);
        if (!fp) return [];
        const id = svc.reg.id;
        const kind = kindOf(svc);
        const c = centreOf(fp);
        return [
          <Building key={id} service={svc} kind={kind} fp={fp} highlighted={id === selectedId || id === hover} onSelect={onSelect} onHover={onHover} />,
          <Pin key={`${id}-pin`} service={svc} x={c.x} y={topOf(svc, kind)} z={c.z} selected={id === selectedId} onSelect={onSelect} />,
          ...(id === selectedId ? [<SelectionFx key={`${id}-sel`} fp={fp} H={heightOf(svc.status.rps)} />] : []),
        ];
      })}
    </>
  );
}
