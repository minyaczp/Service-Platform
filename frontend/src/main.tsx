import { StrictMode, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { Prefs, Selection, Service, ServiceStatus, ViewMode } from './shared/domain/service';
import type { SourceEvent } from './shared/domain/source';
import { createMockSource } from './shared/source/mockSource';
import { mockServices } from './shared/source/mockServices';
import { loadPrefs, savePrefs } from './shared/persistence/prefs';
import { pushRecent, toggleFav } from './features/catalog/logic';
import { Sidebar } from './features/catalog/Sidebar';
import { districtOf, districtTable } from './features/city/logic/districts';
import { layout } from './features/city/logic/layout';
import { CityView3D } from './features/city/view3d/CityView3D';
import { CityViewIso } from './features/city/viewIso/CityViewIso';
import { TopBar } from './features/city/chrome/TopBar';
import { Hint, Legend } from './features/city/chrome/Legend';
import { InfoPanel } from './features/inspect/InfoPanel';
import { ServiceModal } from './features/use-service/ServiceModal';
import { LoginPage } from './features/auth/LoginPage';
import './shared/ui/tokens.css';
import s from './main.module.css';

export interface AppState {
  readonly services: readonly Service[];
  readonly selection: Selection;
  readonly modal: { readonly kind: 'closed' } | { readonly kind: 'open'; readonly id: string };
  readonly session: 'signedOut' | 'signedIn';
  readonly prefs: Prefs;
  /** 3D overview auto-rotate; deliberately not in `Prefs`, so it is never saved (NI-05 Decision 2). */
  readonly autoRotate: boolean;
  applyEvent(e: SourceEvent): void;
  select(id: string): void;
  clearSelection(): void;
  openModal(id: string): void;
  closeModal(): void;
  login(): void;
  toggleFav(id: string): void;
  setMode(m: ViewMode): void;
  toggleAutoRotate(): void;
}

const CLOSED = { kind: 'closed' } as const;
const NONE = { kind: 'none' } as const;

function withStatus(services: readonly Service[], id: string, status: ServiceStatus): Service[] {
  return services.map((x) => (x.reg.id === id ? { ...x, status } : x));
}

function nextServices(current: readonly Service[], e: SourceEvent): readonly Service[] {
  switch (e.type) {
    case 'snapshot': return e.services;
    case 'status': return withStatus(current, e.id, e.status);
  }
}

/** The one store (CLAUDE.md §0): state only, no I/O — source and storage are wired below. */
export function createAppStore(prefs: Prefs): StoreApi<AppState> {
  return createStore<AppState>()((set) => ({
    services: [], selection: NONE, modal: CLOSED, session: 'signedOut', prefs, autoRotate: true,
    applyEvent: (e) => set((st) => ({ services: nextServices(st.services, e) })),
    select: (id) => set((st) => ({ selection: { kind: 'service', id }, modal: CLOSED, prefs: { ...st.prefs, recent: pushRecent(st.prefs.recent, id) } })),
    clearSelection: () => set({ selection: NONE, modal: CLOSED }),
    openModal: (id) => set({ modal: { kind: 'open', id } }),
    closeModal: () => set({ modal: CLOSED }),
    login: () => set({ session: 'signedIn' }),
    toggleFav: (id) => set((st) => ({ prefs: { ...st.prefs, favs: toggleFav(st.prefs.favs, id) } })),
    setMode: (mode) => set((st) => ({ prefs: { ...st.prefs, mode } })),
    toggleAutoRotate: () => set((st) => ({ autoRotate: !st.autoRotate })),
  }));
}

function selectedOf(st: AppState): Service[] {
  const sel = st.selection;
  return sel.kind === 'service' ? st.services.filter((x) => x.reg.id === sel.id) : [];
}

const districtFor = (domain: string) => districtOf(domain, districtTable);

function useEscape(store: StoreApi<AppState>): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const st = store.getState();
      if (st.modal.kind === 'open') st.closeModal();
      else st.clearSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store]);
}

function App({ store }: { readonly store: StoreApi<AppState> }) {
  const session = useStore(store, (st) => st.session);
  const login = useStore(store, (st) => st.login);
  return session === 'signedIn' ? <City store={store} /> : <LoginPage onLogin={login} />;
}

function City({ store }: { readonly store: StoreApi<AppState> }) {
  const st = useStore(store);
  useEscape(store);
  const city = useMemo(() => layout(st.services, districtFor), [st.services]);
  const viewProps = { services: st.services, layout: city, selection: st.selection, onSelect: st.select };
  return (
    <div className={s.app}>
      <Sidebar services={st.services} prefs={st.prefs} selection={st.selection} onSelect={st.select} onToggleFav={st.toggleFav} />
      <main className={s.main}>
        {st.prefs.mode === '3d' ? <CityView3D {...viewProps} autoRotate={st.autoRotate} /> : <CityViewIso {...viewProps} />}
        <TopBar selected={selectedOf(st)} mode={st.prefs.mode} onOverview={st.clearSelection} onMode={st.setMode}
          autoRotate={st.autoRotate} onToggleRotate={st.toggleAutoRotate} />
        {st.modal.kind === 'closed' && <><Legend /><Hint mode={st.prefs.mode} /></>}
        <Overlay st={st} />
      </main>
    </div>
  );
}

function Overlay({ st }: { readonly st: AppState }) {
  return selectedOf(st).map((svc) => {
    const { id, ui } = svc.reg;
    if (st.modal.kind === 'open' && ui.kind === 'iframe')
      return <ServiceModal key={`${id}-modal`} service={svc} url={ui.url} onBack={st.closeModal} onClose={st.clearSelection} />;
    return <InfoPanel key={id} service={svc} isFav={st.prefs.favs.includes(id)} onUse={() => st.openModal(id)}
      onToggleFav={() => st.toggleFav(id)} onClose={st.clearSelection} />;
  });
}

/** Wiring edge: storage, source and store meet here and nowhere else. */
function start(): void {
  const storage = typeof window === 'undefined' ? undefined : window.localStorage;
  const store = createAppStore(loadPrefs(storage));
  createMockSource(mockServices).subscribe(store.getState().applyEvent);
  store.subscribe((st, prev) => { if (st.prefs !== prev.prefs) savePrefs(storage, st.prefs); });
  const root = document.getElementById('root');
  if (!root) throw new Error('#root missing from index.html');
  createRoot(root).render(<StrictMode><App store={store} /></StrictMode>);
}

start();
