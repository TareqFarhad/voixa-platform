'use client';

import { motion } from 'framer-motion';

interface AiOrbProps {
  size?: number;
  label?: string;
}

export function AiOrb({ size = 220, label }: AiOrbProps) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-champagne-glow"
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-champagne/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-12 rounded-full border border-white/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[34%] rounded-full bg-gradient-to-br from-champagne to-champagneDeep shadow-glow"
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {label && (
        <p className="mt-6 text-xs uppercase tracking-[0.32em] text-pearl/55">{label}</p>
      )}
    </div>
  );
}
