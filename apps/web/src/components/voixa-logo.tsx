import type { SVGProps } from 'react';

export function VoixaLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 220 48" className={className} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="voixa-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F5E6BD" />
          <stop offset="55%" stopColor="#D9BE80" />
          <stop offset="100%" stopColor="#B89A5A" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <circle cx="22" cy="24" r="14" stroke="url(#voixa-gold)" strokeWidth="1.4" />
        <circle cx="22" cy="24" r="6" fill="url(#voixa-gold)" opacity="0.9" />
        <path
          d="M6 24 Q12 16 22 24 T38 24"
          stroke="url(#voixa-gold)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <text
        x="52"
        y="32"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="28"
        fill="#F5F3EE"
        letterSpacing="3"
      >
        VOIXA
      </text>
    </svg>
  );
}
