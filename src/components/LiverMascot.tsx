import type { HealthStage } from "@/lib/sobriety";

interface LiverMascotProps {
  mood?: "happy" | "proud" | "starry";
  size?: number;
  className?: string;
  stage?: HealthStage;
}

// Cute asymmetric coral liver — right lobe larger, left smaller
export const LiverMascot = ({
  mood = "happy",
  size = 180,
  className = "",
  stage = "vibrant",
}: LiverMascotProps) => {
  // Body color tuning per stage
  const palette: Record<HealthStage, { c1: string; c2: string; c3: string; cheekOpacity: number }> = {
    pale:       { c1: "hsl(10 35% 86%)", c2: "hsl(8 30% 78%)",  c3: "hsl(8 28% 68%)",  cheekOpacity: 0.35 },
    recovering: { c1: "hsl(8 60% 82%)",  c2: "hsl(7 55% 73%)",  c3: "hsl(6 55% 62%)",  cheekOpacity: 0.65 },
    vibrant:    { c1: "hsl(6 90% 78%)",  c2: "hsl(6 80% 69%)",  c3: "hsl(6 70% 58%)",  cheekOpacity: 1 },
    sparkle:    { c1: "hsl(6 95% 80%)",  c2: "hsl(6 85% 70%)",  c3: "hsl(6 75% 60%)",  cheekOpacity: 1 },
    halo:       { c1: "hsl(8 100% 82%)", c2: "hsl(6 92% 72%)",  c3: "hsl(6 80% 60%)",  cheekOpacity: 1 },
  };
  const p = palette[stage];

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Halo ring */}
      {stage === "halo" && (
        <div
          className="absolute inset-0 rounded-full animate-pulse-soft"
          style={{
            background: "radial-gradient(circle, hsl(41 100% 70% / 0.55) 0%, transparent 60%)",
            filter: "blur(8px)",
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`relative ${className}`}
        aria-label="간 마스코트"
      >
        <defs>
          <radialGradient id={`liverBody-${stage}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={p.c1} />
            <stop offset="60%" stopColor={p.c2} />
            <stop offset="100%" stopColor={p.c3} />
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

        <path
          d="M 30 95 C 28 60, 60 38, 95 42 C 120 30, 165 40, 178 78 C 188 108, 175 150, 140 162 C 115 170, 85 168, 60 158 C 35 148, 22 122, 30 95 Z"
          fill={`url(#liverBody-${stage})`}
        />

        <path
          d="M 78 58 C 84 90, 80 120, 70 150"
          stroke="hsl(6 60% 52% / 0.35)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cheeks */}
        <g opacity={p.cheekOpacity}>
          <ellipse cx="62" cy="118" rx="14" ry="9" fill="url(#cheek)" />
          <ellipse cx="142" cy="118" rx="16" ry="10" fill="url(#cheek)" />
        </g>

        {/* Sparkle stars */}
        {(stage === "sparkle" || stage === "halo") && (
          <g className="animate-pulse-soft">
            <text x="22" y="50" fontSize="16">✨</text>
            <text x="168" y="44" fontSize="14">✦</text>
            <text x="160" y="170" fontSize="14">✨</text>
          </g>
        )}

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
                  d={`M ${e.cx} ${e.cy - e.r} L ${e.cx + e.r * 0.3} ${e.cy - e.r * 0.3} L ${e.cx + e.r} ${e.cy} L ${e.cx + e.r * 0.3} ${e.cy + e.r * 0.3} L ${e.cx} ${e.cy + e.r} L ${e.cx - e.r * 0.3} ${e.cy + e.r * 0.3} L ${e.cx - e.r} ${e.cy} L ${e.cx - e.r * 0.3} ${e.cy - e.r * 0.3} Z`}
                  fill="hsl(41 100% 60%)"
                  stroke="hsl(36 90% 40%)"
                  strokeWidth="1.5"
                />
                <circle cx={e.cx - 3} cy={e.cy - 3} r="2" fill="white" />
              </g>
            ))}
          </>
        )}

        <path
          d="M 92 130 Q 107 142, 122 130"
          stroke="hsl(6 60% 35%)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
