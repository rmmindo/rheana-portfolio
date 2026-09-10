import React from 'react';

export default function LegalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-card, #1A0B2E)',
          color: 'var(--text, #FFF)',
          padding: '40px',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>Privacy & Terms</h2>
        
        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--brand-powder, #00d2ff)' }}>1. Data Collection & Privacy</h3>
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          This portfolio is a static website. <strong>We do not collect, store, or process any personal data.</strong> There are no contact forms, user accounts, or newsletters. Because no personal information is collected, the provisions of the Philippine Data Privacy Act of 2012 (RA 10173) regarding data processing consent are not triggered.
        </p>

        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--brand-powder, #00d2ff)' }}>2. Cookies & Tracking</h3>
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          <strong>This site sets zero cookies.</strong> We use GoatCounter for basic pageview analytics, which is an open-source, privacy-friendly analytics platform. It does not use cookies, does not track users across websites, and does not store personal data. Therefore, no cookie consent banner is required under GDPR or local laws.
        </p>

        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--brand-powder, #00d2ff)' }}>3. Third-Party Embeds</h3>
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          There are no third-party widgets (e.g., YouTube, Google Maps, Facebook Pixels) embedded on this site that could silently track you.
        </p>

        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--brand-powder, #00d2ff)' }}>4. Copyright & IP</h3>
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          All source code, design elements, and original landscape imagery (hot air balloon assets) belong to Rheana Mindo unless otherwise stated. 
        </p>

        <button 
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'var(--brand-powder, #00d2ff)',
            color: '#1A0B2E',
            border: 'none',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}
