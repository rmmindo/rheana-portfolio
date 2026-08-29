import { useId, useMemo, useRef, useState, useEffect } from 'react';
import { transliterate, syllabify } from '../lib/baybayin.js';
import { useReveal } from '../hooks/useReveal.js';

const PRESETS = ['Rheana', 'Kumusta', 'Mabuhay', 'Salamat'];

// A small drawing surface for tracing the glyphs. Deliberately an enhancement:
// everything this section teaches is already available from the text input and
// the syllable breakdown, so a keyboard or screen-reader user loses nothing by
// skipping it. It is excluded from the tab order and labelled as decorative
// practice space rather than pretending to be an input.
function TraceCanvas({ glyphs }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // getContext returns null where canvas is unavailable (jsdom, and browsers
    // with canvas disabled). The trace surface is an enhancement, so bail out
    // quietly rather than taking the whole section down with it.
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--trace-ink').trim() || '#24597b';
  }, [glyphs]);

  const pos = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = event => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawing.current = true;
    canvasRef.current.setPointerCapture(event.pointerId);
    const { x, y } = pos(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = event => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="trace">
      <div className="trace__stage">
        <span className="trace__ghost" aria-hidden="true">{glyphs}</span>
        <canvas
          ref={canvasRef}
          className="trace__canvas"
          aria-hidden="true"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <button type="button" className="btn btn--quiet trace__clear" onClick={clear}>
        Clear tracing
      </button>
    </div>
  );
}

export default function Baybayin() {
  const ref = useReveal();
  const inputId = useId();
  const [text, setText] = useState('Rheana');

  const glyphs = useMemo(() => transliterate(text), [text]);
  const parts = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).flatMap(w => syllabify(w)),
    [text]
  );

  return (
    <section className="bay" id="baybayin" aria-labelledby="bay-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="bay-heading" className="section__title">Write your name in Baybayin</h2>

        <p className="bay__lead">
          In 2024 I co-built a <strong>Baybayin Detector</strong> that read handwritten
          Baybayin from a webcam in real time, using OpenCV optical flow and a GRU
          recurrent network. This is the easy half of that problem, running entirely
          in your browser.
        </p>

        <div className="bay__panel">
          <div className="bay__control">
            <label className="bay__label" htmlFor={inputId}>Type anything</label>
            <input
              id={inputId}
              className="bay__input"
              type="text"
              value={text}
              maxLength={40}
              autoComplete="off"
              spellCheck="false"
              onChange={e => setText(e.target.value)}
            />

            <ul className="bay__presets" role="list">
              {PRESETS.map(p => (
                <li key={p}>
                  <button type="button" className="bay__preset" onClick={() => setText(p)}>
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* aria-live so the transliteration is announced as it changes, and
              lang="tl-Tglg" so a screen reader knows this is Tagalog in the
              Tagalog script rather than mangling it as English. */}
          <output
            className="bay__output"
            htmlFor={inputId}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="bay__glyphs" lang="tl-Tglg">{glyphs || ' '}</span>
            <span className="visually-hidden">
              {text ? `${text} written in Baybayin, syllable by syllable: ${
                parts.map(p => p.latin).join(', ')
              }` : 'Type something to see it in Baybayin.'}
            </span>
          </output>
        </div>

        {parts.length > 0 && (
          <>
            <h3 className="bay__sub">How it breaks down</h3>
            <ol className="bay__syllables" role="list">
              {parts.map((p, i) => (
                <li className="syl" key={`${p.latin}-${i}`} style={{ '--i': i }}>
                  <span className="syl__glyph" lang="tl-Tglg" aria-hidden="true">{p.baybayin}</span>
                  <span className="syl__latin">{p.latin}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        <TraceCanvas glyphs={glyphs} />

        <p className="bay__note">
          Baybayin is an abugida: every consonant already carries an{' '}
          <strong>a</strong>. A mark above switches it to <strong>i</strong> or{' '}
          <strong>e</strong>, a mark below to <strong>u</strong> or{' '}
          <strong>o</strong>, and a <span lang="tl-Tglg">᜔</span> cancels the vowel
          entirely. It is a lookup table and a state machine &mdash; no model, no
          network call, and the same input always gives the same output. Knowing
          when <em>not</em> to reach for an LLM is part of the job.
        </p>
      </div>
    </section>
  );
}
