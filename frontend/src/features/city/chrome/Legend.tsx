import type { CSSProperties } from 'react';
import type { ViewMode } from '../../../shared/domain/service';
import { healthTone } from '../../../shared/ui/tone';
import s from './Chrome.module.css';

const tone = (t: string): CSSProperties => ({ '--tone': t }) as CSSProperties;

/** Bottom-left legend (demo :182-189). */
export function Legend() {
  return (
    <div className={`${s.glass} ${s.legend}`}>
      <div className={s.legendRow}>
        <span className={s.legendItem}><span className={s.legendDot} style={tone(healthTone('healthy'))} />Healthy</span>
        <span className={s.legendItem}><span className={s.legendDot} style={tone(healthTone('degraded'))} />Degraded</span>
        <span className={s.legendItem}><span className={s.legendDash} />Deploying</span>
        <span className={s.legendItem}><span className={s.legendDot} style={tone(healthTone('down'))} />Down</span>
      </div>
      <div className={s.legendNote}>Height = traffic · Shape = domain</div>
    </div>
  );
}

const HINT: Readonly<Record<ViewMode, string>> = {
  '3d': 'Drag to orbit · Scroll to zoom · Right-drag to pan',
  iso: 'Drag to rotate · Scroll to zoom',
};

/** Bottom-right interaction hint (demo :982). */
export function Hint({ mode }: { readonly mode: ViewMode }) {
  return <div className={s.hint}>{HINT[mode]}</div>;
}
