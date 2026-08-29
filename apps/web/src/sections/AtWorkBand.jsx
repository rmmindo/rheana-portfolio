import { useI18n } from '../hooks/useI18n.jsx';
import { useReveal } from '../hooks/useReveal.js';

// A full-width photograph between the video and the experience list, to break
// up two long text sections. Decorative in layout terms but not in meaning, so
// it carries a real alt description rather than alt="".
export default function AtWorkBand() {
  const { t } = useI18n();
  const ref = useReveal();

  return (
    <figure className="band" ref={ref}>
      <img
        className="band__img"
        src="/img/rheana-mindo-developer-at-work-1800.webp"
        srcSet="/img/rheana-mindo-developer-at-work-1200.webp 1200w, /img/rheana-mindo-developer-at-work-1800.webp 1800w"
        sizes="100vw"
        alt={t('band.alt')}
        width="1800"
        height="1188"
        loading="lazy"
        decoding="async"
      />
      <figcaption className="band__caption">{t('band.caption')}</figcaption>
    </figure>
  );
}
