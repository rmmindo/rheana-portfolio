import { useState, useRef, useEffect } from 'react';

export default function ThemeCord() {
  const [theme, setTheme] = useState('light');
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    setDragY(0);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <div
        className={`theme-cord ${!isDragging ? 'theme-cord--snap' : ''}`}
        style={{ transform: `translateY(${dragY}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="theme-cord__line"></div>
        <div className="theme-cord__handle"></div>
      </div>

      {isTransitioning && <div className="theme-wipe"></div>}
    </>
  );
}
