import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import resumeData from '../content/resume.json';

const PCBCanvas = lazy(() => import('./PCBCanvas'));

const workEntries = resumeData.sections.find(s => s.id === 'experience')?.entries || [];
const volEntries = resumeData.sections.find(s => s.id === 'volunteering')?.entries || [];
const projEntries = resumeData.sections.find(s => s.id === 'projects')?.entries || [];

export default function Experience() {
  const containerRef = useRef(null);
  
  const [activeRoute, setActiveRoute] = useState(null);
  const activeRouteRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    activeRouteRef.current = activeRoute;
  }, [activeRoute]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const scrollableDistance = rect.height - windowHeight;
      let progress = -rect.top / scrollableDistance;
      
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      setScrollProgress(progress);

      if (progress >= 0.15 && !activeRouteRef.current) {
        setActiveRoute('work');
      }
      
      // Phase A Zoom
      const balloon = document.querySelector('.scene-balloon');
      if (balloon) {
        if (progress < 0.1) {
          // Scale from 1 to 5, fade out opacity from 1 to 0 over the 0-0.1 progress
          const zoomProgress = progress / 0.1;
          const scale = 1 + zoomProgress * 4; 
          const opacity = 1 - zoomProgress;
          balloon.style.transform = `scale(${scale})`;
          // Focus slightly towards bottom center where the burner might be
          balloon.style.transformOrigin = `50% 70%`;
          balloon.style.opacity = Math.max(0, opacity);
          balloon.style.zIndex = '';
        } else {
          balloon.style.opacity = 0;
          balloon.style.zIndex = '';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeRoute]);

  return (
    <section className="experience-section" id="experience" style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ height: '400vh', width: '100%' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
          
          {isMounted && (
            <Suspense fallback={<div style={{ width: '100%', height: '100%' }} />}>
              <PCBCanvas 
                activeCategory={activeRoute}
                setActiveCategory={setActiveRoute}
                scrollProgress={scrollProgress}
                workData={workEntries}
                volData={volEntries}
                projData={projEntries}
              />
            </Suspense>
          )}
          
          {/* Category Switcher UI */}
          <div className="story-choice-container" style={{ opacity: scrollProgress > 0.15 ? 1 : 0, transition: 'opacity 0.5s', pointerEvents: scrollProgress > 0.15 ? 'auto' : 'none' }}>
            {['work', 'voluntary', 'awards', 'foundation'].map(cat => (
              <button 
                key={cat} 
                className={`story-choice-btn ${activeRoute === cat ? 'is-active' : ''}`}
                onClick={() => setActiveRoute(cat)}
              >
                <span className="choice-indicator"></span>
                {cat === 'work' ? 'Work Experience' : 
                 cat === 'voluntary' ? 'Voluntary Experience' : 
                 cat === 'awards' ? 'Awards & Projects' : 'Foundation Core'}
              </button>
            ))}
          </div>

          {/* Scroll instruction */}
          <div style={{
            position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
            color: '#aaa', fontSize: '14px', pointerEvents: 'none',
            opacity: scrollProgress > 0.1 ? 0 : 1, transition: 'opacity 0.5s'
          }}>
            Scroll down to explore circuit
          </div>
        </div>
      </div>
    </section>
  );
}


