import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { mockServices } from '../../../shared/source/mockServices';
import { PinLayer } from './PinLayer';

afterEach(cleanup);

const two = mockServices.slice(0, 2);

describe('PinLayer (NI-04)', () => {
  it('registers one DOM element per pin and releases them on unmount', () => {
    const register = vi.fn();
    const { unmount } = render(<PinLayer services={two} selectedId="" onSelect={() => {}} register={register} />);
    const ids = two.map((s) => s.reg.id);
    expect(register.mock.calls.filter(([, el]) => el instanceof HTMLElement).map(([id]) => id)).toEqual(ids);
    unmount();
    expect(register.mock.calls.filter(([, el]) => el === null).map(([id]) => id).sort()).toEqual([...ids].sort());
  });

  it('clicking a pin selects its service, as the drei pin did', () => {
    const onSelect = vi.fn();
    render(<PinLayer services={two} selectedId="" onSelect={onSelect} register={() => {}} />);
    fireEvent.click(screen.getByText(two[1]?.reg.name ?? ''));
    expect(onSelect).toHaveBeenCalledWith(two[1]?.reg.id);
  });
});
