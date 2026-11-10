import { useState, type CSSProperties, type MouseEvent } from 'react';
import type { Prefs, Selection, Service } from '../../shared/domain/service';
import { StatusDot } from '../../shared/ui/StatusChip';
import { healthTone } from '../../shared/ui/tone';
import { filterServices, groupByDomain, initialsOf } from './logic';
import s from './Sidebar.module.css';

export interface SidebarProps {
  readonly services: readonly Service[];
  readonly prefs: Prefs;
  readonly selection: Selection;
  readonly onSelect: (id: string) => void;
  readonly onToggleFav: (id: string) => void;
}

const isSelected = (sel: Selection, id: string): boolean => sel.kind === 'service' && sel.id === id;
const tone = (t: string): CSSProperties => ({ '--tone': t }) as CSSProperties;

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(true);
  return (
    <aside className={`${s.aside} ${open ? s.open : s.closed}`}>
      {open ? <Panel {...props} onCollapse={() => setOpen(false)} /> : <Rail {...props} onExpand={() => setOpen(true)} />}
    </aside>
  );
}

function Panel(props: SidebarProps & { readonly onCollapse: () => void }) {
  const [query, setQuery] = useState('');
  return (
    <div className={s.panel}>
      <Header onCollapse={props.onCollapse} />
      <div className={s.searchWrap}>
        <div className={s.search}>
          <span className={s.searchIcon}>⌕</span>
          <input className={s.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services" />
        </div>
      </div>
      <Lists {...props} query={query} />
      <Footer services={props.services} />
    </div>
  );
}

function Header({ onCollapse }: { readonly onCollapse: () => void }) {
  return (
    <div className={s.header}>
      <div className={s.logo}><div className={s.logoInner} /></div>
      <div className={s.titleBox}>
        <div className={s.title}>Gridline</div>
        <div className={s.subtitle}>Service City</div>
      </div>
      <button type="button" className={s.iconButton} onClick={onCollapse} title="Collapse sidebar">«</button>
    </div>
  );
}

function pick(services: readonly Service[], ids: readonly string[]): Service[] {
  return ids.flatMap((id) => services.filter((x) => x.reg.id === id));
}

function Lists(props: SidebarProps & { readonly query: string }) {
  const { services, prefs, query } = props;
  const matched = filterServices(services, query);
  const browsing = query.trim() === '';
  return (
    <div className={s.list}>
      {browsing && prefs.favs.length > 0 && <Section {...props} label="Favorites" items={pick(services, prefs.favs)} />}
      {browsing && prefs.recent.length > 0 && <Section {...props} label="Recent" items={pick(services, prefs.recent)} />}
      {groupByDomain(matched).map((g) => (
        <Section key={g.domain} {...props} label={g.domain} count={g.services.length} items={g.services} />
      ))}
      {matched.length === 0 && <div className={s.empty}>No services match “{query}”.</div>}
    </div>
  );
}

interface SectionProps extends SidebarProps {
  readonly label: string;
  readonly items: readonly Service[];
  readonly count?: number;
}

function Section({ label, items, count, ...props }: SectionProps) {
  return (
    <div className={s.section}>
      <div className={s.sectionLabel}><span>{label}</span>{count !== undefined && <span>{count}</span>}</div>
      {items.map((svc) => <Row key={svc.reg.id} {...props} service={svc} />)}
    </div>
  );
}

function Row({ service, prefs, selection, onSelect, onToggleFav }: SidebarProps & { readonly service: Service }) {
  const { id, name, version } = service.reg;
  const fav = prefs.favs.includes(id);
  const star = (e: MouseEvent) => { e.stopPropagation(); onToggleFav(id); };
  return (
    <div role="button" tabIndex={0} className={`${s.row} ${isSelected(selection, id) ? s.rowSelected : ''}`} onClick={() => onSelect(id)}>
      <StatusDot tone={healthTone(service.status.health.state)} />
      <span className={s.name}>{name}</span>
      <span className={s.ver}>{version}</span>
      <span className={`${s.star} ${fav ? s.starOn : ''}`} onClick={star} title="Toggle favorite">{fav ? '★' : '☆'}</span>
    </div>
  );
}

function Footer({ services }: { readonly services: readonly Service[] }) {
  const n = (state: string) => services.filter((x) => x.status.health.state === state).length;
  return (
    <div className={s.footer}>
      <div>{services.length} services registered</div>
      <div className={s.counts}>
        {(['healthy', 'degraded', 'deploying'] as const).map((st) => (
          <span key={st} className={s.count}><span className={s.countDot} style={tone(healthTone(st))} />{n(st)} {st}</span>
        ))}
      </div>
    </div>
  );
}

function Rail({ services, selection, onSelect, onExpand }: SidebarProps & { readonly onExpand: () => void }) {
  return (
    <div className={s.rail}>
      <button type="button" className={s.expand} onClick={onExpand} title="Expand sidebar">»</button>
      {services.map((svc) => (
        <div key={svc.reg.id} role="button" tabIndex={0} title={svc.reg.name} onClick={() => onSelect(svc.reg.id)}
          className={`${s.tile} ${isSelected(selection, svc.reg.id) ? s.tileSelected : ''}`}>
          {initialsOf(svc.reg.name)}
          <span className={s.tileDot} style={tone(healthTone(svc.status.health.state))} />
        </div>
      ))}
    </div>
  );
}
