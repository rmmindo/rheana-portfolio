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

  // Every visit, not once per visitor: Rheana's call on 2026-08-31. It is the
  // first thing the site says, and someone showing the site to a colleague
  // should get to show them this rather than describe it.
  it('opens again on a later visit', async () => {
    localStorage.setItem('rm-seen-gate', '1');
    await act(async () => { render(<VisionGate />); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('remembers nothing about the visitor', async () => {
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    expect(localStorage.length).toBe(0);
  });

  // It used to be skipped entirely for these visitors, which meant anyone with
  // Reduce Motion on - or a laptop in battery saver, which turns it on without
  // saying so - never saw the first thing the site says. The setting is about
  // MOVEMENT, not about content: they get the gate, without the travel or the
  // blink.
  it('still opens for someone who asked for reduced motion', async () => {
    setReducedMotion(true);
    await act(async () => { render(<VisionGate />); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('gives them no blink and no travel', async () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(document.querySelector('.gate__blink')).toBeNull();
    vi.useRealTimers();
  });

  it('gets them to the page quickly rather than holding them for three seconds', async () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    await act(async () => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('dialog')).toBeNull();
    vi.useRealTimers();
  });

  // Showing it every visit must not become showing it every visit to someone
  // who asked for no motion. That setting is an accessibility need, not a
  // preference to be overridden by a nice idea.
  it('opens every time for them too, and still stores nothing', async () => {
    setReducedMotion(true);
    for (let i = 0; i < 3; i++) {
      await act(async () => { render(<VisionGate />); });
      expect(screen.getAllByRole('dialog').length).toBeGreaterThan(0);
    }
    expect(localStorage.length).toBe(0);
  });

  // The skip button was removed on 2026-08-31. What must never go is a way
  // out: a modal that blurs the whole page and cannot be dismissed is a trap,
  // whatever it looks like. Two remain, and both are tested.
  it('offers a way through that is a real button', async () => {
    await act(async () => { render(<VisionGate />); });
    const glasses = screen.getByRole('button', { name: /glasses/i });
    expect(glasses).toBeInTheDocument();
    expect(glasses.tagName).toBe('BUTTON');
  });

  it('has no control that is not the glasses', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  // Two slow blinks between the glasses and the page, seen from behind the
  // eyes rather than looking at a pair of them.
  it('blinks after the glasses go on, and only then', async () => {
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    expect(document.querySelector('.gate__blink')).toBeNull();

    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    // Still travelling; the lids have not come down yet.
    expect(document.querySelector('.gate__blink')).toBeNull();

    await act(async () => { vi.advanceTimersByTime(1300); });
    expect(document.querySelector('.gate__blink')).not.toBeNull();
    // An upper lid, a lower lid, and the lash fringe across the top.
    expect(document.querySelectorAll('.gate__lid')).toHaveLength(2);
    expect(document.querySelector('.gate__fringe')).not.toBeNull();
    vi.useRealTimers();
  });

  // It draws nothing: the visitor is the eye, so there is no illustration of
  // one. Earlier versions drew eyelids and then two whole eyes, and both were
  // wrong for the same reason.
  it('shows no picture of an eye', async () => {
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    await act(async () => { vi.advanceTimersByTime(1300); });
    expect(document.querySelector('.gate__blink svg')).toBeNull();
    vi.useRealTimers();
  });

  // The blink is decoration. It must not become a thing a screen reader reads
  // out, and it must never be the reason someone is stuck on the gate.
  it('hides the blink from assistive technology', async () => {
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    await act(async () => { vi.advanceTimersByTime(1300); });
    expect(document.querySelector('.gate__blink').getAttribute('aria-hidden')).toBe('true');
    vi.useRealTimers();
  });

  it('closes when the glasses are taken', async () => {
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(screen.queryByRole('dialog')).toBeNull();
    vi.useRealTimers();
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

  // The gate states one thing and asks nothing. The blur is the explanation;
  // the hero names it afterwards.
  it('states rather than explains, and never mentions myopia', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.getByText(/next big idea into focus/i)).toBeInTheDocument();
    expect(screen.queryByText(/myopia/i)).toBeNull();
  });

  // A yes/no puts a decision in front of someone who has not been given a
  // reason to care yet. There is only ever an action.
  it('asks no question the visitor has to answer', async () => {
    await act(async () => { render(<VisionGate />); });
    expect(screen.queryByRole('button', { name: /^yes$/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^no$/i })).toBeNull();
  });

  it('marks the page as gated so the blur can be applied and removed', async () => {
    vi.useFakeTimers();
    await act(async () => { render(<VisionGate />); });
    expect(document.documentElement.classList.contains('is-gated')).toBe(true);
    await act(async () => { screen.getByRole('button', { name: /glasses/i }).click(); });
    await act(async () => { vi.advanceTimersByTime(5000); });
    // The blur must not outlive the gate. Leaving this class behind would
    // leave the whole page unreadable, which on this site of all sites is the
    // worst thing that could stick.
    expect(document.documentElement.classList.contains('is-gated')).toBe(false);
    vi.useRealTimers();
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
