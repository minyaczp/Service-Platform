import { useState, type ReactNode } from 'react';
import type { Health, Service } from '../../shared/domain/service';
import { StatusChip } from '../../shared/ui/StatusChip';
import { healthTone } from '../../shared/ui/tone';
import { ApiDocs } from './ApiDocs';
import s from './InfoPanel.module.css';

export interface InfoPanelProps {
  readonly service: Service;
  readonly isFav: boolean;
  readonly onUse: () => void;
  readonly onToggleFav: () => void;
  readonly onClose: () => void;
}

type Tab = 'overview' | 'docs';

const LABEL: Readonly<Record<Health['state'], string>> = { healthy: 'Healthy', degraded: 'Degraded', deploying: 'Deploying', down: 'Down' };

/** Floating spec panel (handoff §Info panel) with an API Docs tab when the service publishes OpenAPI. */
export function InfoPanel(props: InfoPanelProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const { docs } = props.service.reg;
  const showDocs = tab === 'docs' && docs.kind === 'openapi';
  return (
    <div className={`${s.panel} ${showDocs ? s.wide : ''}`}>
      <Head service={props.service} onClose={props.onClose} />
      {docs.kind === 'openapi' && <Tabs tab={tab} onTab={setTab} />}
      {docs.kind === 'openapi' && showDocs ? <ApiDocs key={docs.specUrl} specUrl={docs.specUrl} /> : <Overview {...props} />}
    </div>
  );
}

function Head({ service, onClose }: { readonly service: Service; readonly onClose: () => void }) {
  const { state } = service.status.health;
  return (
    <div className={s.head}>
      <div className={s.headText}>
        <div className={s.label}>{service.reg.domain}</div>
        <div className={s.name}>{service.reg.name}</div>
        <div className={s.meta}>
          <StatusChip tone={healthTone(state)}>{LABEL[state]}</StatusChip>
          <span className={s.version}>{service.reg.version}</span>
        </div>
      </div>
      <button type="button" className={s.close} onClick={onClose} title="Close">×</button>
    </div>
  );
}

function Tabs({ tab, onTab }: { readonly tab: Tab; readonly onTab: (t: Tab) => void }) {
  const button = (t: Tab, label: string) => (
    <button type="button" className={`${s.tab} ${tab === t ? s.tabOn : ''}`} onClick={() => onTab(t)}>{label}</button>
  );
  return <div className={s.tabs}>{button('overview', 'Overview')}{button('docs', 'API Docs')}</div>;
}

function Overview({ service, isFav, onUse, onToggleFav }: InfoPanelProps) {
  const { reg, status } = service;
  return (
    <>
      <div className={s.desc}>{reg.description}</div>
      <HealthNotice health={status.health} version={reg.version} instances={status.instances} />
      <Specs service={service} />
      <Labelled label="Endpoint"><div className={s.endpoint}>{reg.endpoint}</div></Labelled>
      <Labelled label="Capabilities">
        <div className={s.caps}>{reg.capabilities.map((c) => <div key={c} className={s.cap}><span className={s.diamond} />{c}</div>)}</div>
      </Labelled>
      <div className={s.actions}>
        <button type="button" className={s.primary} onClick={onUse} disabled={reg.ui.kind === 'none'}
          title={reg.ui.kind === 'none' ? 'This service has no UI' : undefined}>Use service</button>
        <button type="button" className={`${s.fav} ${isFav ? s.favOn : ''}`} onClick={onToggleFav} title="Toggle favorite">{isFav ? '★' : '☆'}</button>
      </div>
    </>
  );
}

interface NoticeProps {
  readonly health: Health;
  readonly version: string;
  readonly instances: { readonly ready: number; readonly desired: number };
}

function HealthNotice({ health, version, instances }: NoticeProps) {
  switch (health.state) {
    case 'healthy': return null;
    case 'degraded': return <div className={s.incident}>{health.reason}</div>;
    case 'down': return <div className={`${s.incident} ${s.incidentDown}`}>{health.reason}</div>;
    case 'deploying': return <Rollout percent={health.percent} version={version} instances={instances} />;
  }
}

function Rollout({ percent, version, instances }: Omit<NoticeProps, 'health'> & { readonly percent: number }) {
  return (
    <div className={s.rollout}>
      <div className={s.rolloutHead}><span>ROLLOUT {version}</span><span>{percent}%</span></div>
      <div className={s.bar}><div className={s.barFill} style={{ width: `${percent}%` }} /></div>
      <div className={s.label}>{instances.ready} of {instances.desired} instances on {version}</div>
    </div>
  );
}

function Specs({ service: { status, reg } }: { readonly service: Service }) {
  const rows: [string, string][] = [
    ['Throughput', `${status.rps.toLocaleString('en-US')} req/s`],
    ['p99 latency', status.health.state === 'down' ? '—' : `${status.p99Ms} ms`],
    ['Uptime 30d', `${(status.uptime30d * 100).toFixed(2)}%`],
    ['Instances', `${status.instances.ready} / ${status.instances.desired}`],
    ['Owner', reg.owner],
    ['Region', reg.region],
  ];
  return (
    <div className={s.specs}>
      {rows.map(([k, v]) => <div key={k} className={s.spec}><div className={s.specKey}>{k}</div><div className={s.specVal}>{v}</div></div>)}
    </div>
  );
}

function Labelled({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return <div className={s.block}><div className={s.specKey}>{label}</div>{children}</div>;
}
