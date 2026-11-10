import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ApiDocs, DOCS_FAILED } from './ApiDocs';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ApiDocs failure path', () => {
  it('shows 「無法載入 API 文件」 when the spec URL answers 404', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('missing', { status: 404 })));
    render(<ApiDocs specUrl="/mock/openapi/nope.json" />);
    expect((await screen.findByRole('alert')).textContent).toBe(DOCS_FAILED);
    expect(DOCS_FAILED).toBe('無法載入 API 文件');
  });
  it('shows the same message when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline'); }));
    render(<ApiDocs specUrl="/x.json" />);
    expect((await screen.findByRole('alert')).textContent).toBe(DOCS_FAILED);
  });
});
