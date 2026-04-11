'use client';

interface RefinementSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function RefinementSlider({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: RefinementSliderProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.26em] text-pearl/70">{label}</span>
        <span className="text-[11px] text-champagne">{pct}</span>
      </div>
      {description && <p className="mt-1 text-[11px] text-pearl/45">{description}</p>}
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="voixa-range mt-3 w-full accent-champagne"
        style={{
          background: `linear-gradient(90deg, rgba(217,190,128,0.9) 0%, rgba(217,190,128,0.9) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
          height: 2,
        }}
      />
    </label>
  );
}
