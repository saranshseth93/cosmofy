import { useEffect, useRef } from 'react';

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  trail: { x: number; y: number; opacity: number }[];
}

export function AnimatedAsteroids() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const asteroidsRef = useRef<Asteroid[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize asteroids
    const initializeAsteroids = () => {
      asteroidsRef.current = [];
      for (let i = 0; i < 8; i++) {
        createAsteroid();
      }
    };

    const createAsteroid = () => {
      const side = Math.random();
      let x, y, angle;

      if (side < 0.25) {
        // From top
        x = Math.random() * canvas.width;
        y = -50;
        angle = Math.PI / 4 + Math.random() * Math.PI / 2;
      } else if (side < 0.5) {
        // From right
        x = canvas.width + 50;
        y = Math.random() * canvas.height;
        angle = Math.PI / 2 + Math.random() * Math.PI / 2;
      } else if (side < 0.75) {
        // From left
        x = -50;
        y = Math.random() * canvas.height;
        angle = -Math.PI / 4 + Math.random() * Math.PI / 2;
      } else {
        // From top-left corner (more dramatic)
        x = -50;
        y = -50;
        angle = Math.PI / 6 + Math.random() * Math.PI / 3;
      }

      const asteroid: Asteroid = {
        x,
        y,
        size: 3 + Math.random() * 8,
        speed: 1 + Math.random() * 3,
        angle,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 0.3 + Math.random() * 0.4,
        trail: []
      };

      asteroidsRef.current.push(asteroid);
    };

    const drawAsteroid = (asteroid: Asteroid) => {
      ctx.save();
      
      // Draw trail
      asteroid.trail.forEach((point, index) => {
        const trailOpacity = point.opacity * (index / asteroid.trail.length) * 0.3;
        ctx.fillStyle = `rgba(139, 69, 19, ${trailOpacity})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, asteroid.size * 0.3 * (index / asteroid.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw asteroid
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      
      // Create gradient for 3D effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.size);
      gradient.addColorStop(0, `rgba(160, 82, 45, ${asteroid.opacity})`);
      gradient.addColorStop(0.7, `rgba(139, 69, 19, ${asteroid.opacity})`);
      gradient.addColorStop(1, `rgba(101, 67, 33, ${asteroid.opacity})`);
      
      ctx.fillStyle = gradient;
      
      // Draw irregular asteroid shape
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = asteroid.size * (0.8 + Math.random() * 0.4);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // Add some surface details
      ctx.fillStyle = `rgba(101, 67, 33, ${asteroid.opacity * 0.7})`;
      for (let i = 0; i < 3; i++) {
        const detailX = (Math.random() - 0.5) * asteroid.size;
        const detailY = (Math.random() - 0.5) * asteroid.size;
        const detailSize = asteroid.size * 0.1;
        
        ctx.beginPath();
        ctx.arc(detailX, detailY, detailSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    };

    const updateAsteroid = (asteroid: Asteroid) => {
      // Update position
      asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
      asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;
      
      // Update rotation
      asteroid.rotation += asteroid.rotationSpeed;
      
      // Update trail
      asteroid.trail.push({ 
        x: asteroid.x, 
        y: asteroid.y, 
        opacity: asteroid.opacity 
      });
      
      if (asteroid.trail.length > 20) {
        asteroid.trail.shift();
      }
      
      // Update trail opacity
      asteroid.trail.forEach((point, index) => {
        point.opacity *= 0.95;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw asteroids
      asteroidsRef.current.forEach((asteroid, index) => {
        updateAsteroid(asteroid);
        drawAsteroid(asteroid);
        
        // Remove asteroids that are off screen
        if (asteroid.x > canvas.width + 100 || 
            asteroid.y > canvas.height + 100 || 
            asteroid.x < -100 || 
            asteroid.y < -100) {
          asteroidsRef.current.splice(index, 1);
        }
      });
      
      // Add new asteroids periodically
      if (Math.random() < 0.01 && asteroidsRef.current.length < 12) {
        createAsteroid();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    initializeAsteroids();
    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        mixBlendMode: 'screen'
      }}
    />
  );
}