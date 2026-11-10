import type { Service, ViewMode } from '../../../shared/domain/service';
import s from './Chrome.module.css';

export interface TopBarProps {
  /** The selected service; empty when nothing is selected. */
  readonly selected: readonly Service[];
  readonly mode: ViewMode;
  readonly onOverview: () => void;
  readonly onMode: (m: ViewMode) => void;
  /** 3D overview rotation (NI-05); the button shows only in 3D. */
  readonly autoRotate: boolean;
  readonly onToggleRotate: () => void;
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

/** Icon-only pause / play (NI-05 Decision 6): pause bars while rotating, play triangle while stopped. */
function RotateButton({ on, onToggle }: { readonly on: boolean; readonly onToggle: () => void }) {
  return (
    <button type="button" className={`${s.glass} ${s.rotate}`} onClick={onToggle} aria-pressed={on}
      aria-label={on ? 'Pause rotation' : 'Resume rotation'} title={on ? 'Pause rotation' : 'Resume rotation'}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        {on ? <path d="M3 2h3v10H3zM8 2h3v10H8z" fill="currentColor" /> : <path d="M3.5 2l8 5-8 5z" fill="currentColor" />}
      </svg>
    </button>
  );
}

export function TopBar({ selected, mode, onOverview, onMode, autoRotate, onToggleRotate }: TopBarProps) {
  return (
    <div className={s.topbar}>
      <Crumb selected={selected} onOverview={onOverview} />
      <div className={s.spacer} />
      {selected.length > 0 && <button type="button" className={`${s.glass} ${s.overview}`} onClick={onOverview}>Overview</button>}
      {mode === '3d' && <RotateButton on={autoRotate} onToggle={onToggleRotate} />}
      <div className={`${s.glass} ${s.toggle}`}>
        {MODES.map((m) => (
          <button key={m.mode} type="button" className={`${s.mode} ${mode === m.mode ? s.modeOn : ''}`} onClick={() => onMode(m.mode)}>{m.label}</button>
        ))}
      </div>
    </div>
  );
}
