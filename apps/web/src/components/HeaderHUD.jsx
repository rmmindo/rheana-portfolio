import { useState, useRef, useEffect } from "react";


export default function HeaderHUD() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadCV = () => {
    window.open("/cv.pdf", "_blank");
    setIsMenuOpen(false);
  };

  const handleReplay = () => {
    window.location.reload();
  };

  const handleSkip = () => {
    window.dispatchEvent(new Event("skipIntro"));
    setIsMenuOpen(false);
  };

  return (
    <header className="top-left-hud brand-anchor" ref={menuRef}>
      <div className="hydrangea-container" onClick={toggleMenu} role="button" tabIndex={0}>
        <img 
          src="/petal.webp" 
          alt="Hydrangea Logo" 
          className={`hydrangea-petal ${isMenuOpen ? "is-active" : ""}`} 
        />
      </div>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span className="brand-name">Rheana Mindo</span>
      </a>

      {isMenuOpen && (
        <div className="three-petal-menu">
          <button className="petal-btn" onClick={handleDownloadCV} aria-label="Download Resume">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Resume</span>
          </button>
          
          <button className="petal-btn" onClick={handleReplay} aria-label="Replay Sequence">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span>Replay</span>
          </button>
          
          <button className="petal-btn" onClick={handleSkip} aria-label="Skip Intro">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"/>
              <line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
            <span>Skip</span>
          </button>
        </div>
      )}
    </header>
  );
}
