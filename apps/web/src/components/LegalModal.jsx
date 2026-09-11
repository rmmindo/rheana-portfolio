import React from 'react';

export default function LegalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="modern-popup legal-specific" onClick={e => e.stopPropagation()}>
        <div className="modern-popup-top">
          <svg className="modern-popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          <h2 className="modern-popup-title">Privacy & Terms</h2>
        </div>
        
        <div className="modern-popup-bottom legal-scroll-area">
          <div className="legal-text-content">
            <h3 className="legal-section-title">1. Data Collection & Privacy</h3>
            <p className="legal-text">
              This portfolio is a static website. <strong>We do not collect, store, or process any personal data.</strong> There are no contact forms, user accounts, or newsletters. Because no personal information is collected, the provisions of the Philippine Data Privacy Act of 2012 (RA 10173) regarding data processing consent are not triggered.
            </p>

            <h3 className="legal-section-title">2. Cookies & Tracking</h3>
            <p className="legal-text">
              <strong>This site sets zero cookies.</strong> We use GoatCounter for basic pageview analytics, which is an open-source, privacy-friendly analytics platform. It does not use cookies, does not track users across websites, and does not store personal data. Therefore, no cookie consent banner is required under GDPR or local laws.
            </p>

            <h3 className="legal-section-title">3. Third-Party Embeds</h3>
            <p className="legal-text">
              There are no third-party widgets (e.g., YouTube, Google Maps, Facebook Pixels) embedded on this site that could silently track you.
            </p>

            <h3 className="legal-section-title">4. Copyright & IP</h3>
            <p className="legal-text">
              All source code, design elements, and original landscape imagery (hot air balloon assets) belong to Rheana Mindo unless otherwise stated. 
            </p>
          </div>

          <button className="modern-popup-primary-btn" onClick={onClose}>
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
