import { useEffect, useRef } from 'react';

export function StarField() {
  const starFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const starField = starFieldRef.current;
    if (!starField) return;

    const numStars = 200;
    
    // Clear existing stars
    starField.innerHTML = '';
    
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 3 + 's';
      starField.appendChild(star);
    }
  }, []);

  return <div ref={starFieldRef} className="star-field" />;
}
