import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRef } from 'react';
import { SpeechProvider, SpeakButton } from '../src/components/SpeechProvider.jsx';
import { readableText } from '../src/hooks/useSpeech.js';

function installSynth({ voices = [{ name: 'Test', lang: 'en-US' }] } = {}) {
  const spoken = [];
  const synth = {
    getVoices: () => voices,
    speak: u => { spoken.push(u); u.onend?.(); },
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('speechSynthesis', synth);
  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  return { synth, spoken };
}

function Harness({ id = 'sec', children }) {
  const ref = useRef(null);
  return (
    <SpeechProvider>
      <div ref={ref}>{children}</div>
      <SpeakButton targetRef={ref} id={id} label="the section" />
    </SpeechProvider>
  );
}

beforeEach(() => { vi.unstubAllGlobals(); delete window.speechSynthesis; });

describe('SpeakButton', () => {
  it('renders nothing when the browser has no voices', async () => {
    installSynth({ voices: [] });
    await act(async () => { render(<Harness>Hello</Harness>); });
    expect(screen.queryByRole('button', { name: /listen/i })).toBeNull();
  });

  it('renders nothing when speechSynthesis is absent entirely', async () => {
    await act(async () => { render(<Harness>Hello</Harness>); });
    expect(screen.queryByRole('button', { name: /listen/i })).toBeNull();
  });

  it('offers a control when a voice exists', async () => {
    installSynth();
    await act(async () => { render(<Harness>Hello</Harness>); });
    expect(screen.getByRole('button', { name: /listen/i })).toBeInTheDocument();
  });

  it('never speaks until the control is pressed', async () => {
    const { spoken } = installSynth();
    await act(async () => { render(<Harness>Hello there</Harness>); });
    expect(spoken).toHaveLength(0);
  });

  it('speaks the target text when pressed', async () => {
    const { spoken } = installSynth();
    await act(async () => { render(<Harness>Hello there</Harness>); });
    await act(async () => { screen.getByRole('button', { name: /listen/i }).click(); });
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toContain('Hello there');
  });

  it('cancels any previous utterance before starting a new one', async () => {
    const { synth } = installSynth();
    await act(async () => { render(<Harness>Hello</Harness>); });
    await act(async () => { screen.getByRole('button', { name: /listen/i }).click(); });
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('exposes pressed state to assistive technology', async () => {
    installSynth();
    await act(async () => { render(<Harness>Hello</Harness>); });
    const btn = screen.getByRole('button', { name: /listen/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('readableText', () => {
  it('reads visible text', () => {
    const el = document.createElement('div');
    el.innerHTML = '<p>Shipped 2,320 merged pull requests</p>';
    expect(readableText(el)).toBe('Shipped 2,320 merged pull requests');
  });

  it('skips aria-hidden decoration so glyphs are not read as noise', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span aria-hidden="true">ᜃᜓ</span><p>Kumusta</p>';
    expect(readableText(el)).toBe('Kumusta');
  });

  it('skips anything marked data-no-speech', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span data-no-speech>1847</span><p>merged pull requests</p>';
    expect(readableText(el)).toBe('merged pull requests');
  });

  it('collapses whitespace', () => {
    const el = document.createElement('div');
    el.innerHTML = '<p>a</p>\n\n   <p>b</p>';
    expect(readableText(el)).toBe('a b');
  });

  it('returns empty for a missing element', () => {
    expect(readableText(null)).toBe('');
  });
});
