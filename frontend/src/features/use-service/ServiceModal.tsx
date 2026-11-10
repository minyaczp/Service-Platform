import { useState, type CSSProperties } from 'react';
import type { Service } from '../../shared/domain/service';
import { healthTone } from '../../shared/ui/tone';
import s from './ServiceModal.module.css';

export interface ServiceModalProps {
  readonly service: Service;
  readonly url: string;
  readonly onBack: () => void;
  readonly onClose: () => void;
}

export const UI_FAILED = '無法載入服務前端';

function Header({ service, onBack, onClose }: Omit<ServiceModalProps, 'url'>) {
  return (
    <div className={s.header}>
      <span className={s.dot} />
      <div className={s.name}>{service.reg.name}</div>
      <span className={s.version}>{service.reg.version}</span>
      <span className={s.endpoint}>{service.reg.endpoint}</span>
      <div className={s.spacer} />
      <button type="button" className={s.back} onClick={onBack}>Back to building</button>
      <button type="button" className={s.close} onClick={onClose} title="Close">×</button>
    </div>
  );
}

/** Full-area modal hosting the service's own frontend in an iframe (handoff §Service modal, Decisions #7). */
export function ServiceModal({ service, url, onBack, onClose }: ServiceModalProps) {
  const [failed, setFailed] = useState(false);
  const tone = { '--tone': healthTone(service.status.health.state) } as CSSProperties;
  return (
    <div className={s.overlay}>
      <div className={s.card} style={tone}>
        <Header service={service} onBack={onBack} onClose={onClose} />
        <div className={s.body}>
          {failed
            ? <div className={s.error} role="alert">{UI_FAILED}</div>
            : <iframe className={s.frame} src={url} title={`${service.reg.name} UI`} onError={() => setFailed(true)} />}
        </div>
      </div>
    </div>
  );
}
