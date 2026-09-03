import { useEffect, useState } from 'react';
import '../styles/components/_hero.scss';

export default function Hero() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkUnlocked = () => {
      if (document.documentElement.classList.contains('has-unlocked')) {
        setIsActive(true);
      }
    };
    checkUnlocked();

    const observer = new MutationObserver(checkUnlocked);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <main className={`hero-text-container ${isActive ? 'is-active' : ''}`}>
      <span className="line-vision">Your product vision,</span>
      <div className="line-precision-wrapper">
        <span className="line-precision">engineered with precision.</span>
        <div className="blueprint-grid"></div>
      </div>
    </main>
  );
}
