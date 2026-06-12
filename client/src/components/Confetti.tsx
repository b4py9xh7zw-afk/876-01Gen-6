import { useState, useEffect } from 'react';

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    color: string;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#fbbf24', '#f472b6', '#60a5fa', '#4ade80', '#a78bfa', '#fb923c'];
      const newParticles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 10,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
