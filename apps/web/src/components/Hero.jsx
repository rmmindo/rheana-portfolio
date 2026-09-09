import '../styles/components/_hero.scss';

export default function Hero() {
  const precisionText = "engineered with precision.";
  const baseDelay = 3;

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
    
    // Calculate when this specific word finishes tracing
    const lastCharStartTime = wordCharDelays[wordLength - 1];
    const wordTraceEndTime = lastCharStartTime + traceDuration;
    const wordPopTime = wordTraceEndTime + pauseBeforePop;
    
    for (let i = 0; i < wordLength; i++) {
      charMetadata.push({
        char: word[i],
        traceDelay: wordCharDelays[i],
        popDelay: wordPopTime
      });
    }
    
    // Treat space as just another character
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
    <div className="hero-wrapper">
      <div className="hero-content">
        
        {/* VISION LINE */}
        <h1 className="hero-vision">
          Your product vision
        </h1>
        
        {/* PRECISION LINE */}
        <div className="hero-precision-container" style={{ marginTop: '0.5rem' }}>
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
    </div>
  );
}
