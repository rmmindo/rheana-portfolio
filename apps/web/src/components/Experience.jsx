import React, { useEffect, useRef, useState } from 'react';
import resumeData from '../content/resume.json';

const THEMES = {
  'Iosys Ltd': 'theme-sunset-gold',
  'Luxe Lips Pty Ltd': 'theme-sky-blue',
  'Offshorly Ltd': 'theme-field-green',
  'Baybayin Detector': 'theme-road-asphalt',
  '2 Weeks': 'theme-road-asphalt',
  'Azeus Systems Philippines Limited': 'theme-field-green'
};

export default function Experience() {
  const containerRef = useRef(null);
  const [activeNode, setActiveNode] = useState(0);
  const [isMacroView, setIsMacroView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const entries = resumeData.sections.find(s => s.id === 'experience').entries;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      let progress = (-rect.top + windowHeight * 0.5) / (rect.height);
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      setScrollProgress(progress);
      
      // Activate macro view near the end of the scroll
      if (progress > 0.95) {
        setIsMacroView(true);
      } else {
        setIsMacroView(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMacroView) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'), 10);
          setActiveNode(index);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });

    const nodes = document.querySelectorAll('.circuit-node-card');
    nodes.forEach(node => observer.observe(node));

    return () => observer.disconnect();
  }, [isMacroView]);

  return (
    <section className="experience-section" id="experience">
      <div 
        ref={containerRef} 
        className={`circuit-timeline-wrapper ${isMacroView ? 'is-macro-view' : ''}`}
      >
        <div className="circuit-trace-bg"></div>
        <div className="circuit-trace-line" style={{ height: `${scrollProgress * 100}%` }}></div>
        
        {entries.map((exp, i) => {
          const themeClass = THEMES[exp.org] || 'theme-road-asphalt';
          const isActive = isMacroView ? i === activeNode : i === activeNode;
          
          return (
            <div 
              key={i} 
              data-index={i}
              className={`circuit-node-card ${themeClass} ${isActive ? 'is-active' : ''}`}
              onClick={() => isMacroView && setActiveNode(i)}
            >
              <div className="node-connection-dot"></div>
              <span className="node-date">
                [ {exp.dates.replace(' – ', ' - ').toUpperCase()} ]
              </span>
              <h3 className="node-title">{exp.title}</h3>
              <h4 className="node-org">{exp.org}</h4>
              
              <div className="node-details">
                {exp.bullets && exp.bullets.map((b, idx) => (
                  <p key={idx}><strong>{b.lead}</strong> <span dangerouslySetInnerHTML={{__html: b.text}} /></p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
