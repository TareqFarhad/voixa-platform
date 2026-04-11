'use client';

import { useEffect, useRef, useState } from 'react';
import { Waveform } from './waveform';

interface AudioPlayerProps {
  src: string;
  label?: string;
  tone?: 'raw' | 'enhanced';
}

export function AudioPlayer({ src, label, tone = 'enhanced' }: AudioPlayerProps) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime / (audio.duration || 1));
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const accent = tone === 'enhanced' ? 'border-champagne/40' : 'border-white/10';
  const badge = tone === 'enhanced' ? 'text-champagne' : 'text-pearl/60';

  return (
    <div className={`voixa-card flex flex-col gap-4 p-5 ${accent}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] uppercase tracking-[0.3em] ${badge}`}>{label}</span>
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/40 text-champagne transition hover:bg-champagne/20"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
      <div className="h-16 overflow-hidden rounded-2xl bg-black/30 px-2 py-2">
        <Waveform bars={52} seed={tone === 'enhanced' ? 11 : 4} intensity={playing ? 1 : 0.7} />
      </div>
      <div className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-champagne/80 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <audio ref={ref} src={src} preload="metadata" className="hidden" />
    </div>
  );
}
