import type { Service, ViewMode } from '../../../shared/domain/service';
import s from './Chrome.module.css';

export interface TopBarProps {
  /** The selected service; empty when nothing is selected. */
  readonly selected: readonly Service[];
  readonly mode: ViewMode;
  readonly onOverview: () => void;
  readonly onMode: (m: ViewMode) => void;
}

const MODES: readonly { readonly mode: ViewMode; readonly label: string }[] = [
  { mode: '3d', label: '3D' },
  { mode: 'iso', label: 'Isometric' },
];

/** Breadcrumb · Overview · view toggle (handoff §Top bar). */
function Crumb({ selected, onOverview }: Pick<TopBarProps, 'selected' | 'onOverview'>) {
  return (
    <div className={`${s.glass} ${s.crumb}`}>
      <button type="button" className={`${s.crumbCity} ${selected.length ? s.crumbCityLink : ''}`} onClick={onOverview}>City</button>
      {selected.map((svc) => (
        <span key={svc.reg.id} className={s.crumbPath}>
          <span className={s.sep}>/</span><span className={s.domain}>{svc.reg.domain}</span>
          <span className={s.sep}>/</span><span className={s.current}>{svc.reg.name}</span>
        </span>
      ))}
    </div>
  );
}

export function TopBar({ selected, mode, onOverview, onMode }: TopBarProps) {
  return (
    <div className={s.topbar}>
      <Crumb selected={selected} onOverview={onOverview} />
      <div className={s.spacer} />
      {selected.length > 0 && <button type="button" className={`${s.glass} ${s.overview}`} onClick={onOverview}>Overview</button>}
      <div className={`${s.glass} ${s.toggle}`}>
        {MODES.map((m) => (
          <button key={m.mode} type="button" className={`${s.mode} ${mode === m.mode ? s.modeOn : ''}`} onClick={() => onMode(m.mode)}>{m.label}</button>
        ))}
      </div>
    </div>
  );
}
