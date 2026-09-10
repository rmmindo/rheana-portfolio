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
        <div className="utility-dropdown">
          <button onClick={handleDownloadCV}>[ Download CV ]</button>
          <button onClick={handleReplay}>[ Replay Sequence ]</button>
          <button onClick={handleSkip}>[ Skip Intro ]</button>
        </div>
      )}
    </header>
  );
}
