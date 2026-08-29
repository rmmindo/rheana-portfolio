import { createContext, useContext, useRef } from 'react';
import { useSpeech, readableText } from '../hooks/useSpeech.js';
import { useI18n } from '../hooks/useI18n.jsx';

// One speech engine for the whole page. Sharing it through context is what
// guarantees the "only one voice at a time" rule: every button speaks through
// the same synth instance, so starting one always cancels another.

const SpeechContext = createContext(null);

export function SpeechProvider({ children }) {
  const speech = useSpeech();
  return <SpeechContext.Provider value={speech}>{children}</SpeechContext.Provider>;
}

/**
 * Renders a "Listen" control for the section it sits in.
 *
 * `targetRef` points at the element whose text should be read. Returns null
 * when the browser has no usable voice, so no dead control is ever shown.
 */
export function SpeakButton({ targetRef, id, label = 'this section' }) {
  const ctx = useContext(SpeechContext);
  const { t } = useI18n();
  const fallbackRef = useRef(null);
  const ref = targetRef ?? fallbackRef;

  if (!ctx || !ctx.supported) return null;

  const { speak, speakingId } = ctx;
  const active = speakingId === id;

  return (
    <button
      type="button"
      className={`speak${active ? ' speak--active' : ''}`}
      aria-pressed={active}
      onClick={() => speak(readableText(ref.current), id)}
    >
      <span aria-hidden="true" className="speak__icon">{active ? '■' : '▶'}</span>
      {active ? t('speak.stop') : t('speak.listen')}
      <span className="visually-hidden">
        {active ? ` to ${label}` : ` to ${label} read aloud`}
      </span>
    </button>
  );
}

export function useSpeechContext() {
  return useContext(SpeechContext);
}
