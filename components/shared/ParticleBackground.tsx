"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulse: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particleCount = shouldReduceMotion ? 0 : isMobile ? 44 : 92;

    if (particleCount === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      size: Math.random() * 1.9 + 0.75,
      pulse: Math.random() * Math.PI * 2,
    }));

    const connectionLimit = isMobile ? 100 : 140;
    let tick = 0;

    const draw = () => {
      tick += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.014;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const breathing = 0.78 + Math.sin(p.pulse + tick) * 0.28;
        const currentSize = p.size * breathing;
        const pointAlpha = isMobile ? 0.52 : 0.62;

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(61, 129, 247, ${pointAlpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < connectionLimit) {
            const alpha = (1 - dist / connectionLimit) * (isMobile ? 0.17 : 0.22);
            ctx.strokeStyle = `rgba(61, 129, 247, ${alpha})`;
            ctx.lineWidth = isMobile ? 0.55 : 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-95" />;
}
