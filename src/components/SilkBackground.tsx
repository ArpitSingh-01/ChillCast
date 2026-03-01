import { useEffect, useRef } from 'react';

const SilkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get theme colors from CSS variables
    const getThemeColors = () => {
      const root = document.documentElement;
      const primary = getComputedStyle(root).getPropertyValue('--primary').trim();
      const secondary = getComputedStyle(root).getPropertyValue('--secondary').trim();
      const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
      
      return {
        primary: `hsla(${primary}, 0.1)`,
        secondary: `hsla(${secondary}, 0.08)`,
        accent: `hsla(${accent}, 0.06)`,
      };
    };

    let colors = getThemeColors();

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      colors = getThemeColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    // Silk wave animation
    let time = 0;
    const waves: Array<{
      amplitude: number;
      frequency: number;
      phase: number;
      speed: number;
      colorKey: 'primary' | 'secondary' | 'accent';
    }> = [
        { amplitude: 100, frequency: 0.002, phase: 0, speed: 0.02, colorKey: 'primary' },
        { amplitude: 80, frequency: 0.003, phase: Math.PI / 2, speed: 0.015, colorKey: 'secondary' },
        { amplitude: 120, frequency: 0.0015, phase: Math.PI, speed: 0.025, colorKey: 'accent' },
      ];

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        ctx.fillStyle = colors[wave.colorKey];
        ctx.fill();
      });

      time += 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="galaxy-bg" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen', zIndex: 0 }}
      />
    </>
  );
};

export default SilkBackground;
