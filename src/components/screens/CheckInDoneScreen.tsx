import { LiverMascot } from "@/components/LiverMascot";
import { Confetti } from "@/components/Confetti";
import { dayMessage, formatWon, SobrietyState } from "@/lib/sobriety";

interface Props {
  state: SobrietyState;
  onClose: () => void;
}

export const CheckInDoneScreen = ({ state, onClose }: Props) => {
  const day = state.totalDays;

  const share = async () => {
    const text = `금주 ${day}일째, 절약 ${formatWon(state.totalSaved)} ✿\n간 지키고 돈 벌고`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        alert("기록이 복사됐어요");
      }
    } catch {}
  };

  return (
    <div className="app-shell px-5 pt-12 pb-10" style={{ background: "linear-gradient(180deg, hsl(var(--mint-soft)), hsl(var(--mint-softer)))" }}>
      <Confetti count={18} />

      <div className="flex justify-center mt-2 mb-4">
        <div className="animate-pop">
          <LiverMascot mood="proud" size={180} />
        </div>
      </div>

      <h1 className="text-center text-3xl font-extrabold animate-fade-up tracking-tight">
        오늘도 해냈어요
      </h1>
      <p className="text-center mt-2 text-mint-deep font-semibold animate-fade-up" style={{ animationDelay: "100ms" }}>
        {state.streak}일 연속 기록 갱신
      </p>

      {/* Day message */}
      <div className="mt-6 rounded-3xl p-5 bg-white/80 backdrop-blur border border-white shadow-card animate-fade-up" style={{ animationDelay: "160ms" }}>
        <p className="text-xs font-bold tracking-widest text-coral mb-2">DAY {day}</p>
        <p className="text-base font-semibold leading-relaxed">{dayMessage(day)}</p>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "220ms" }}>
        <div className="rounded-2xl p-4 bg-white/80 backdrop-blur border border-white shadow-card">
          <p className="text-xs text-muted-foreground">연속 금주</p>
          <p className="text-2xl font-extrabold mint-text mt-1">{state.streak}일</p>
        </div>
        <div className="rounded-2xl p-4 bg-white/80 backdrop-blur border border-white shadow-card">
          <p className="text-xs text-muted-foreground">절약</p>
          <p className="text-2xl font-extrabold gold-text mt-1">{formatWon(state.totalSaved)}</p>
        </div>
      </div>

      <button
        onClick={share}
        className="mt-6 w-full h-13 py-3.5 rounded-2xl bg-foreground text-background font-bold active:scale-[0.98] transition"
      >
        오늘의 기록 공유하기
      </button>

      <button onClick={onClose} className="mt-3 w-full text-sm text-muted-foreground py-2">
        내일도 함께 해요 ✿
      </button>
    </div>
  );
};
