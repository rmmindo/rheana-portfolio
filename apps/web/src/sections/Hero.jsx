import { useRef, useState, useEffect } from 'react';
import { SpeakButton } from '../components/SpeechProvider.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

function TypingEffect() {
  const [text, setText] = useState('');
  const [highlight, setHighlight] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setText('self-learning');
      setHighlight(true);
      return;
    }

    let isCancelled = false;
    
    async function animate() {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const type = async (str, speed = 60) => {
        for (let i = 1; i <= str.length; i++) {
          if (isCancelled) return;
          setText(str.slice(0, i));
          await wait(speed);
        }
      };
      
      await wait(2800);
      await type('static');
      await wait(400);
      
      let current = 'static';
      for (let i = current.length; i >= 0; i--) {
        if (isCancelled) return;
        setText(current.slice(0, i));
        await wait(30);
      }
      
      await wait(100);
      await type('self-learning');
      if (isCancelled) return;
      setHighlight(true);
    }
    
    animate();
    return () => { isCancelled = true; };
  }, [reduced]);

  return (
    <span className={`hero__typing ${highlight ? 'is-highlighted' : ''}`}>
      {text}
      <span className="hero__cursor" aria-hidden="true">|</span>
    </span>
  );
}

export default function Hero({ profile }) {
  const introRef = useRef(null);
  const { t } = useI18n();

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__ambient" aria-hidden="true">
        <div className="hero__aurora hero__aurora--1" />
        <div className="hero__aurora hero__aurora--2" />
      </div>
      
      <div className="hero__inner" ref={introRef}>
        <h1 id="hero-heading" className="hero__line">
          Your product vision,<br />
          <span style={{ whiteSpace: 'nowrap' }}>engineered with precision.</span>
        </h1>

        <p className="hero__sub">
          Bring the concept and I'll write the clean, <span className="hero__wobble">robust</span>, and <TypingEffect /> code that brings it to life.
        </p>

        <div className="hero__actions">
          <form className="hero__prompt" onSubmit={e => e.preventDefault()}>
            <input 
              type="text" 
              className="hero__prompt-input" 
              placeholder="Hallo Rheana, build me a..." 
              aria-label="Ask the AI assistant a question"
            />
            <button type="submit" className="hero__prompt-submit" aria-label="Submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          {/* We keep the secondary CTA if desired, or just replace the primary.
              The prompt says "Replace the primary CTA button with an interactive AI text input field."
              So we removed the primary CTA, but can keep the SpeakButton here. */}
        </div>
      </div>
    </section>
  );
}
