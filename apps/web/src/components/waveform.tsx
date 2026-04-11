'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface WaveformProps {
  bars?: number;
  seed?: number;
  intensity?: number;
  className?: string;
  animate?: boolean;
}

function hash(seed: number, i: number) {
  const x = Math.sin(seed * 999 + i * 73.1) * 10000;
  return x - Math.floor(x);
}

export function Waveform({
  bars = 48,
  seed = 7,
  intensity = 1,
  className = '',
  animate = true,
}: WaveformProps) {
  const heights = useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => {
        const base = hash(seed, i);
        const pulse = Math.sin(i / 4 + seed) * 0.15;
        return Math.max(0.1, Math.min(1, base * 0.8 + 0.2 + pulse)) * intensity;
      }),
    [bars, seed, intensity],
  );

  return (
    <div className={`flex h-full w-full items-center justify-center gap-[3px] ${className}`}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="voixa-waveform-bar"
          style={{ height: `${h * 100}%` }}
          animate={
            animate
              ? {
                  scaleY: [h, h * 1.35, h * 0.75, h],
                  opacity: [0.55, 1, 0.65, 0.55],
                }
              : undefined
          }
          transition={{
            duration: 2.4 + (i % 5) * 0.15,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: (i % 9) * 0.04,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
