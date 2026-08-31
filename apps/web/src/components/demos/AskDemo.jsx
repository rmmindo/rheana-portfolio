import { useCallback, useId, useMemo, useRef, useState } from 'react';
import handbook from '../../content/handbook.json';
import { passages, keywordSearch, vectorSearch } from '../../lib/passages.js';
import { loadPipeline, EMBED_MODEL } from '../../lib/models.js';
import { useI18n } from '../../hooks/useI18n.jsx';

// Two search boxes over the same document, so the difference is not a claim.
//
// This is the Azeus chatbot with the answering removed and the retrieval left
// in, which is the half that decides whether the thing works. A new hire asks
// "how do I book time off". The handbook says "annual leave is requested
// through the staff portal". Those sentences share no word at all, so keyword
// search returns an empty page and the new hire goes and asks a person, which
// is the workflow the project existed to replace.
//
// Drop in your own file and the comparison is about your documents rather than
// mine. It never leaves the tab: the model is fetched to the browser and the
// text is embedded here. Open the network panel and check.
//
// The 23 MB is behind a press. Someone scrolling past pays nothing.

const SAMPLE_QUESTIONS = [
  'how do I book time off',
  'can I buy a new laptop',
  'what happens if I break the build',
  'do I have to be online at nine',
];

const MAX_BYTES = 200000;

export default function AskDemo() {
  const { t } = useI18n();
  const id = useId();
  const fileRef = useRef(null);

  const [doc, setDoc] = useState({ title: handbook.title, text: handbook.text });
  const [query, setQuery] = useState(SAMPLE_QUESTIONS[0]);
  const [state, setState] = useState('idle'); // idle, loading, ready, failed
  const [progress, setProgress] = useState(0);
  const [vectors, setVectors] = useState(null);
  const [queryVector, setQueryVector] = useState(null);
  const [error, setError] = useState('');

  const list = useMemo(() => passages(doc.text), [doc.text]);
  const keyword = useMemo(() => keywordSearch(list, query), [list, query]);
  const meaning = useMemo(
    () => vectorSearch(list, vectors ?? [], queryVector),
    [list, vectors, queryVector]
  );

  const embed = useCallback(async (extractor, texts) => {
    const out = await extractor(texts, { pooling: 'mean', normalize: true });
    return out.tolist();
  }, []);

  // Loading the model and embedding the document are one action from the
  // visitor's side, so they are one function and one button.
  const run = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const extractor = await loadPipeline('feature-extraction', EMBED_MODEL, setProgress);
      const docVectors = await embed(extractor, list);
      const [qv] = await embed(extractor, [query]);
      setVectors(docVectors);
      setQueryVector(qv);
      setState('ready');
    } catch (err) {
      // A blocked CDN, an offline phone, a browser without WebAssembly. The
      // keyword column keeps working, so the playground degrades to half of
      // itself rather than to a broken box.
      setState('failed');
      setError(String(err && err.message ? err.message : err));
    }
  }, [embed, list, query]);

  // Once the model is in memory, a new question is one embedding away.
  const ask = useCallback(async next => {
    setQuery(next);
    if (state !== 'ready') return;
    try {
      const extractor = await loadPipeline('feature-extraction', EMBED_MODEL);
      const [qv] = await embed(extractor, [next]);
      setQueryVector(qv);
    } catch {
      setState('failed');
    }
  }, [embed, state]);

  const onFile = useCallback(async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(t('ask.tooBig'));
      return;
    }
    const text = await file.text();
    setDoc({ title: file.name, text });
    // The old vectors describe the old document. Keeping them would rank this
    // document's passages by another document's meaning.
    setVectors(null);
    setQueryVector(null);
    setState('idle');
    setError('');
  }, [t]);

  const reset = useCallback(() => {
    setDoc({ title: handbook.title, text: handbook.text });
    setVectors(null);
    setQueryVector(null);
    setState('idle');
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  return (
    <div className="ask">
      <div className="ask__doc">
        <p className="ask__docname">
          {doc.title}
          <span className="ask__docmeta"> &middot; {list.length} {t('ask.passages')}</span>
        </p>
        <div className="ask__docactions">
          <label className="btn btn--ghost btn--sm" htmlFor={`${id}-file`}>{t('ask.upload')}</label>
          <input
            ref={fileRef}
            id={`${id}-file`}
            className="visually-hidden"
            type="file"
            accept=".txt,.md,.csv,.json,text/plain"
            onChange={onFile}
          />
          {doc.title !== handbook.title && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
              {t('ask.useSample')}
            </button>
          )}
        </div>
        <p className="ask__privacy">{t('ask.privacy')}</p>
      </div>

      <div className="ask__q">
        <label className="demo__label" htmlFor={`${id}-q`}>{t('ask.label')}</label>
        <input
          id={`${id}-q`}
          className="ask__input"
          type="text"
          value={query}
          onChange={e => ask(e.target.value)}
          autoComplete="off"
        />
        <ul className="ask__presets" role="list">
          {SAMPLE_QUESTIONS.map(q => (
            <li key={q}>
              <button
                type="button"
                className={`demo__preset${q === query ? ' is-on' : ''}`}
                onClick={() => ask(q)}
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ask__cols">
        <section className="ask__col" aria-labelledby={`${id}-kw`}>
          <h4 id={`${id}-kw`} className="ask__coltitle">{t('ask.keyword')}</h4>
          {keyword.length === 0 ? (
            <p className="ask__empty">{t('ask.nothing')}</p>
          ) : (
            <ol className="ask__hits">
              {keyword.map(h => (
                <li key={h.i}>
                  <span className="ask__score">{Math.round(h.score * 100)}%</span>
                  <span className="ask__text">{h.text}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="ask__col ask__col--meaning" aria-labelledby={`${id}-mn`}>
          <h4 id={`${id}-mn`} className="ask__coltitle">{t('ask.meaning')}</h4>

          {state === 'idle' && (
            <div className="ask__gate">
              <button type="button" className="btn btn--primary btn--sm" onClick={run}>
                {t('ask.run')}
              </button>
              <p className="ask__gatenote">{t('ask.weight')}</p>
            </div>
          )}

          {state === 'loading' && (
            <p className="ask__loading" aria-live="polite">
              {t('ask.loading')} {progress}%
              <span className="ask__bar"><span style={{ width: `${progress}%` }} /></span>
            </p>
          )}

          {state === 'failed' && (
            <p className="ask__empty">
              {t('ask.failed')}
              <span className="ask__err">{error}</span>
            </p>
          )}

          {state === 'ready' && (
            <ol className="ask__hits">
              {meaning.map(h => (
                <li key={h.i}>
                  <span className="ask__score">{h.score.toFixed(2)}</span>
                  <span className="ask__text">{h.text}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <p className="demo__note">{t('ask.note')}</p>
    </div>
  );
}
