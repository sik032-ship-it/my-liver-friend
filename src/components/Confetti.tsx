interface ConfettiProps {
  count?: number;
}

const COLORS = [
  "hsl(var(--mint))",
  "hsl(var(--coral))",
  "hsl(var(--gold))",
  "hsl(var(--pink-cheek))",
  "hsl(var(--gold-light))",
];

const SHAPES = ["circle", "square", "triangle"] as const;

export const Confetti = ({ count = 28 }: ConfettiProps) => {
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.2;
    const duration = 2.4 + Math.random() * 1.8;
    const size = 8 + Math.random() * 8;
    const color = COLORS[i % COLORS.length];
    const shape = SHAPES[i % SHAPES.length];
    return { left, delay, duration, size, color, shape, i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.i}
          className="absolute top-0 animate-[confetti-drop_var(--d)_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            // @ts-expect-error css var
            "--d": `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.shape === "circle" && (
            <div style={{ width: p.size, height: p.size, background: p.color, borderRadius: "9999px" }} />
          )}
          {p.shape === "square" && (
            <div style={{ width: p.size, height: p.size, background: p.color, borderRadius: 3 }} />
          )}
          {p.shape === "triangle" && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${p.size / 2}px solid transparent`,
                borderRight: `${p.size / 2}px solid transparent`,
                borderBottom: `${p.size}px solid ${p.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
