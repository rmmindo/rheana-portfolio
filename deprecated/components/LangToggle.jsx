import { useI18n } from '../hooks/useI18n.jsx';

export default function LangToggle() {
  const { toggle, t } = useI18n();

  return (
    <button type="button" className="lang-toggle topbar-icon-btn" onClick={toggle} title={t('lang.switchTo')}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span className="visually-hidden">{t('lang.switchTo')}</span>
    </button>
  );
}
