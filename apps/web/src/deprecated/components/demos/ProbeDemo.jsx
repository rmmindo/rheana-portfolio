import { useCallback, useId, useMemo, useState } from 'react';
import { SENTENCES, PAIRS, sentenceFor, compare, divergence, readPredictions } from '../../lib/probe.js';
import { withPipeline, MASK_MODEL } from '../../lib/models.js';
import { useI18n } from '../../hooks/useI18n.jsx';

// The thesis, running.
//
// Take a sentence with one word hidden. Ask the model what the hidden word is.
// Change one thing about the person in the sentence and ask again. If the model
// held no view about that person, the answers would not move.
//
// They move. That is the whole finding, and it is much more convincing watched
// than described, because the numbers are the model's own and they appear while
// you wait.
//
// This is the Rapid Religious Bias Probe from Rheana's undergraduate thesis
// with the group term changed from religion to a pronoun. The method is
// identical: mask, substitute, compare the distributions. DistilBERT is one of
// the five models the thesis evaluated.
//
// The model is 68 MB and loads only on a press. It runs in the browser, so
// nothing typed here is sent anywhere.

const TOP = 10;

const pct = p => (p * 100).toFixed(1) + '%';

export default function ProbeDemo() {
  const { t } = useI18n();
  const id = useId();

  const [template, setTemplate] = useState(SENTENCES[0]);
  const [pair, setPair] = useState(PAIRS[0]);
  const [state, setState] = useState('idle'); // idle, loading, running, ready, failed
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = useCallback(async (nextTemplate = template, nextPair = pair) => {
    setState(s => (s === 'ready' || s === 'running' ? 'running' : 'loading'));
    setError('');
    try {
      const next = await withPipeline('fill-mask', MASK_MODEL, async unmask => {
        setState('running');
        // The mask token belongs to the tokeniser, not to us. Reading it off
        // the pipeline means this keeps working if the model is ever swapped.
        const mask = unmask.tokenizer.mask_token ?? '[MASK]';
        const sentenceA = sentenceFor(nextTemplate, nextPair.a, mask);
        const sentenceB = sentenceFor(nextTemplate, nextPair.b, mask);
        // One after the other, never Promise.all. See withPipeline.
        const rawA = await unmask(sentenceA, { top_k: TOP });
        const rawB = await unmask(sentenceB, { top_k: TOP });
        return {
          a: readPredictions(rawA, TOP),
          b: readPredictions(rawB, TOP),
          sentenceA,
          sentenceB,
          pair: nextPair,
        };
      }, setProgress);
      setResult(next);
      setState('ready');
    } catch (err) {
      setState('failed');
      setError(String(err && err.message ? err.message : err));
    }
  }, [pair, template]);

  const choose = useCallback((nextTemplate, nextPair) => {
    setTemplate(nextTemplate);
    setPair(nextPair);
    // Only re-run if the model is already here. Otherwise changing the sentence
    // would start a 68 MB download nobody asked for.
    if (state === 'ready' || state === 'running') run(nextTemplate, nextPair);
  }, [run, state]);

  const rows = useMemo(() => (result ? compare(result.a, result.b).slice(0, 12) : []), [result]);
  const gap = useMemo(() => (result ? divergence(result.a, result.b) : 0), [result]);

  return (
    <div className="probe">
      <div className="probe__controls">
        <fieldset className="probe__set">
          <legend className="demo__label">{t('probe.sentence')}</legend>
          <ul className="probe__opts" role="list">
            {SENTENCES.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`demo__preset${s.id === template.id ? ' is-on' : ''}`}
                  onClick={() => choose(s, pair)}
                >
                  {sentenceFor(s, '___', '___')}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="probe__set">
          <legend className="demo__label">{t('probe.swap')}</legend>
          <ul className="probe__opts" role="list">
            {PAIRS.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`demo__preset${p.id === pair.id ? ' is-on' : ''}`}
                  onClick={() => choose(template, p)}
                >
                  {p.a} / {p.b}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>

      {state === 'idle' && (
        <div className="probe__gate">
          <button type="button" className="btn btn--primary btn--sm" onClick={() => run()}>
            {t('probe.run')}
          </button>
          <p className="probe__gatenote">{t('probe.weight')}</p>
        </div>
      )}

      {(state === 'loading' || state === 'running') && (
        <p className="probe__loading" aria-live="polite">
          {state === 'loading' ? `${t('probe.loading')} ${progress}%` : t('probe.thinking')}
          <span className="probe__bar">
            <span style={{ width: state === 'loading' ? `${progress}%` : '100%' }} />
          </span>
        </p>
      )}

      {state === 'failed' && (
        <p className="probe__failed">
          {t('probe.failed')}
          <span className="probe__err">{error}</span>
        </p>
      )}

      {result && (state === 'ready' || state === 'running') && (
        <>
          <p className="probe__verdict" aria-live="polite">
            <strong className="probe__gap">{pct(gap)}</strong> {t('probe.verdict')}
          </p>

          <div className="probe__cols">
            {[
              { subject: result.pair.a, sentence: result.sentenceA, list: result.a },
              { subject: result.pair.b, sentence: result.sentenceB, list: result.b },
            ].map(side => (
              <section className="probe__col" key={side.subject} aria-label={side.sentence}>
                <h4 className="probe__coltitle">
                  <code>{side.sentence}</code>
                </h4>
                <ol className="probe__list">
                  {side.list.map(r => (
                    <li key={r.token}>
                      <span className="probe__token">{r.token}</span>
                      <span className="probe__p">{pct(r.p)}</span>
                      <span className="probe__meter" aria-hidden="true">
                        <span style={{ width: `${Math.min(100, r.p * 100 * 3)}%` }} />
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          <table className="probe__diff">
            <caption>{t('probe.diffCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('probe.word')}</th>
                <th scope="col">{result.pair.a}</th>
                <th scope="col">{result.pair.b}</th>
                <th scope="col">{t('probe.gapCol')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.token} className={r.gap > 0 ? 'is-a' : 'is-b'}>
                  <th scope="row">{r.token}</th>
                  <td>{r.a === 0 ? '-' : pct(r.a)}</td>
                  <td>{r.b === 0 ? '-' : pct(r.b)}</td>
                  <td>{(r.gap > 0 ? '+' : '') + pct(r.gap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className="demo__note">{t('probe.note')}</p>
    </div>
  );
}
