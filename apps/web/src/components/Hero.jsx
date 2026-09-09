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

  return (
    <div className="hero-wrapper">
      <div className="hero-content">
        
        {/* VISION LINE */}
        <div className="font-cycler-row">
          <button 
            className="font-nav-btn" 
            onClick={() => cycleVisionFont(-1)}
            aria-label="Previous font for vision"
          >
            &#8592;
          </button>
          
          <h1 className="hero-vision" style={{ fontFamily: visionFontFamily }}>
            Your product vision
          </h1>

          <button 
            className="font-nav-btn" 
            onClick={() => cycleVisionFont(1)}
            aria-label="Next font for vision"
          >
            &#8594;
          </button>
        </div>
        
        {/* PRECISION LINE */}
        <div className="font-cycler-row" style={{ marginTop: '0.5rem' }}>
          <button 
            className="font-nav-btn" 
            onClick={() => cyclePrecisionFont(-1)}
            aria-label="Previous font for precision"
          >
            &#8592;
          </button>
          
          <div className="hero-precision-container" style={{ fontFamily: precisionFontFamily }}>
            {/* Layer 1: The stationary wireframe/blueprint outline */}
            <div className="precision-outline" aria-hidden="true" style={{ fontFamily: precisionFontFamily }}>
              {precisionText}
            </div>
            
            {/* Layer 2: The solid letters that magnetically snap in.
                Using key={precisionFontIdx} forces React to unmount and remount this block
                when the font changes, instantly re-triggering the CSS animation! */}
            <div className="precision-solid" key={precisionFontIdx}>
              {precisionText.split('').map((char, index) => (
                <span 
                  key={index} 
                  className="precision-char"
                  style={{ 
                    '--char-index': index, 
                    '--base-delay': `${baseDelay}s`,
                    fontFamily: precisionFontFamily 
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          </div>

          <button 
            className="font-nav-btn" 
            onClick={() => cyclePrecisionFont(1)}
            aria-label="Next font for precision"
          >
            &#8594;
          </button>
        </div>

        {/* Display Current Fonts (Optional helper) */}
        <div className="font-debugger">
          Vision Font: {visionFontIdx === -1 ? 'Default' : visionFonts[visionFontIdx]} <br/>
          Precision Font: {precisionFontIdx === -1 ? 'Default' : precisionFonts[precisionFontIdx]}
        </div>
        
      </div>
    </div>
  );
}
