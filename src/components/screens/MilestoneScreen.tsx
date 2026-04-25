import { LiverMascot } from "@/components/LiverMascot";
import { Confetti } from "@/components/Confetti";
import { formatWon, nextMilestone, SobrietyState } from "@/lib/sobriety";

interface Props {
  state: SobrietyState;
  onClose: () => void;
}

export const MilestoneScreen = ({ state, onClose }: Props) => {
  const day = state.totalDays;
  const next = nextMilestone(day);

  const share = async () => {
    const text = `${day}일 연속 금주 달성 ✦\n절약 ${formatWon(state.totalSaved)}\n간 지키고 돈 벌고`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        alert("기록이 복사됐어요");
      }
    } catch {}
  };

  return (
    <div className="app-shell px-5 pt-12 pb-10 relative" style={{ background: "linear-gradient(180deg, hsl(var(--cream)), hsl(22 100% 90%))" }}>
      <Confetti count={28} />

      <p className="text-center text-xl font-bold animate-fade-up">축하해요! ✦</p>

      <div className="text-center mt-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <p
          className="gold-text font-black animate-glow leading-none"
          style={{ fontSize: 148, letterSpacing: "-0.06em" }}
        >
          {day}
        </p>
        <p className="text-lg font-bold text-foreground/80 mt-1">일 연속 금주 달성</p>
      </div>

      <div className="relative my-6 flex justify-center">
        <div className="animate-bounce-soft">
          <LiverMascot mood="starry" size={180} />
        </div>
        {/* Floating sparkles */}
        {[
          { top: "10%", left: "18%", d: "0s" },
          { top: "20%", right: "16%", d: "0.4s" },
          { top: "60%", left: "10%", d: "0.8s" },
          { top: "55%", right: "12%", d: "1.1s" },
          { top: "0%", left: "48%", d: "0.6s" },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-sparkle-float"
            // @ts-expect-error css inline
            style={{ ...s, animationDelay: s.d, color: "hsl(var(--gold-light))" }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Saved pill */}
      <div className="flex justify-center animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="gold-pill rounded-full px-5 py-2.5 font-extrabold">
          절약 {formatWon(state.totalSaved)}
        </div>
      </div>

      {/* Reclaimed card */}
      <div className="mt-6 glass-card rounded-3xl p-5 animate-fade-up" style={{ animationDelay: "260ms" }}>
        <p className="text-xs font-bold tracking-widest text-coral mb-3">되찾은 것들</p>
        <ul className="space-y-2.5 text-[15px] font-semibold text-foreground/85">
          <li className="flex justify-between"><span>☀ 맑은 아침</span><span>{day}번</span></li>
          <li className="flex justify-between"><span>☾ 깊은 수면</span><span>{day}번</span></li>
          <li className="flex justify-between"><span>✿ 여유로운 저녁</span><span>{day}번</span></li>
        </ul>
      </div>

      <button
        onClick={share}
        className="mt-6 w-full h-14 rounded-2xl bg-gradient-gold text-white font-bold shadow-gold active:scale-[0.98] transition"
      >
        {day}일 달성 공유하기
      </button>

      {next && (
        <button onClick={onClose} className="mt-3 w-full text-sm font-semibold text-foreground/70 py-2">
          다음 목표: {next}일 →
        </button>
      )}
      {!next && (
        <button onClick={onClose} className="mt-3 w-full text-sm text-foreground/70 py-2">
          계속 이어가기 ✿
        </button>
      )}
    </div>
  );
};
