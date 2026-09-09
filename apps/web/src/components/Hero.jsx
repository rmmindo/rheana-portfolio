import { useState, useEffect } from 'react';
import '../styles/components/_hero.scss';

const TelescopeIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12.39 6.22L6.16 12.45c-.32.32-.82.32-1.14 0l-1.9-1.9c-.32-.32-.32-.82 0-1.14l6.23-6.23c.32-.32.82-.32 1.14 0l1.9 1.9c.32.32.32.82 0 1.14z"/>
    <path d="M14.44 8.27l1.9-1.9c.32-.32.82-.32 1.14 0l3.8 3.8c.32.32.32.82 0 1.14l-1.9 1.9c-.32.32-.82.32-1.14 0l-3.8-3.8c-.32-.32-.32-.82 0-1.14z"/>
    <path d="M8.27 14.44l-4.5 4.5"/>
    <path d="M16.5 16.5l-4-4"/>
  </svg>
);

export default function Hero() {
  const precisionText = "engineered with precision";
  const baseDelay = 3;

  // Act III State Machine
  // 0: Loading, 1: Locked (Reading), 2: Flashlight Active, 3: Expanded
  const [phase, setPhase] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isPreparingFlashlight, setIsPreparingFlashlight] = useState(false);

  useEffect(() => {
    // Start phase 1 immediately on mount
    setPhase(1);
  }, []);

  useEffect(() => {
    if (phase < 3) {
      document.body.classList.add('is-locked');
      document.body.classList.remove('is-unlocked');
    } else if (phase === 3) {
      // Wait for the 1.4s circle snap animation before unlocking native scroll
      const unlockTimer = setTimeout(() => {
        document.body.classList.remove('is-locked');
        document.body.classList.add('is-unlocked');
      }, 1400);
      return () => {
        clearTimeout(unlockTimer);
        document.body.classList.remove('is-locked', 'is-unlocked');
      };
    }
    return () => {
      document.body.classList.remove('is-locked', 'is-unlocked');
    };
  }, [phase]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (phase === 2 && e.deltaY > 0) {
        setPhase(3);
      }
    };
    
    window.addEventListener('wheel', handleWheel);
    // Also support touch swipe up for mobile
    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      if (phase === 2) {
        const touchEndY = e.touches[0].clientY;
        if (touchStartY - touchEndY > 20) setPhase(3);
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [phase]);

  const handleMouseMove = (e) => {
    const xPercent = (e.clientX / window.innerWidth) * 100;
    const yPercent = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x: xPercent, y: yPercent });
  };

  const handleTelescopeClick = () => {
    if (isPreparingFlashlight) return;
    setIsPreparingFlashlight(true);
    
    // Wait 1.5 seconds before text starts disappearing
    setTimeout(() => {
      setHasMoved(true); // Triggers the text exit animation (1.8s)
      
      // Give it extra time (2.5s) so the disappearance is less abrupt before moving
      setTimeout(() => {
        setPhase(2); // Unlocks the circle mask to follow pointer
      }, 2500);
    }, 1500);
  };

  // --- LASER TIMELINE ALGORITHM ---
  const traceDuration = 0.5;      
  const charStagger = 0.1;       
  const pauseBeforePop = 0.0;     

  const charMetadata = [];
  const words = precisionText.split(' ');
  let currentTime = 0; 
  
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const wordLength = word.length;
    
    const wordCharDelays = [];
    for (let i = 0; i < wordLength; i++) {
      wordCharDelays.push(currentTime);
      currentTime += charStagger;
    }
    
    const cleanWord = word.replace(/[.,!?]+$/, ''); 
    const effectiveLength = cleanWord.length; 
    const lastCharStartTime = wordCharDelays[effectiveLength - 1] || wordCharDelays[0];
    const wordTraceEndTime = lastCharStartTime + traceDuration;
    const wordPopTime = wordTraceEndTime + pauseBeforePop;
    
    for (let i = 0; i < wordLength; i++) {
      charMetadata.push({
        char: word[i],
        traceDelay: wordCharDelays[i],
        popDelay: wordPopTime
      });
    }
    
    if (w < words.length - 1) {
      charMetadata.push({
        char: '\u00A0',
        traceDelay: currentTime, 
        popDelay: wordPopTime
      });
      currentTime += charStagger;
    }
  }

  return (
    <>
      <div 
        className={`circle-mask-layer scene-balloon phase-${phase}`} 
        onMouseMove={handleMouseMove}
        style={{
          '--x': phase >= 2 ? `${mousePos.x}%` : '50%',
          '--y': phase >= 2 ? `${mousePos.y}%` : '50%',
          zIndex: 1
        }}
      ></div>

      <div 
        className={`hero-wrapper phase-${phase} ${hasMoved ? 'has-moved' : ''}`}
        onMouseMove={handleMouseMove}
        style={{
          '--x': phase >= 2 ? `${mousePos.x}%` : '50%',
          '--y': phase >= 2 ? `${mousePos.y}%` : '50%',
          zIndex: 2,
          pointerEvents: phase === 2 ? 'none' : 'auto'
        }}
      >
        <button 
          className={`horizon-btn ${phase === 1 && !isPreparingFlashlight ? 'is-active' : ''}`} 
          onClick={handleTelescopeClick}
          aria-label="Snap flashlight to cursor"
        >
          <TelescopeIcon className="telescope-icon-animated" />
          <span>See what's beyond the horizon</span>
        </button>

        <div className={`ghost-copy ${phase === 3 ? 'is-active' : ''}`}>
          <div className="ghost-main">Welcome to the bigger picture.</div>
          <div className="ghost-sub">I'm Rheana, a fullstack AI Developer.</div>
        </div>
        
        <div className={`kinetic-node-container ${phase >= 2 ? 'is-active' : ''}`}>
          <div className="kinetic-node"></div>
          <span className="kinetic-text">SCROLL TO EXPLORE</span>
        </div>

        {phase < 2 && (
          <div className="hero-content hero-text-container">
            {/* VISION LINE */}
            <h1 className="hero-vision line-vision">
              Your product vision
            </h1>
            
            {/* PRECISION LINE */}
            <div className="hero-precision-container line-precision-container" style={{ marginTop: '0.5rem' }}>
              <div 
                className="line-precision-engraver" 
                style={{ width: '100%', height: '1.5em', display: 'flex', justifyContent: 'center' }}
              >
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  
                  {/* LAYER 1: LASER TRACE (Concept Solid) */}
                  <text 
                    x="50%" 
                    y="75%" 
                    textAnchor="middle" 
                    className="engraved-string laser-layer"
                  >
                    {charMetadata.map((meta, index) => (
                      <tspan 
                        key={`laser-${index}`} 
                        className="engraved-laser"
                        style={{ 
                          '--trace-delay': meta.traceDelay, 
                          '--pop-delay': meta.popDelay,
                          '--base-delay': `${baseDelay}s`
                        }}
                      >
                        {meta.char}
                      </tspan>
                    ))}
                  </text>

                  {/* LAYER 2: POP FILL (Concept) */}
                  <text 
                    x="50%" 
                    y="75%" 
                    textAnchor="middle" 
                    className="engraved-string pop-layer"
                  >
                    {charMetadata.map((meta, index) => (
                      <tspan 
                        key={`pop-${index}`} 
                        className="engraved-fill"
                        style={{ 
                          '--pop-delay': meta.popDelay,
                          '--base-delay': `${baseDelay}s`
                        }}
                      >
                        {meta.char}
                      </tspan>
                    ))}
                  </text>
                  
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


