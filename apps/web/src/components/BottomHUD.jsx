import { useEffect, useState } from 'react';

export default function BottomHUD() {
  const [count, setCount] = useState("...");
  
  const code = import.meta.env.VITE_GOATCOUNTER || 'rheanamindo';

  useEffect(() => {
    if (!code) return;

    fetch('https://' + code + '.goatcounter.com/counter//.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.count) {
          const formatted = parseInt(data.count, 10).toLocaleString();
          setCount(formatted);
        }
      })
      .catch(err => console.error('Failed to fetch visitor count:', err));
  }, [code]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Section ${id} not found.`);
    }
  };

  return (
    <>
      <div className="bottom-left-hud">
        <button className="nav-node" onClick={() => scrollToSection('experience')}>
          <span className="node-number">01</span> Experience
        </button>
        <button className="nav-node" onClick={() => scrollToSection('playground')}>
          <span className="node-number">02</span> Playground
        </button>
      </div>

      <div className="bottom-right-hud">
        <div className="telemetry-item">
          <span className="status-dot"></span> Visitors: <span id="visitor-count">{count}</span>
        </div>
        <div className="social-tokens">
          <a href="https://github.com/rmmindo" target="_blank" rel="noopener noreferrer" title="GitHub">[gh]</a>
          <a href="https://gitlab.com/" target="_blank" rel="noopener noreferrer" title="GitLab">[gl]</a>
          <a href="https://linkedin.com/in/rheanamindo/" target="_blank" rel="noopener noreferrer" title="LinkedIn">[in]</a>
          <a href="mailto:contact@rheanamindo.com" title="Work Email">[mail]</a>
        </div>
      </div>
    </>
  );
}
