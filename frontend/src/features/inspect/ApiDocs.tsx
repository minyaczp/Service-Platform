import { lazy, Suspense, useEffect, useState } from 'react';
import s from './ApiDocs.module.css';

/** Scalar is loaded on first use, so the city does not pay for it up front. */
const ScalarView = lazy(() => import('./ScalarView'));

type DocsState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly spec: Record<string, unknown> }
  | { readonly kind: 'failed' };

export const DOCS_FAILED = '無法載入 API 文件';

async function fetchSpec(url: string, signal: AbortSignal): Promise<DocsState> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return { kind: 'failed' };
    const body: unknown = await res.json();
    return typeof body === 'object' && body !== null ? { kind: 'ready', spec: body as Record<string, unknown> } : { kind: 'failed' };
  } catch {
    return { kind: 'failed' };
  }
}

function useSpec(specUrl: string): DocsState {
  const [state, setState] = useState<DocsState>({ kind: 'loading' });
  useEffect(() => {
    const ctrl = new AbortController();
    void fetchSpec(specUrl, ctrl.signal).then((next) => {
      if (!ctrl.signal.aborted) setState(next);
    });
    return () => ctrl.abort();
  }, [specUrl]);
  return state;
}

/** Read-only API reference for one OpenAPI document. Remount (via `key`) when the URL changes. */
export function ApiDocs({ specUrl }: { readonly specUrl: string }) {
  const state = useSpec(specUrl);
  const loading = <div className={s.note}>Loading API docs…</div>;
  switch (state.kind) {
    case 'loading': return loading;
    case 'failed': return <div className={s.error} role="alert">{DOCS_FAILED}</div>;
    case 'ready': return <div className={s.frame}><Suspense fallback={loading}><ScalarView spec={state.spec} /></Suspense></div>;
  }
}
