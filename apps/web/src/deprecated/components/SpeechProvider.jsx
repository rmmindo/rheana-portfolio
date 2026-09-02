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
      className={`speak topbar-icon-btn${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={() => speak(readableText(ref.current), id)}
      title={active ? t('speak.stop') : t('speak.listen')}
    >
      <span aria-hidden="true" style={{display: 'flex', alignItems: 'center'}}>
        {active ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </span>
      <span className="visually-hidden">
        {active ? `Stop listening to ${label}` : `Listen to ${label} read aloud`}
      </span>
    </button>
  );
}

export function useSpeechContext() {
  return useContext(SpeechContext);
}
