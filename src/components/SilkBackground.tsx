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

    // Silk wave animation
    let time = 0;
    const waves: Array<{
      amplitude: number;
      frequency: number;
      phase: number;
      speed: number;
      color: string;
    }> = [
      { amplitude: 100, frequency: 0.002, phase: 0, speed: 0.02, color: 'rgba(147, 51, 234, 0.1)' },
      { amplitude: 80, frequency: 0.003, phase: Math.PI / 2, speed: 0.015, color: 'rgba(168, 85, 247, 0.08)' },
      { amplitude: 120, frequency: 0.0015, phase: Math.PI, speed: 0.025, color: 'rgba(192, 132, 252, 0.06)' },
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

        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      time += 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </>
  );
};

export default SilkBackground;
