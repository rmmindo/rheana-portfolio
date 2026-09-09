import { useEffect, useState } from 'react';

export default function VisitorCount() {
  const [count, setCount] = useState(null);
  
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

  if (!code || count === null) return null;

  return (
    <div className="visitor-count is-active">
      Visitors: {count}
    </div>
  );
}
