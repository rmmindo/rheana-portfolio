import { useState } from 'react';
import '../styles/components/_hero.scss';
import customFonts from '../custom-fonts-list.json';

export default function Hero() {
  const precisionText = "engineered with precision.";

  // Font cycling states
  // Start with the default font or index 0 if customFonts is not empty.
  // We'll leave index -1 to mean "use default CSS font".
  const [visionFontIdx, setVisionFontIdx] = useState(-1);
  const [precisionFontIdx, setPrecisionFontIdx] = useState(-1);

  const cycleVisionFont = (direction) => {
    setVisionFontIdx((prev) => {
      let next = prev + direction;
      if (next >= customFonts.length) return -1;
      if (next < -1) return customFonts.length - 1;
      return next;
    });
  };

  const cyclePrecisionFont = (direction) => {
    setPrecisionFontIdx((prev) => {
      let next = prev + direction;
      if (next >= customFonts.length) return -1;
      if (next < -1) return customFonts.length - 1;
      return next;
    });
  };

  // The actual font families to apply via style
  const visionFontFamily = visionFontIdx === -1 ? undefined : `"${customFonts[visionFontIdx]}"`;
  const precisionFontFamily = precisionFontIdx === -1 ? undefined : `"${customFonts[precisionFontIdx]}"`;

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
            
            {/* Layer 2: The solid letters that magnetically snap in */}
            <div className="precision-solid">
              {precisionText.split('').map((char, index) => (
                <span 
                  key={index} 
                  className="precision-char"
                  style={{ '--char-index': index, fontFamily: precisionFontFamily }}
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
          Vision Font: {visionFontIdx === -1 ? 'Default' : customFonts[visionFontIdx]} <br/>
          Precision Font: {precisionFontIdx === -1 ? 'Default' : customFonts[precisionFontIdx]}
        </div>
        
      </div>
    </div>
  );
}
