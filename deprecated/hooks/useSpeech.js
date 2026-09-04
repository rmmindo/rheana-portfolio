import { useCallback, useEffect, useRef, useState } from 'react';
import { pickVoice } from '../lib/pickVoice.js';

// Read-aloud built on the Web Speech API.
//
// Deliberate constraints, because this sits on a site built for a low-vision
// reader and a naive implementation would make things worse:
//
//   - Nothing ever autoplays. A page that starts talking is hostile.
//   - Only one utterance at a time. Starting a new section cancels the old one,
//     so a reader can never end up with two voices overlapping.
//   - The control hides itself entirely when no usable voice exists, rather
//     than shipping a button that silently does nothing.
//   - It is NOT a screen reader replacement. Someone using NVDA already has a
//     voice; this is for sighted-but-tired readers, low-vision readers not
//     running AT, and anyone who would rather listen. That is why it is an
//     ordinary button they can skip, not an announcement.
//
// speechSynthesis.getVoices() is async in every browser and returns [] on the
// first call in most, so support is resolved via the voiceschanged event.

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [speakingId, setSpeakingId] = useState(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    const check = () => {
      const list = synth.getVoices();
      setVoices(list);
      setSupported(list.length > 0);
    };

    check();
    synth.addEventListener?.('voiceschanged', check);

    // Safari sometimes never fires voiceschanged; poll briefly as a fallback
    // rather than leaving the control hidden on a browser that can speak.
    const retry = setTimeout(check, 600);

    return () => {
      clearTimeout(retry);
      synth.removeEventListener?.('voiceschanged', check);
      synth.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeakingId(null);
  }, []);

  const speak = useCallback((text, id) => {
    if (!text) return;
    const synth = window.speechSynthesis;

    // Pressing the same button again is a stop, which is what a reader expects.
    if (speakingId === id) { stop(); return; }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    const locale = document.documentElement.lang || 'en';
    utterance.lang = locale;

    // Prefer a female Filipino voice, then a female voice in the page language,
    // then anything intelligible. See lib/pickVoice.js for the ranking.
    const chosen = pickVoice(window.speechSynthesis.getVoices(), locale);
    if (chosen) {
      utterance.voice = chosen;
      // The voice's own language wins over the page's: setting lang to
      // something the chosen voice does not speak makes some engines fall back
      // to a different voice entirely.
      utterance.lang = chosen.lang || locale;
    }
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    utteranceRef.current = utterance;
    setSpeakingId(id);
    synth.speak(utterance);
  }, [speakingId, stop]);

  return { supported, speak, stop, speakingId, voices };
}

/**
 * Collects the readable text of an element.
 *
 * Skips anything aria-hidden and any element marked data-no-speech, so
 * decorative glyphs, the count-up digits mid-animation, and Baybayin
 * characters are not read out as noise.
 */
export function readableText(root) {
  if (!root) return '';
  const clone = root.cloneNode(true);
  clone.querySelectorAll('[aria-hidden="true"], [data-no-speech], script, style')
    .forEach(node => node.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}
