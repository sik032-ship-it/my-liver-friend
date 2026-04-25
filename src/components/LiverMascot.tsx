interface LiverMascotProps {
  mood?: "happy" | "proud" | "starry";
  size?: number;
  className?: string;
}

// Cute asymmetric coral liver — right lobe larger, left smaller
export const LiverMascot = ({ mood = "happy", size = 180, className = "" }: LiverMascotProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="간 마스코트"
    >
      <defs>
        <radialGradient id="liverBody" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="hsl(6 90% 78%)" />
          <stop offset="60%" stopColor="hsl(6 80% 69%)" />
          <stop offset="100%" stopColor="hsl(6 70% 58%)" />
        </radialGradient>
        <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(335 100% 80% / 0.95)" />
          <stop offset="100%" stopColor="hsl(335 100% 75% / 0)" />
        </radialGradient>
        <radialGradient id="eyeShine" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="hsl(220 40% 12%)" />
        </radialGradient>
      </defs>

      {/* Body — asymmetric blob, right lobe bigger */}
      <path
        d="M 30 95
           C 28 60, 60 38, 95 42
           C 120 30, 165 40, 178 78
           C 188 108, 175 150, 140 162
           C 115 170, 85 168, 60 158
           C 35 148, 22 122, 30 95 Z"
        fill="url(#liverBody)"
      />

      {/* Lobe separation hint */}
      <path
        d="M 78 58 C 84 90, 80 120, 70 150"
        stroke="hsl(6 60% 52% / 0.35)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Cheeks */}
      <ellipse cx="62" cy="118" rx="14" ry="9" fill="url(#cheek)" />
      <ellipse cx="142" cy="118" rx="16" ry="10" fill="url(#cheek)" />

      {/* Eyes */}
      {mood === "happy" && (
        <>
          <circle cx="82" cy="98" r="9" fill="url(#eyeShine)" />
          <circle cx="132" cy="96" r="10" fill="url(#eyeShine)" />
          <circle cx="79" cy="95" r="3" fill="white" />
          <circle cx="129" cy="93" r="3.4" fill="white" />
          <circle cx="86" cy="101" r="1.4" fill="white" />
          <circle cx="136" cy="100" r="1.6" fill="white" />
        </>
      )}
      {mood === "proud" && (
        <>
          <path d="M 73 100 Q 82 92, 91 100" stroke="hsl(220 30% 18%)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 123 100 Q 132 92, 141 100" stroke="hsl(220 30% 18%)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      )}
      {mood === "starry" && (
        <>
          {[
            { cx: 82, cy: 98, r: 11 },
            { cx: 132, cy: 96, r: 12 },
          ].map((e, i) => (
            <g key={i}>
              <path
                d={`M ${e.cx} ${e.cy - e.r}
                    L ${e.cx + e.r * 0.3} ${e.cy - e.r * 0.3}
                    L ${e.cx + e.r} ${e.cy}
                    L ${e.cx + e.r * 0.3} ${e.cy + e.r * 0.3}
                    L ${e.cx} ${e.cy + e.r}
                    L ${e.cx - e.r * 0.3} ${e.cy + e.r * 0.3}
                    L ${e.cx - e.r} ${e.cy}
                    L ${e.cx - e.r * 0.3} ${e.cy - e.r * 0.3} Z`}
                fill="hsl(41 100% 60%)"
                stroke="hsl(36 90% 40%)"
                strokeWidth="1.5"
              />
              <circle cx={e.cx - 3} cy={e.cy - 3} r="2" fill="white" />
            </g>
          ))}
        </>
      )}

      {/* Smile */}
      <path
        d="M 92 130 Q 107 142, 122 130"
        stroke="hsl(6 60% 35%)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
