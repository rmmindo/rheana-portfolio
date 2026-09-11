import React, { useEffect, useRef, useState } from 'react';
import workData from '../content/work.json';

// Define the routing and nodes
const ROUTES = {
  work: {
    id: 'work',
    label: 'Work Experience',
    startLabel: { x: 50, y: 5 },
    endLabel: { x: 75, y: 95 },
    path: "M 50,8 L 50,25 L 55,30 L 65,30 L 65,38 L 65,65 L 45,65 L 40,60 L 30,60 L 30,70 L 45,70 L 50,75 L 55,75 L 60,80 L 65,80 L 70,85 L 75,85 L 75,92",
    theme: 'theme-sky-blue',
    nodes: [
      { x: 50, y: 25 },
      { x: 65, y: 38 },
      { x: 30, y: 60 },
      { x: 55, y: 75 },
      { x: 65, y: 80 },
      { x: 75, y: 85 }
    ]
  },
  voluntary: {
    id: 'voluntary',
    label: 'Voluntary Experience',
    startLabel: { x: 85, y: 15 },
    endLabel: { x: 20, y: 95 },
    path: "M 85,20 L 85,25 L 75,25 L 70,30 L 65,30 L 65,25 L 55,15 L 45,15 L 40,20 L 35,20 L 30,25 L 30,35 L 25,40 L 25,60 L 20,65 L 20,75 L 25,80 L 40,80 L 45,85 L 50,85 L 55,90 L 40,90 L 35,85 L 25,85 L 20,90",
    theme: 'theme-sunset-gold',
    nodes: [
      { x: 45, y: 15 },
      { x: 30, y: 25 },
      { x: 25, y: 40 },
      { x: 20, y: 65 },
      { x: 25, y: 80 },
      { x: 50, y: 85 },
      { x: 35, y: 85 }
    ]
  },
  others: {
    id: 'others',
    label: 'Awards & Others',
    startLabel: { x: 80, y: 75 },
    endLabel: null,
    path: "M 75,75 L 65,75",
    theme: 'theme-road-asphalt',
    nodes: [
      { x: 65, y: 75 }
    ]
  }
};

const BG_PATHS = [
  "M 10,10 L 20,10 L 25,15 L 25,25 L 15,35 L 15,55 L 25,65",
  "M 90,10 L 90,40 L 80,50 L 80,60 L 90,70 L 90,85",
  "M 10,90 L 20,90 L 30,80 L 30,60 L 15,45"
];

export default function Experience() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  
  const [activeRoute, setActiveRoute] = useState('work');
  const [activeNodeIndex, setActiveNodeIndex] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(10000);
  const [sparkPos, setSparkPos] = useState({ x: 50, y: 8 });

  const entries = workData.roles;

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
      const handleResize = () => setPathLength(pathRef.current.getTotalLength());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
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
      
      const currentRouteConfig = ROUTES[activeRoute];
      if (!currentRouteConfig) return;

      let currentActiveNode = null;
      for (let i = 0; i < currentRouteConfig.nodes.length; i++) {
        const nodeY = currentRouteConfig.nodes[i].y / 100;
        if (progress >= nodeY - 0.04 && progress <= nodeY + 0.04) {
          currentActiveNode = i;
        }
      }
      setActiveNodeIndex(currentActiveNode);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeRoute]);

  useEffect(() => {
    if (pathRef.current && pathLength > 0 && pathLength < 10000) {
      const point = pathRef.current.getPointAtLength(scrollProgress * pathLength);
      setSparkPos({ x: point.x, y: point.y });
    }
  }, [scrollProgress, pathLength]);

  return (
    <section className="experience-section" id="experience">
      <div ref={containerRef} className="scrolly-container">
        <div className="scrolly-sticky-view">
          
          <svg className="circuit-svg pcb-board" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Center Box (Foundation) */}
            <rect x="42" y="42" width="16" height="16" className={`circuit-center-box ${activeRoute === 'foundation' ? 'is-active' : ''}`} onClick={() => setActiveRoute('foundation')} />
            <circle cx="50" cy="50" r="1.5" className="circuit-center-dot" />

            {/* Background Decorative Paths */}
            {BG_PATHS.map((d, i) => (
              <path key={`bg-${i}`} d={d} className="circuit-bg-track" vectorEffect="non-scaling-stroke" />
            ))}

            {/* Interactive Routes */}
            {Object.values(ROUTES).map(route => {
              const isActive = activeRoute === route.id;
              return (
                <g key={route.id} className={`route-group ${isActive ? 'is-active' : 'is-blurry'}`}>
                  {/* Faint Background Track */}
                  <path 
                    d={route.path} 
                    className="circuit-track" 
                    vectorEffect="non-scaling-stroke" 
                    onClick={() => setActiveRoute(route.id)}
                  />
                  
                  {/* Active glowing trace */}
                  {isActive && (
                    <path 
                      ref={pathRef}
                      d={route.path} 
                      className={`circuit-electricity ${route.theme}`} 
                      vectorEffect="non-scaling-stroke" 
                      strokeDasharray={pathLength}
                      strokeDashoffset={pathLength - (scrollProgress * pathLength)}
                    />
                  )}
                  
                  {/* Nodes */}
                  {route.nodes.map((n, i) => (
                    <circle 
                      key={`node-${i}`} 
                      cx={n.x} 
                      cy={n.y} 
                      r={isActive && activeNodeIndex === i ? 2.5 : 1.5} 
                      className={`circuit-node ${route.theme} ${isActive && activeNodeIndex === i ? 'is-active' : ''}`} 
                      onClick={() => setActiveRoute(route.id)}
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Route Labels (Start/End points) */}
          {Object.values(ROUTES).map(route => (
            <div key={`labels-${route.id}`} className={`route-labels ${activeRoute === route.id ? 'is-active' : 'is-blurry'}`}>
              <div 
                className="route-start-label" 
                style={{ left: `${route.startLabel.x}%`, top: `${route.startLabel.y}%` }}
                onClick={() => setActiveRoute(route.id)}
              >
                <div className="label-dot"></div>
                <span>Start of {route.label}</span>
              </div>
              {route.endLabel && (
                <div 
                  className="route-end-label" 
                  style={{ left: `${route.endLabel.x}%`, top: `${route.endLabel.y}%` }}
                  onClick={() => setActiveRoute(route.id)}
                >
                  <div className="label-dot"></div>
                  <span>End of {route.label}</span>
                </div>
              )}
            </div>
          ))}

          {/* Central Foundation Label */}
          <div className={`route-labels ${activeRoute === 'foundation' ? 'is-active' : 'is-blurry'}`}>
            <div className="route-start-label" style={{ left: '50%', top: '42%' }} onClick={() => setActiveRoute('foundation')}>
              <span>Foundation (Education)</span>
            </div>
          </div>

          {/* Moving Spark Icon (Only when a route is active, not foundation) */}
          {activeRoute !== 'foundation' && (
            <div 
              className={`circuit-spark-icon ${ROUTES[activeRoute]?.theme}`} 
              style={{ left: `${sparkPos.x}%`, top: `${sparkPos.y}%` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            </div>
          )}

          {/* Full-Screen Overlay Card */}
          <div className={`fullscreen-card-overlay ${activeNodeIndex !== null || activeRoute === 'foundation' ? 'is-visible' : ''}`}>
            {activeRoute === 'work' && activeNodeIndex !== null && entries[activeNodeIndex] && (
              <div className="soc-med-card theme-sky-blue">
                <div className="card-header">
                  <div className="card-avatar">{entries[activeNodeIndex].org.charAt(0)}</div>
                  <div className="card-meta">
                    <strong>{entries[activeNodeIndex].org}</strong>
                    <span className="card-period">{entries[activeNodeIndex].period}</span>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-you"><strong>You:</strong> {entries[activeNodeIndex].you}</p>
                  <p className="card-me"><strong>Me:</strong> {entries[activeNodeIndex].me}</p>
                </div>
                <div className="card-figure">
                  <span className="figure-val">{entries[activeNodeIndex].figure.value}{entries[activeNodeIndex].figure.unit}</span>
                  <span className="figure-cap">{entries[activeNodeIndex].figure.caption}</span>
                </div>
              </div>
            )}
            
            {activeRoute === 'foundation' && (
              <div className="soc-med-card theme-road-asphalt">
                <div className="card-header">
                  <div className="card-avatar">E</div>
                  <div className="card-meta">
                    <strong>Education & Foundation</strong>
                    <span className="card-period">Lifelong</span>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-me">Core engineering principles and continuous learning.</p>
                </div>
              </div>
            )}
            
            {(activeRoute === 'voluntary' || activeRoute === 'others') && activeNodeIndex !== null && (
              <div className={`soc-med-card ${ROUTES[activeRoute].theme}`}>
                <div className="card-header">
                  <div className="card-avatar">M</div>
                  <div className="card-meta">
                    <strong>Milestone</strong>
                    <span className="card-period">Experience</span>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-me">Details coming soon.</p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
