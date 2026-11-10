import type { Service } from '../../../shared/domain/service';
import { Pin } from './Pins';
import s from './CityView3D.module.css';

export interface PinLayerProps {
  readonly services: readonly Service[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly register: (id: string, el: HTMLElement | null) => void;
}

/** DOM overlay over the canvas; one anchor per pin, positioned each frame by `PinProjector` (NI-04). */
export function PinLayer({ services, selectedId, onSelect, register }: PinLayerProps) {
  return (
    <div className={s.pinLayer}>
      {services.map((svc) => (
        <div key={svc.reg.id} className={s.pinAnchor} ref={(el) => register(svc.reg.id, el)}>
          <Pin service={svc} selected={svc.reg.id === selectedId} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
