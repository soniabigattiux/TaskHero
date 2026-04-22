import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Props {
  active: boolean;
}

export function Confetti({ active }: Props) {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#34d399', '#fbbf24', '#f87171', '#818cf8', '#a78bfa', '#60a5fa'];
      const newPieces = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        // Random spread
        x: (Math.random() - 0.5) * window.innerWidth,
        y: (Math.random() - 0.5) * window.innerHeight - 100,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'square',
      }));
      setPieces(newPieces);
    } else {
      setPieces([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{ 
            x: p.x, 
            y: p.y + 200, // Fall down slightly after bursting
            scale: p.scale, 
            rotate: p.rotation + 720,
            opacity: 0
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className={`absolute w-4 h-4 ${p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
