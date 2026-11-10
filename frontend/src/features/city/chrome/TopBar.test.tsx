import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ViewMode } from '../../../shared/domain/service';
import { TopBar } from './TopBar';

afterEach(cleanup);

const bar = (mode: ViewMode, autoRotate: boolean, onToggleRotate = () => {}) => (
  <TopBar selected={[]} mode={mode} onOverview={() => {}} onMode={() => {}} autoRotate={autoRotate} onToggleRotate={onToggleRotate} />
);

describe('TopBar rotate button (NI-05)', () => {
  it('shows "Pause rotation" in 3D while rotating, "Resume rotation" while stopped', () => {
    const { rerender } = render(bar('3d', true));
    expect(screen.getByRole('button', { name: 'Pause rotation' }).getAttribute('aria-pressed')).toBe('true');
    rerender(bar('3d', false));
    expect(screen.getByRole('button', { name: 'Resume rotation' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('is absent in Isometric', () => {
    render(bar('iso', true));
    expect(screen.queryByRole('button', { name: /rotation/ })).toBeNull();
  });

  it('is icon-only and calls onToggleRotate once per click', () => {
    const onToggle = vi.fn();
    render(bar('3d', true, onToggle));
    const button = screen.getByRole('button', { name: 'Pause rotation' });
    expect(button.textContent).toBe('');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
