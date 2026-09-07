import '../styles/components/_hero.scss';

export default function Hero() {
  const precisionText = "engineered with precision.";

  return (
    <div className="hero-wrapper">
      <div className="hero-content">
        <h1 className="hero-vision">Your product vision</h1>
        
        <div className="hero-precision-container">
          {/* Layer 1: The stationary wireframe/blueprint outline */}
          <div className="precision-outline" aria-hidden="true">
            {precisionText}
          </div>
          
          {/* Layer 2: The solid letters that magnetically snap in */}
          <div className="precision-solid">
            {precisionText.split('').map((char, index) => (
              <span 
                key={index} 
                className="precision-char"
                style={{ '--char-index': index }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
