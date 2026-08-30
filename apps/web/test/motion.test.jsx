import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PetalBurst from '../src/components/PetalBurst.jsx';
import Stat from '../src/components/Stat.jsx';
import { setReducedMotion } from './setup.js';

const pointer = (type, opts) =>
  Object.assign(new MouseEvent(type, { bubbles: true, button: 0, ...opts }), {
    pointerType: opts.pointerType ?? 'mouse',
  });

// A mouse press bursts immediately.
const click = (target = document.body) => {
  act(() => { target.dispatchEvent(pointer('pointerdown', { clientX: 100, clientY: 100 })); });
};

// A touch tap: press and release in the same place, quickly.
const tap = (target = document.body) => {
  act(() => {
    target.dispatchEvent(pointer('pointerdown', { clientX: 100, clientY: 100, pointerType: 'touch' }));
    target.dispatchEvent(pointer('pointerup', { clientX: 102, clientY: 101, pointerType: 'touch' }));
  });
};

// A touch scroll: press, move a long way, release.
const swipe = (target = document.body) => {
  act(() => {
    target.dispatchEvent(pointer('pointerdown', { clientX: 100, clientY: 400, pointerType: 'touch' }));
    target.dispatchEvent(pointer('pointerup', { clientX: 104, clientY: 90, pointerType: 'touch' }));
  });
};

const petals = () => document.querySelectorAll('.petal-layer__petal').length;

describe('PetalBurst', () => {
  beforeEach(() => { document.querySelectorAll('.petal-layer').forEach(n => n.remove()); });

  it('scatters petals on a mouse click', () => {
    setReducedMotion(false);
    render(<PetalBurst />);
    click();
    expect(petals()).toBeGreaterThan(0);
  });

  it('scatters petals on a touch tap', () => {
    setReducedMotion(false);
    render(<PetalBurst />);
    tap();
    expect(petals()).toBeGreaterThan(0);
  });

  // The bug this prevents: pointerdown fires the moment a finger lands, which
  // is also how a scroll starts, so every swipe used to throw petals.
  it('does NOT scatter petals when a touch drag is a scroll', () => {
    setReducedMotion(false);
    render(<PetalBurst />);
    swipe();
    expect(petals()).toBe(0);
  });

  it('does not scatter when a touch gesture is cancelled', () => {
    setReducedMotion(false);
    render(<PetalBurst />);
    act(() => {
      document.body.dispatchEvent(
        pointer('pointerdown', { clientX: 100, clientY: 100, pointerType: 'touch' }));
      document.body.dispatchEvent(
        pointer('pointercancel', { clientX: 100, clientY: 100, pointerType: 'touch' }));
      document.body.dispatchEvent(
        pointer('pointerup', { clientX: 100, clientY: 100, pointerType: 'touch' }));
    });
    expect(petals()).toBe(0);
  });

  it('mounts nothing at all under prefers-reduced-motion', () => {
    setReducedMotion(true);
    render(<PetalBurst />);
    click();
    expect(document.querySelector('.petal-layer')).toBeNull();
  });

  it('keeps the layer inert so it can never swallow a click', () => {
    setReducedMotion(false);
    render(<PetalBurst />);
    click();
    const layer = document.querySelector('.petal-layer');
    expect(layer).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not fire on interactive controls', () => {
    setReducedMotion(false);
    render(<><PetalBurst /><button type="button">Send</button></>);
    click(screen.getByRole('button', { name: 'Send' }));
    expect(petals()).toBe(0);
  });
});

// Stat renders through the Odometer now, so the digits live in per-column
// strips rather than one text node. These assert the same properties against
// the new shape: the number is right, the precision survives, and a screen
// reader hears the value once rather than ten digits per column.
describe('Stat', () => {
  it('shows the exact value under reduced motion', () => {
    setReducedMotion(true);
    render(<Stat value={2320} label="merged pull requests" hue="powder" />);
    expect(document.querySelector('.visually-hidden'))
      .toHaveTextContent('2,320 merged pull requests');
  });

  it('keeps decimal precision rather than rounding a measured result', () => {
    setReducedMotion(true);
    render(<Stat value={96.9} decimals={1} suffix="%" label="accuracy" hue="mint" />);
    expect(document.querySelector('.visually-hidden')).toHaveTextContent('96.9% accuracy');
  });

  it('rounds to a whole number when no precision is asked for', () => {
    setReducedMotion(true);
    render(<Stat value={60.6} suffix="x" label="faster" hue="pink" />);
    expect(document.querySelector('.visually-hidden')).toHaveTextContent('61x faster');
  });

  it('hides the rolling columns from assistive technology', () => {
    setReducedMotion(true);
    render(<Stat value={61} suffix="x" label="faster" hue="pink" />);
    expect(document.querySelector('.odo__col')).toHaveAttribute('aria-hidden', 'true');
  });
});
