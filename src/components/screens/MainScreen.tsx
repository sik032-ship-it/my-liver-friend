import { useState } from "react";
import { Trophy } from "lucide-react";
import { LiverMascot } from "@/components/LiverMascot";
import {
  companionCount,
  currentGift,
  dayMessage,
  formatWon,
  healthStage,
  SobrietyState,
  timeGreeting,
  todayLabel,
} from "@/lib/sobriety";

interface Props {
  state: SobrietyState;
  onCheckIn: () => void;
  onRelapse: () => void;
  onOpenMilestones: () => void;
}

export const MainScreen = ({ state, onCheckIn, onRelapse, onOpenMilestones }: Props) => {
  const [confirming, setConfirming] = useState(false);
  const day = state.totalDays;
  const stage = healthStage(day);
  const gift = currentGift(day);
  const { active, checkedIn } = companionCount();

  return (
    <div className="app-shell bg-gradient-cream px-5 pt-10 pb-12">
      {/* Greeting + Trophy */}
      <header className="mb-6 animate-fade-in flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground/90 leading-snug">{timeGreeting()}</p>
          <p className="mt-1 text-sm text-muted-foreground">{todayLabel()}</p>
        </div>
        <button
          onClick={onOpenMilestones}
          aria-label="마일스톤 보기"
          className="size-11 shrink-0 rounded-2xl glass-card flex items-center justify-center text-gold-deep hover:scale-105 active:scale-95 transition-transform"
          style={{ color: "hsl(var(--gold-deep))" }}
        >
          <Trophy size={22} strokeWidth={2.4} />
        </button>
      </header>

      {/* Mascot */}
      <div className="mb-2 flex justify-center">
        <div className="animate-bounce-soft">
          <LiverMascot mood="happy" size={200} stage={stage} />
        </div>
      </div>

      {/* Day count */}
      <div className="text-center mb-1">
        <p className="text-sm text-muted-foreground tracking-wide">금주</p>
        <p
          className="mint-text font-extrabold leading-none"
          style={{ fontSize: 88, letterSpacing: "-0.04em" }}
        >
          {day}
          <span className="text-2xl font-bold ml-1 align-top mint-text">일째</span>
        </p>
        <p className="mt-2 text-base font-medium text-foreground/80">잘하고 있어요 ✿</p>
      </div>

      {/* Saved money card */}
      <div className="glass-card rounded-3xl p-5 mt-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">절약한 술값</p>
            <p className="text-2xl font-extrabold gold-text">{formatWon(state.totalSaved)}</p>
          </div>
          <div className="size-12 rounded-full bg-gradient-gold flex items-center justify-center text-white font-bold shadow-gold">
            ₩
          </div>
        </div>
        {gift && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <p className="text-xs text-coral font-bold mb-1 tracking-wider">오늘의 선물</p>
            <p className="text-sm font-semibold text-foreground/85">{gift}</p>
          </div>
        )}
      </div>

      {/* Today's message */}
      <div className="glass-card rounded-3xl p-5 mt-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <p className="text-xs text-coral font-bold mb-2 tracking-wider">오늘의 메시지</p>
        <p className="text-base font-semibold leading-relaxed text-foreground/90">
          {dayMessage(day || 1)}
        </p>
      </div>

      {/* Streak badge */}
      <div className="mt-5 flex justify-center">
        <div className="rounded-full bg-coral/10 border border-coral/30 px-4 py-2 text-sm font-semibold text-coral-deep">
          🔥 연속 {state.streak}일 달성 중
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onCheckIn}
        className="mt-6 w-full h-14 rounded-2xl bg-gradient-mint text-white text-lg font-bold shadow-mint animate-pulse-soft active:scale-[0.98] transition-transform"
      >
        오늘도 안 마셨어요
      </button>

      {/* Relapse */}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          오늘 마셨어요
        </button>
      ) : (
        <div className="mt-4 glass-card rounded-2xl p-4 animate-fade-in">
          <p className="text-sm text-foreground/80 mb-3 text-center">
            연속 기록이 0일로 초기화돼요. 그래도 다시 시작할 수 있어요 ✿
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 h-11 rounded-xl bg-muted text-foreground/80 font-semibold"
            >
              취소
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                onRelapse();
              }}
              className="flex-1 h-11 rounded-xl bg-coral text-white font-semibold"
            >
              초기화
            </button>
          </div>
        </div>
      )}

      {/* Companion counter */}
      <div className="mt-8 text-center animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="inline-flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-white/50 border border-white/70 backdrop-blur">
          <p className="text-sm font-semibold text-foreground/80">
            지금 <span className="mint-text font-extrabold">{active.toLocaleString("ko-KR")}</span>명이 함께 금주 중
          </p>
          <p className="text-xs text-muted-foreground">
            오늘 체크인 완료한 사람 {checkedIn.toLocaleString("ko-KR")}명
          </p>
        </div>
      </div>
    </div>
  );
};
