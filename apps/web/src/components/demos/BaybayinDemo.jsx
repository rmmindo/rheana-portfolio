import { useId, useMemo, useState } from 'react';
import { transliterate, syllabify } from '../../lib/baybayin.js';
import GlyphRecogniser from '../GlyphRecogniser.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

// The Baybayin Detector, playable, inside the role it came from.
//
// It used to be a separate section further down the page, which meant the claim
// and the proof lived apart: the role said "I taught a camera to read it" and
// the thing that reads was three screens away. Now the demo IS the evidence for
// the claim, in the same panel.
//
// Two modes, one at a time, so the whole thing fits a screen without scrolling:
//   Type it  - Latin in, Baybayin out, with the syllable breakdown
//   Draw it  - the inverse, which is the problem the original detector solved
//
// Both run entirely in the browser. Nothing is uploaded and nothing is stored.

const PRESETS = ['Rheana', 'Kumusta', 'Mabuhay'];

export default function BaybayinDemo() {
  const { t } = useI18n();
  const base = useId();
  const [mode, setMode] = useState('type');
  const [text, setText] = useState('Rheana');

  const glyphs = useMemo(() => transliterate(text), [text]);
  const parts = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).flatMap(w => syllabify(w)),
    [text]
  );

  return (
    <div className="demo">
      <div className="demo__modes" role="tablist" aria-label={t('demo.modes')}>
        {['type', 'draw'].map(m => (
          <button
            key={m}
            role="tab"
            id={`${base}-${m}`}
            aria-controls={`${base}-${m}-panel`}
            aria-selected={mode === m}
            tabIndex={mode === m ? 0 : -1}
            className={`demo__mode${mode === m ? ' is-active' : ''}`}
            onClick={() => setMode(m)}
          >
            {t(`demo.${m}`)}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${base}-type-panel`}
        aria-labelledby={`${base}-type`}
        hidden={mode !== 'type'}
      >
        <label className="demo__label" htmlFor={`${base}-input`}>{t('demo.label')}</label>
        <input
          id={`${base}-input`}
          className="demo__input"
          value={text}
          maxLength={24}
          autoComplete="off"
          spellCheck="false"
          onChange={e => setText(e.target.value)}
        />

        <ul className="demo__presets" role="list">
          {PRESETS.map(p => (
            <li key={p}>
              <button type="button" className="demo__preset" onClick={() => setText(p)}>{p}</button>
            </li>
          ))}
        </ul>

        {/* aria-live announces the transliteration as it changes; lang tells a
            screen reader this is Tagalog in the Tagalog script rather than
            English to be sounded out letter by letter. */}
        <output className="demo__out" htmlFor={`${base}-input`} aria-live="polite" aria-atomic="true">
          <span className="demo__glyphs" lang="tl-Tglg">{glyphs || ' '}</span>
          <span className="visually-hidden">
            {text ? `${text}: ${parts.map(p => p.latin).join(', ')}` : ''}
          </span>
        </output>

        {parts.length > 0 && (
          <ol className="demo__syllables" role="list">
            {parts.map((p, i) => (
              <li className="syl" key={`${p.latin}-${i}`}>
                <span className="syl__glyph" lang="tl-Tglg" aria-hidden="true">{p.baybayin}</span>
                <span className="syl__latin">{p.latin}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div
        role="tabpanel"
        id={`${base}-draw-panel`}
        aria-labelledby={`${base}-draw`}
        hidden={mode !== 'draw'}
      >
        <GlyphRecogniser />
      </div>

      <p className="demo__note">{t('demo.note')}</p>
    </div>
  );
}
