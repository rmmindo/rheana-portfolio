import { useI18n } from '../hooks/useI18n.jsx';

export default function LangToggle() {
  const { locale, toggle, t } = useI18n();

  return (
    <button type="button" className="lang-toggle" onClick={toggle}>
      {/* The visible label is the language you are about to switch TO, written
          in that language. "Filipino" written in English helps nobody who is
          looking for Filipino. */}
      <span aria-hidden="true" className="lang-toggle__code">
        {locale === 'en' ? 'FIL' : 'EN'}
      </span>
      <span className="visually-hidden">{t('lang.switchTo')}</span>
    </button>
  );
}
