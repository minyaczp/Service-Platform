import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';
import type { Service } from '../../../shared/domain/service';
import { healthTone } from '../../../shared/ui/tone';
import s from './CityView3D.module.css';

/** Pins sit below the top bar (z 15) and the info panel (z 20). */
const PIN_Z: [number, number] = [10, 0];
const PIN_LIFT = 1.8;

export interface PinProps {
  readonly service: Service;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly selected: boolean;
  readonly onSelect: (id: string) => void;
}

/** HTML label projected above a building each frame (handoff §City view 3D: Pins). */
export function Pin({ service, x, y, z, selected, onSelect }: PinProps) {
  const tone = { '--tone': healthTone(service.status.health.state) } as CSSProperties;
  return (
    <Html position={[x, y + PIN_LIFT, z]} zIndexRange={PIN_Z}>
      <div className={s.pin} onClick={() => onSelect(service.reg.id)}>
        <div className={`${s.pill} ${selected ? s.pillOn : ''}`}><span className={s.pillDot} style={tone} />{service.reg.name}</div>
        <div className={`${s.stem} ${selected ? s.stemOn : ''}`} />
      </div>
    </Html>
  );
}
