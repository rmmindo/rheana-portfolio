import { useState, useEffect } from 'react';
import '../styles/components/_hero.scss';

const TelescopeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-telescope ${className}`} style={{ flexShrink: 0 }}>
    <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/>
    <path d="m13.56 11.747 4.332-.924"/>
    <path d="m16 21-3.105-6.21"/>
    <path d="M16.485 5.338a2 2 0 0 1 2.406-1.328l1.379.37a2 2 0 0 1 1.488 2.411l-.31 1.242a2 2 0 0 1-2.405 1.328l-1.379-.37a2 2 0 0 1-1.488-2.41l.31-1.243z"/>
    <path d="m6.158 8.933-2.33 1.166"/>
    <path d="m8 13.5-2 6.5"/>
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
  const [isSnapping, setIsSnapping] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Start phase 1 immediately on mount
    setPhase(1);

    const triggerButton = () => {
      setTimeout(() => setShowButton(true), 9000);
    };

    if (document.documentElement.classList.contains('has-unlocked')) {
      triggerButton();
    } else {
      window.addEventListener('visionGateUnlocked', triggerButton);
      return () => window.removeEventListener('visionGateUnlocked', triggerButton);
    }
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
    
    // Wait 400ms for button to quickly fade out before starting text disappearance
    setTimeout(() => {
      setHasMoved(true); // Triggers the text exit animation (3.0s slide, 3.0s fade)
      
      // 1. At 0.75s (a quarter through the 3s slide), start moving the circle
      setTimeout(() => {
        setIsSnapping(true); // Engages the 2.25s glide
      }, 750);

      // 2. At 3.0s, the text hits 0 opacity and the 2.25s glide finishes.
      // They conclude at the exact same millisecond.
      setTimeout(() => {
        setPhase(2); 
        setIsSnapping(false);
      }, 3000);

    }, 400);
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
        className={`circle-mask-layer scene-balloon phase-${phase} ${isSnapping ? 'is-snapping-to-pointer' : ''}`} 
        onMouseMove={handleMouseMove}
        style={{
          '--x': (isSnapping || phase >= 2) ? `${mousePos.x}%` : '50%',
          '--y': (isSnapping || phase >= 2) ? `${mousePos.y}%` : '50%',
          zIndex: 1
        }}
      ></div>

      <div 
        className={`hero-wrapper phase-${phase} ${hasMoved ? 'has-moved' : ''}`}
        onMouseMove={handleMouseMove}
        style={{
          '--x': (isSnapping || phase >= 2) ? `${mousePos.x}%` : '50%',
          '--y': (isSnapping || phase >= 2) ? `${mousePos.y}%` : '50%',
          zIndex: 2,
          pointerEvents: phase === 2 ? 'none' : 'auto'
        }}
      >
        <button 
          className={`horizon-btn ${showButton && phase === 1 && !isPreparingFlashlight ? 'is-active' : ''}`} 
          onClick={handleTelescopeClick}
          aria-label="Snap flashlight to cursor"
        >
          <TelescopeIcon className="telescope-icon-animated" />
          <span>See what's beyond the horizon</span>
        </button>

        <div className={`ghost-copy ${phase === 3 ? 'is-active' : ''}`}>
          <div className="ghost-main">Welcome to the bigger picture.</div>
          <div className="ghost-sub">I'm Rheana, a Full-Stack AI Developer.</div>
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


