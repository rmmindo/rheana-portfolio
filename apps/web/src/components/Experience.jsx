import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import resumeData from '../content/resume.json';

const PCBCanvas = lazy(() => import('./PCBCanvas'));

const workEntries = resumeData.sections.find(s => s.id === 'experience')?.entries || [];
const volEntries = resumeData.sections.find(s => s.id === 'volunteering')?.entries || [];
const projEntries = resumeData.sections.find(s => s.id === 'projects')?.entries || [];

export default function Experience() {
  const containerRef = useRef(null);
  
  const [activeRoute, setActiveRoute] = useState('work');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeRoute]);

  return (
    <section className="experience-section" id="experience" style={{ position: 'relative', background: '#0b0f19' }}>
      <div ref={containerRef} style={{ height: '400vh', width: '100%' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
          
          {isMounted && (
            <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#080c14' }} />}>
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
          <div style={{ position: 'absolute', top: 30, left: 30, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['work', 'voluntary', 'awards', 'foundation'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveRoute(cat)}
                style={{
                  padding: '10px 20px',
                  background: activeRoute === cat ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                  color: activeRoute === cat ? '#fff' : '#888',
                  border: `1px solid ${activeRoute === cat ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  textAlign: 'left',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s',
                  fontWeight: activeRoute === cat ? 'bold' : 'normal'
                }}
              >
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


