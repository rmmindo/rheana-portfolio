import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PetalBurst from '../src/components/PetalBurst.jsx';
import Stat from '../src/components/Stat.jsx';
import { setReducedMotion } from './setup.js';

const click = () => {
  act(() => {
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 100, button: 0 })
    );
  });
};

describe('PetalBurst', () => {
  beforeEach(() => { document.querySelectorAll('.petal-layer').forEach(n => n.remove()); });

  it('scatters petals on a plain click', () => {
    setReducedMotion(false);
    render(<PetalBurst />);
    click();
    expect(document.querySelectorAll('.petal-layer__petal').length).toBeGreaterThan(0);
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
    act(() => {
      screen.getByRole('button', { name: 'Send' })
        .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
    });
    expect(document.querySelectorAll('.petal-layer__petal')).toHaveLength(0);
  });
});

describe('Stat', () => {
  it('shows the exact value immediately under reduced motion', () => {
    setReducedMotion(true);
    render(<Stat value={2320} label="merged pull requests" hue="powder" />);
    expect(screen.getByText('2,320')).toBeInTheDocument();
  });

  it('keeps decimal precision rather than rounding a measured result', () => {
    setReducedMotion(true);
    render(<Stat value={96.9} decimals={1} suffix="%" label="accuracy" hue="mint" />);
    expect(screen.getByText('96.9%')).toBeInTheDocument();
  });

  it('announces the final value once instead of every increment', () => {
    setReducedMotion(true);
    render(<Stat value={61} suffix="x" label="faster" hue="pink" />);
    const sr = document.querySelector('.visually-hidden');
    expect(sr).toHaveTextContent('61x faster');
    expect(document.querySelector('.stat__value')).toHaveAttribute('aria-hidden', 'true');
  });
});
