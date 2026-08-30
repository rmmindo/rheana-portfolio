import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import VisionGate from '../src/components/VisionGate.jsx';
import Odometer from '../src/components/Odometer.jsx';
import { setReducedMotion } from './setup.js';

beforeEach(() => {
  try { localStorage.clear(); } catch { /* ignore */ }
  document.documentElement.className = '';
  setReducedMotion(false);
});

describe('VisionGate', () => {
  it('opens on a first visit', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open again once it has been seen', async () => {
    localStorage.setItem('rm-seen-gate', '1');
    await act(async () => { render(<VisionGate />); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // A blurred page and a floating object is exactly what someone who asked for
  // reduced motion does not want. It should never mount for them at all.
  it('never mounts under prefers-reduced-motion', async () => {
    setReducedMotion(true);
    await act(async () => { render(<VisionGate />); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('records that it was shown, so reduced-motion users are not asked twice', async () => {
    setReducedMotion(true);
    await act(async () => { render(<VisionGate />); });
    expect(localStorage.getItem('rm-seen-gate')).toBe('1');
  });

  it('offers a skip control', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('closes when skipped, and remembers', async () => {
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /skip/i }).click(); });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('rm-seen-gate')).toBe('1');
  });

  it('closes on Escape, so it can never trap anyone', async () => {
    await act(async () => { render(<VisionGate />); });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('exposes the glasses as a real button, not a click handler on an image', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.getByRole('button', { name: /glasses/i })).toBeInTheDocument();
  });

  it('clears the page blur when the glasses go on', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(document.documentElement.classList.contains('is-clearing')).toBe(false);
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    expect(document.documentElement.classList.contains('is-clearing')).toBe(true);
  });

  it('plays the wearing animation rather than a plain fade', async () => {
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    expect(document.querySelector('.gate').className).toContain('is-wearing');
  });

  // The gate explains nothing. The blur is the explanation, and the hero says
  // what it meant afterwards.
  it('carries no explanatory copy', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.queryByText(/myopia/i)).toBeNull();
  });

  it('marks the page as gated so the blur can be applied and removed', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(document.documentElement.classList.contains('is-gated')).toBe(true);
    await act(async () => { screen.getByRole('button', { name: /skip/i }).click(); });
    expect(document.documentElement.classList.contains('is-gated')).toBe(false);
  });
});

describe('Odometer', () => {
  it('renders one column per digit', async () => {
    await act(async () => { render(<Odometer value={2320} label="pull requests" />); });
    expect(document.querySelectorAll('.odo__col')).toHaveLength(4);
  });

  it('keeps separators and units out of the rolling columns', async () => {
    await act(async () => { render(<Odometer value={2320} suffix="%" label="x" />); });
    // "2,320%" - four digits roll, the comma and percent sign do not.
    expect(document.querySelectorAll('.odo__col')).toHaveLength(4);
    expect(document.querySelectorAll('.odo__fixed')).toHaveLength(2);
  });

  it('announces the value once as text rather than ten digits per column', async () => {
    await act(async () => { render(<Odometer value={61} suffix="x" label="faster" />); });
    expect(document.querySelector('.visually-hidden')).toHaveTextContent('61x faster');
    expect(document.querySelector('.odo__col')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the final value immediately under reduced motion', async () => {
    setReducedMotion(true);
    await act(async () => { render(<Odometer value={96} label="percent" />); });
    const strips = document.querySelectorAll('.odo__strip');
    expect(strips[0].style.transform).toBe('translateY(-90%)');
    expect(strips[1].style.transform).toBe('translateY(-60%)');
  });

  it('staggers the columns so they settle left to right', async () => {
    setReducedMotion(false);
    vi.useFakeTimers();
    render(<Odometer value={123} label="x" />);
    // The failsafe stands in for the observer, which jsdom never fires.
    await act(async () => { vi.advanceTimersByTime(3000); });
    const delays = [...document.querySelectorAll('.odo__strip')]
      .map(s => s.style.transitionDelay);
    expect(new Set(delays).size).toBeGreaterThan(1);
    vi.useRealTimers();
  });

  it('settles even when the observer never fires', async () => {
    setReducedMotion(false);
    vi.useFakeTimers();
    render(<Odometer value={42} label="x" />);
    await act(async () => { vi.advanceTimersByTime(3000); });
    const strips = [...document.querySelectorAll('.odo__strip')];
    expect(strips[0].style.transform).toBe('translateY(-40%)');
    vi.useRealTimers();
  });
});
