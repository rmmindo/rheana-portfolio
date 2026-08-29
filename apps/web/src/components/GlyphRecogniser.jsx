import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { GLYPHS, GRID, normalise, classify } from '../lib/recognize.js';
import { useI18n } from '../hooks/useI18n.jsx';

// Draw a Baybayin character, get it identified.
//
// The templates are rasterised from the page's own Baybayin font at mount, so
// there is nothing to download and nothing to train. See lib/recognize.js for
// why template matching is the right tool at this size.
//
// Accessibility: a canvas is not usable without a pointer, so this whole panel
// is an ENHANCEMENT. The section it sits in already teaches the same material
// through the text input and the syllable breakdown, which are fully keyboard
// operable. The result is announced through aria-live so a low-vision user
// drawing with a stylus still gets the answer read to them.

const CANVAS = 260;

function rasterise(char, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#000';
  ctx.font = `${Math.round(size * 0.78)}px "Noto Sans Tagalog", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, size / 2, size / 2);

  const { data } = ctx.getImageData(0, 0, size, size);
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = data[i * 4 + 3] / 255;
  return normalise(grid, size, size, GRID);
}

export default function GlyphRecogniser() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [templates, setTemplates] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const resultId = useId();

  // Build the templates once the Baybayin font is ready. Rasterising before the
  // font loads would capture tofu boxes and every guess would be wrong.
  useEffect(() => {
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const built = GLYPHS
        .map(g => ({ ...g, features: rasterise(g.char) }))
        .filter(g => g.features);
      setTemplates(built);
    };

    // Rasterising 17 glyphs is a few milliseconds of main-thread work. Doing it
    // during hydration adds directly to Total Blocking Time for a feature most
    // visitors never scroll to, so it waits for an idle moment.
    const schedule = fn =>
      (window.requestIdleCallback ?? (cb => setTimeout(cb, 200)))(fn, { timeout: 2000 });

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => document.fonts.load('40px "Noto Sans Tagalog"'))
        .then(() => schedule(build))
        .catch(() => schedule(build));
    } else {
      schedule(build);
    }
    return () => { cancelled = true; };
  }, []);

  const context = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  };

  useEffect(() => {
    const c = context();
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.canvas.width = CANVAS * dpr;
    c.canvas.height = CANVAS * dpr;
    c.ctx.scale(dpr, dpr);
    c.ctx.lineCap = 'round';
    c.ctx.lineJoin = 'round';
    c.ctx.lineWidth = 12;
    c.ctx.strokeStyle = '#000';
  }, []);

  const recognise = useCallback(() => {
    const c = context();
    if (!c || !templates.length || !hasInk.current) { setGuesses([]); return; }

    const { width, height } = c.canvas;
    const { data } = c.ctx.getImageData(0, 0, width, height);
    const grid = new Float32Array(width * height);
    for (let i = 0; i < grid.length; i++) grid[i] = data[i * 4 + 3] / 255;

    setGuesses(classify(normalise(grid, width, height, GRID), templates, 3));
  }, [templates]);

  const point = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = event => {
    const c = context();
    if (!c) return;
    drawing.current = true;
    hasInk.current = true;
    canvasRef.current.setPointerCapture(event.pointerId);
    const { x, y } = point(event);
    c.ctx.beginPath();
    c.ctx.moveTo(x, y);
  };

  const move = event => {
    if (!drawing.current) return;
    const c = context();
    if (!c) return;
    const { x, y } = point(event);
    c.ctx.lineTo(x, y);
    c.ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    recognise();
  };

  const clear = () => {
    const c = context();
    if (!c) return;
    c.ctx.clearRect(0, 0, c.canvas.width, c.canvas.height);
    hasInk.current = false;
    setGuesses([]);
  };

  const [best, ...rest] = guesses;

  return (
    <div className="draw">
      <div className="draw__board">
        <canvas
          ref={canvasRef}
          className="draw__canvas"
          style={{ width: CANVAS, height: CANVAS }}
          aria-hidden="true"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <button type="button" className="btn btn--quiet draw__clear" onClick={clear}>
          {t('bay.clear')}
        </button>
      </div>

      <div className="draw__result" id={resultId} aria-live="polite" aria-atomic="true">
        {best ? (
          <>
            <p className="draw__label">{t('bay.draw.guess')}</p>
            <p className="draw__glyph" lang="tl-Tglg" aria-hidden="true">{best.char}</p>
            <p className="draw__latin">
              {best.reading ?? best.latin}
              <span className="draw__score"> · {Math.round(best.score * 100)}%</span>
            </p>

            {rest.length > 0 && (
              <>
                <p className="draw__label draw__label--alt">{t('bay.draw.alternatives')}</p>
                <ul className="draw__alts" role="list">
                  {rest.map(g => (
                    <li key={g.char}>
                      <span lang="tl-Tglg" aria-hidden="true">{g.char}</span>
                      <span className="draw__alt-latin">{g.reading ?? g.latin}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p className="draw__empty">{t('bay.draw.empty')}</p>
        )}
      </div>
    </div>
  );
}
