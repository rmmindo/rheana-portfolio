import { useState } from 'react';
import '../styles/components/_hero.scss';

const visionFonts = [
  "MarseilleFreeRegular-MAXEB",
  "MarseilleFreeRegular-rvKW8",
  "SimpleMinimalist-3lV3z"
];

const precisionFonts = [
  "Blueprinted-Gr6y",
  "Concept-JLd7",
  "ConceptSolid-Gmwm",
  "Drafting-RyyV"
];

export default function Hero() {
  const precisionText = "engineered with precision.";

  const [visionFontIdx, setVisionFontIdx] = useState(-1);
  const [precisionFontIdx, setPrecisionFontIdx] = useState(-1);
  const [hasCycledPrecision, setHasCycledPrecision] = useState(false);

  const [vWeight, setVWeight] = useState(700);
  const [vStyle, setVStyle] = useState('normal');
  const [vSize, setVSize] = useState(1.0);

  const [pWeight, setPWeight] = useState(500);
  const [pStyle, setPStyle] = useState('normal');
  const [pSize, setPSize] = useState(1.0);

  const cycleVisionFont = (direction) => {
    setVisionFontIdx((prev) => {
      let next = prev + direction;
      if (next >= visionFonts.length) return -1;
      if (next < -1) return visionFonts.length - 1;
      return next;
    });
  };

  const cyclePrecisionFont = (direction) => {
    setHasCycledPrecision(true);
    setPrecisionFontIdx((prev) => {
      let next = prev + direction;
      if (next >= precisionFonts.length) return -1;
      if (next < -1) return precisionFonts.length - 1;
      return next;
    });
  };

  const visionFontFamily = visionFontIdx === -1 ? undefined : `"${visionFonts[visionFontIdx]}"`;
  const precisionFontFamily = precisionFontIdx === -1 ? undefined : `"${precisionFonts[precisionFontIdx]}"`;
  const baseDelay = hasCycledPrecision ? 0 : 3;

  // --- LASER TIMELINE ALGORITHM ---
  const traceDuration = 0.8;      
  const charStagger = 0.15;       
  const pauseBeforePop = 0.1;     // Near-instant pop after word finishes

  const charMetadata = [];
  const words = precisionText.split(' ');
  let currentTime = 0; // Continuous counter for unbroken tracing
  
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
    
    // Treat space as just another character for continuous continuous laser tracing
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
      <div className="hero-wrapper">
        <div className="hero-content">
          
          {/* VISION LINE */}
          <div className="font-cycler-row">
            <button className="font-nav-btn" onClick={() => cycleVisionFont(-1)}>&#8592;</button>
            <h1 
              className="hero-vision" 
              style={{ 
                fontFamily: visionFontFamily,
                fontWeight: vWeight,
                fontStyle: vStyle,
                fontSize: `clamp(${2 * vSize}rem, ${5 * vSize}vw, ${4 * vSize}rem)`
              }}
            >
              Your product vision
            </h1>
            <button className="font-nav-btn" onClick={() => cycleVisionFont(1)}>&#8594;</button>
          </div>
          
          {/* PRECISION LINE */}
          <div className="font-cycler-row" style={{ marginTop: '0.5rem' }}>
            <button className="font-nav-btn" onClick={() => cyclePrecisionFont(-1)}>&#8592;</button>
            
            <div className="hero-precision-container">
              <div 
                className="line-precision-engraver" 
                key={precisionFontIdx}
                style={{ width: '100%', height: '1.5em', display: 'flex', justifyContent: 'center' }}
              >
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  <text 
                    x="50%" 
                    y="75%" 
                    textAnchor="middle" 
                    className="engraved-string"
                    style={{ 
                      fontFamily: precisionFontFamily,
                      fontWeight: pWeight,
                      fontStyle: pStyle,
                      fontSize: `clamp(${2 * pSize}rem, ${5 * pSize}vw, ${4 * pSize}rem)`
                    }}
                  >
                    {charMetadata.map((meta, index) => (
                      <tspan 
                        key={index} 
                        className="engraved-char"
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
                </svg>
              </div>
            </div>

            <button className="font-nav-btn" onClick={() => cyclePrecisionFont(1)}>&#8594;</button>
          </div>

          <div className="font-debugger">
            Vision Font: {visionFontIdx === -1 ? 'Default' : visionFonts[visionFontIdx]} <br/>
            Precision Font: {precisionFontIdx === -1 ? 'Default' : precisionFonts[precisionFontIdx]}
          </div>
          
        </div>
      </div>

      <div className="typography-overlay-panel">
        <div className="panel-section">
          <strong>Vision</strong>
          <div className="panel-row">
            Weight ({vWeight}): 
            <button onClick={() => setVWeight(Math.max(100, vWeight - 100))}>&#8592;</button>
            <button onClick={() => setVWeight(Math.min(900, vWeight + 100))}>&#8594;</button>
          </div>
          <div className="panel-row">
            Style ({vStyle}): 
            <button onClick={() => setVStyle(vStyle === 'normal' ? 'italic' : 'normal')}>&#8644;</button>
          </div>
          <div className="panel-row">
            Size ({(vSize * 100).toFixed(0)}%): 
            <button onClick={() => setVSize(Math.max(0.2, vSize - 0.1))}>&#8592;</button>
            <button onClick={() => setVSize(Math.min(3.0, vSize + 0.1))}>&#8594;</button>
          </div>
        </div>

        <div className="panel-section">
          <strong>Precision</strong>
          <div className="panel-row">
            Weight ({pWeight}): 
            <button onClick={() => setPWeight(Math.max(100, pWeight - 100))}>&#8592;</button>
            <button onClick={() => setPWeight(Math.min(900, pWeight + 100))}>&#8594;</button>
          </div>
          <div className="panel-row">
            Style ({pStyle}): 
            <button onClick={() => setPStyle(pStyle === 'normal' ? 'italic' : 'normal')}>&#8644;</button>
          </div>
          <div className="panel-row">
            Size ({(pSize * 100).toFixed(0)}%): 
            <button onClick={() => setPSize(Math.max(0.2, pSize - 0.1))}>&#8592;</button>
            <button onClick={() => setPSize(Math.min(3.0, pSize + 0.1))}>&#8594;</button>
          </div>
        </div>
      </div>
    </>
  );
}
