import { useState, useRef, useEffect } from 'react';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const AutoGearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export default function ThemeCord() {
  const [theme, setTheme] = useState('light');
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [releaseY, setReleaseY] = useState(0);
  const startY = useRef(0);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setIsSnapping(false);
    startY.current = e.clientY - dragY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentY = e.clientY - startY.current;
    setDragY(Math.max(0, Math.min(currentY, 150)));
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (dragY > 100 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => cycleTheme(), 600); 
      setTimeout(() => setIsTransitioning(false), 1200); 
    }
    
    if (dragY > 0) {
      setReleaseY(dragY);
      setIsSnapping(true);
      setTimeout(() => setIsSnapping(false), 600);
    }
    
    setDragY(0);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const scale = (40 + dragY) / 40;

  return (
    <>
      <div 
        className={`theme-cord-wrapper ${isSnapping ? 'is-snapping' : ''}`} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: '4rem', 
          zIndex: 9000, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          '--release-y': `${releaseY}px`
        }}
      >
        <div 
          className="theme-cord-line" 
          style={{ 
            mixBlendMode: 'difference',
            transform: `scaleY(${scale})`
          }} 
        />
        
        <button 
          className="theme-cord-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            mixBlendMode: 'difference',
            color: 'black',
            border: 'none',
            padding: 0,
            touchAction: 'none',
            ...( !isSnapping ? { transform: `translateY(${dragY}px)` } : {} )
          }}
        >
          {theme === 'light' && <SunIcon />}
          {theme === 'dark' && <MoonIcon />}
          {theme === 'auto' && <AutoGearIcon />}
        </button>
      </div>

      {isTransitioning && <div className="theme-wipe"></div>}
    </>
  );
}
