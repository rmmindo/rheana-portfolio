import { useCallback, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';

// The close.
//
// A button that says "Let's build something" asks the reader to want a thing.
// A half-written letter asks them to finish a sentence, which is a far smaller
// request and a far more specific one. By the time they have typed six words
// they have described their own project, and that is the whole job of a
// portfolio's last screen.
//
// It opens already addressed and already begun:
//
//     Hey Rheana,
//     build me |
//
// The prompts underneath are not decoration - they are the three things a
// visitor most plausibly wants, so someone with a vague itch can click instead
// of compose.
//
// Delivery: posts to VITE_FORM_ENDPOINT when one is configured, and falls back
// to opening a pre-filled email when it is not. The fallback matters because it
// means this works today, on static hosting, with no account anywhere - and
// swapping in a real endpoint later changes one environment variable, not this
// component.

const ENDPOINT = import.meta.env?.VITE_FORM_ENDPOINT ?? '';

export default function WriteToMe({ email }) {
  const ref = useReveal();
  const { t } = useI18n();
  const askRef = useRef(null);

  const [ask, setAsk] = useState('');
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const prompts = [t('write.p1'), t('write.p2'), t('write.p3')];

  const pick = useCallback(text => {
    setAsk(text);
    askRef.current?.focus();
  }, []);

  const submit = useCallback(async event => {
    event.preventDefault();
    if (!ask.trim()) { askRef.current?.focus(); return; }

    const form = event.currentTarget;
    const from = form.elements.from?.value ?? '';
    const body = `${t('write.greeting')}\n\n${t('write.stem')} ${ask}\n\n${from}`;

    if (!ENDPOINT) {
      // No backend configured: hand the message to their mail client, already
      // written. Nothing is lost and nothing is silently dropped.
      window.location.href =
        `mailto:${email}?subject=${encodeURIComponent(t('write.subject'))}` +
        `&body=${encodeURIComponent(body)}`;
      setSent(true);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ask, from, message: body }),
      });
      if (res.ok) setSent(true);
      else throw new Error(String(res.status));
    } catch {
      // A failed send must never look like a successful one.
      window.location.href =
        `mailto:${email}?subject=${encodeURIComponent(t('write.subject'))}` +
        `&body=${encodeURIComponent(body)}`;
      setSent(true);
    } finally {
      setBusy(false);
    }
  }, [ask, email, t]);

  if (sent) {
    return (
      <section className="write" id="write" aria-labelledby="write-heading" ref={ref}>
        <div className="section__inner">
          <h2 id="write-heading" className="write__greeting">{t('write.thanks')}</h2>
          <p className="write__sub">{t('write.thanksSub')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="write" id="write" aria-labelledby="write-heading" ref={ref}>
      <div className="section__inner">
        {/* The hook asks the question; the letter beneath it is how you answer.
            Putting a question above a half-written sentence is what turns a
            form into a reply. */}
        <p className="write__hook">{t('write.hook')}</p>
        <p className="write__hook-sub">{t('write.hookSub')}</p>

        <form className="write__form" onSubmit={submit}>
          <h2 id="write-heading" className="write__greeting">{t('write.greeting')}</h2>

          <div className="write__line">
            <label className="write__stem" htmlFor="write-ask">{t('write.stem')}</label>
            <input
              id="write-ask"
              ref={askRef}
              className="write__ask"
              value={ask}
              onChange={e => setAsk(e.target.value)}
              placeholder={t('write.placeholder')}
              autoComplete="off"
              maxLength={140}
            />
          </div>

          <ul className="write__prompts" role="list">
            {prompts.map(p => (
              <li key={p}>
                <button type="button" className="write__prompt" onClick={() => pick(p)}>
                  {p}
                </button>
              </li>
            ))}
          </ul>

          {/* The address field only appears once there is something to send,
              so the first thing anyone sees is a sentence, not a form. */}
          {(open || ask.trim()) && (
            <div className="write__from">
              <label htmlFor="write-from">{t('write.from')}</label>
              <input
                id="write-from"
                name="from"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('write.fromPlaceholder')}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="write__send"
            onFocus={() => setOpen(true)}
            disabled={busy}
          >
            {busy ? t('write.sending') : t('write.send')} &rarr;
          </button>
        </form>
      </div>
    </section>
  );
}
