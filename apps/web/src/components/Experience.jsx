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

// Complex zig-zag path string covering all nodes
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
  const [activeNode, setActiveNode] = useState(null);
  const [isMacroView, setIsMacroView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const entries = workData.roles;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // We want progress to be 0 when the top of the container hits the middle of the screen
      // and 1 when the bottom of the container hits the middle of the screen.
      let progress = (-rect.top + windowHeight * 0.5) / rect.height;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      setScrollProgress(progress);
      
      if (progress > 0.95) {
        setIsMacroView(true);
        setActiveNode(null);
      } else {
        setIsMacroView(false);
        // Determine active node based on progress (electricity tip)
        // A node is active if progress is slightly past its Y coordinate
        let currentActive = null;
        for (let i = 0; i < NODES.length; i++) {
          const nodeProgress = NODES[i].y / 100;
          if (progress >= nodeProgress - 0.05 && progress <= nodeProgress + 0.1) {
            currentActive = i;
          }
        }
        setActiveNode(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="experience-section" id="experience">
      <div 
        ref={containerRef} 
        className={`circuit-timeline-wrapper ${isMacroView ? 'is-macro-view' : ''}`}
      >
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
          {/* Glowing electricity line */}
          <path 
            d={SVG_PATH} 
            fill="none" 
            className="circuit-electricity" 
            vectorEffect="non-scaling-stroke" 
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - (scrollProgress * 100)}
          />
        </svg>

        {entries.map((exp, i) => {
          const themeClass = THEMES[exp.org] || 'theme-road-asphalt';
          const node = NODES[i];
          const isActive = isMacroView ? false : i === activeNode;
          
          return (
            <div 
              key={i} 
              className={`circuit-node-wrapper ${themeClass} ${isActive ? 'is-active' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => isMacroView && setActiveNode(i)}
            >
              <div className="node-connection-dot"></div>
              
              <div className="soc-med-card">
                <div className="card-header">
                  <div className="card-avatar">{exp.org.charAt(0)}</div>
                  <div className="card-meta">
                    <strong>{exp.org}</strong>
                    <span className="card-period">{exp.period}</span>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-you"><strong>You:</strong> {exp.you}</p>
                  <p className="card-me"><strong>Me:</strong> {exp.me}</p>
                </div>
                <div className="card-figure">
                  <span className="figure-val">{exp.figure.value}{exp.figure.unit}</span>
                  <span className="figure-cap">{exp.figure.caption}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


