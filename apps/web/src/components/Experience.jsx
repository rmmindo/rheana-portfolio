import React, { useEffect, useRef, useState } from 'react';
import workData from '../content/work.json';

const THEMES = {
  'Iosys': 'theme-sunset-gold',
  'Luxe Lips': 'theme-sky-blue',
  'Offshorly': 'theme-field-green',
  'Baybayin Detector': 'theme-road-asphalt',
  '2 Weeks': 'theme-road-asphalt',
  'Azeus Systems': 'theme-field-green'
};

const NODES = [
  { x: 30, y: 15 },
  { x: 70, y: 30 },
  { x: 20, y: 45 },
  { x: 80, y: 60 },
  { x: 30, y: 75 },
  { x: 70, y: 90 }
];

const SVG_PATH = `
M 50,0 
L 50,7 
L 30,7 
L 30,22 
L 70,22 
L 70,37 
L 20,37 
L 20,52 
L 80,52 
L 80,67 
L 30,67 
L 30,82 
L 70,82 
L 70,95 
L 50,95 
L 50,100
`;

export default function Experience() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(10000);
  const [sparkPos, setSparkPos] = useState({ x: 50, y: 0 });
  
  const entries = workData.roles;

  useEffect(() => {
    if (pathRef.current && pathLength < 10000) {
      const point = pathRef.current.getPointAtLength(scrollProgress * pathLength);
      setSparkPos({ x: point.x, y: point.y });
    }
  }, [scrollProgress, pathLength]);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
      // Re-measure on resize
      const handleResize = () => setPathLength(pathRef.current.getTotalLength());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress across the 700vh container
      // rect.top is 0 when container top hits viewport top.
      // We want progress 0 -> 1 as we scroll through the (height - 100vh) distance.
      const scrollableDistance = rect.height - windowHeight;
      let progress = -rect.top / scrollableDistance;
      
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      setScrollProgress(progress);
      
      // Node activation logic
      // Progress goes 0 to 1.
      let currentActive = null;
      for (let i = 0; i < NODES.length; i++) {
        const nodeProgress = NODES[i].y / 100;
        // Node takes up a band of 8% of the scroll space
        if (progress >= nodeProgress - 0.04 && progress <= nodeProgress + 0.04) {
          currentActive = i;
        }
      }
      setActiveNode(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="experience-section" id="experience">
      <div 
        ref={containerRef} 
        className="scrolly-container"
      >
        <div className="scrolly-sticky-view">
          <svg 
            className="circuit-svg" 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            {/* Faint background track */}
            <path 
              d={SVG_PATH} 
              fill="none" 
              className="circuit-track" 
              vectorEffect="non-scaling-stroke" 
            />
            {/* Glowing electricity line - dynamically calculated length */}
            <path 
              ref={pathRef}
              d={SVG_PATH} 
              fill="none" 
              className="circuit-electricity" 
              vectorEffect="non-scaling-stroke" 
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength - (scrollProgress * pathLength)}
            />
          </svg>

          {/* Moving Spark Icon */}
          <div 
            className="circuit-spark-icon" 
            style={{ left: `${sparkPos.x}%`, top: `${sparkPos.y}%` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="var(--brand-powder, #00d2ff)" stroke="var(--brand-powder, #00d2ff)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
          </div>

          {/* Connection Dots */}
          {entries.map((exp, i) => {
            const themeClass = THEMES[exp.org] || 'theme-road-asphalt';
            const node = NODES[i];
            const isActive = i === activeNode;
            
            return (
              <div 
                key={`dot-${i}`} 
                className={`node-connection-dot ${themeClass} ${isActive ? 'is-active' : ''}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              ></div>
            );
          })}

          {/* Full-Screen Overlay Card */}
          <div className={`fullscreen-card-overlay ${activeNode !== null ? 'is-visible' : ''}`}>
            {activeNode !== null && (
              <div className={`soc-med-card ${THEMES[entries[activeNode].org] || 'theme-road-asphalt'}`}>
                <div className="card-header">
                  <div className="card-avatar">{entries[activeNode].org.charAt(0)}</div>
                  <div className="card-meta">
                    <strong>{entries[activeNode].org}</strong>
                    <span className="card-period">{entries[activeNode].period}</span>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-you"><strong>You:</strong> {entries[activeNode].you}</p>
                  <p className="card-me"><strong>Me:</strong> {entries[activeNode].me}</p>
                </div>
                <div className="card-figure">
                  <span className="figure-val">{entries[activeNode].figure.value}{entries[activeNode].figure.unit}</span>
                  <span className="figure-cap">{entries[activeNode].figure.caption}</span>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}


