import type { CSSProperties } from 'react';
import type { Service } from '../../../shared/domain/service';
import { healthTone } from '../../../shared/ui/tone';
import s from './CityView3D.module.css';

/** World units between a building's top and its pin's stem tip. */
export const PIN_LIFT = 1.8;

export interface PinProps {
  readonly service: Service;
  readonly selected: boolean;
  readonly onSelect: (id: string) => void;
}

/** Pill + dot + stem label for one building (handoff §City view 3D: Pins); placed by `PinProjector`. */
export function Pin({ service, selected, onSelect }: PinProps) {
  const tone = { '--tone': healthTone(service.status.health.state) } as CSSProperties;
  return (
    <div className={s.pin} onClick={() => onSelect(service.reg.id)}>
      <div className={`${s.pill} ${selected ? s.pillOn : ''}`}><span className={s.pillDot} style={tone} />{service.reg.name}</div>
      <div className={`${s.stem} ${selected ? s.stemOn : ''}`} />
    </div>
  );
}
