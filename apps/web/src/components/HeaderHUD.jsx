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
        <svg 
          className={`hydrangea-petal ${isMenuOpen ? "is-active" : ""}`} 
          viewBox="0 0 24 24"
        >
          {/* Abstract botanical petal path */}
          <path d="M12 22C12 22 4 16 4 9C4 5 7 2 12 2C17 2 20 5 20 9C20 16 12 22 12 22Z" />
        </svg>
      </div>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span className="brand-name">Rheana Mindo</span>
      </a>

      {isMenuOpen && (
        <div className="utility-dropdown">
          <button onClick={handleDownloadCV}>[ Download CV ]</button>
          <button onClick={handleReplay}>[ Replay Sequence ]</button>
          <button onClick={handleSkip}>[ Skip Intro ]</button>
        </div>
      )}
    </header>
  );
}
