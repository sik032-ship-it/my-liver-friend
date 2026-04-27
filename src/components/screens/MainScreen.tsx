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
  onCrisis: () => void;
}

export const MainScreen = ({ state, onCheckIn, onRelapse, onOpenMilestones, onCrisis }: Props) => {
  const [confirming, setConfirming] = useState(false);
  const day = state.totalDays;
  const stage = healthStage(day);
  const gift = currentGift(day);
  const { active, checkedIn } = companionCount();

  return (
    <div className="app-shell px-5 pt-12 pb-12" style={{ background: "hsl(var(--cream))" }}>
      {/* Greeting + Trophy */}
      <header className="mb-7 flex items-start justify-between gap-3">
        <div>
          <p className="text-[19px] font-semibold text-foreground/90 leading-snug">{timeGreeting()}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{todayLabel()}</p>
        </div>
        <button
          onClick={onOpenMilestones}
          aria-label="마일스톤 보기"
          className="size-11 shrink-0 rounded-full surface-card flex items-center justify-center active:scale-95 transition-transform"
          style={{ color: "hsl(var(--gold-deep))" }}
        >
          <Trophy size={20} strokeWidth={2.4} />
        </button>
      </header>

      {/* Hero card: Mascot + Day */}
      <section className="surface-card-lg rounded-[28px] px-5 pt-6 pb-7 mb-3">
        <div className="flex justify-center mb-1">
          <div className="animate-bounce-soft">
            <LiverMascot mood="happy" size={180} stage={stage} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[13px] text-muted-foreground tracking-wide">금주</p>
          <p
            className="mint-text font-extrabold leading-none mt-1"
            style={{ fontSize: 84, letterSpacing: "-0.04em" }}
          >
            {day}
            <span className="text-2xl font-bold ml-1 align-top mint-text">일째</span>
          </p>
          <p className="mt-3 text-[15px] font-medium text-foreground/75">잘하고 있어요 ✿</p>
        </div>
        <div className="mt-5 flex justify-center">
          <div className="rounded-full bg-coral/10 px-3.5 py-1.5 text-[13px] font-semibold text-coral-deep">
            🔥 연속 {state.streak}일
          </div>
        </div>
      </section>

      {/* Card stack — 12px rhythm */}
      <div className="space-y-3">
        <div className="surface-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground mb-1">절약한 술값</p>
              <p className="text-[22px] font-extrabold gold-text leading-none">{formatWon(state.totalSaved)}</p>
            </div>
            <div className="size-11 rounded-full bg-gradient-gold flex items-center justify-center text-white font-bold shadow-gold">
              ₩
            </div>
          </div>
          {gift && (
            <div className="mt-4 pt-4 border-t border-border/70">
              <p className="text-[11px] text-coral font-bold mb-1 tracking-wider">오늘의 선물</p>
              <p className="text-[14px] font-semibold text-foreground/85">{gift}</p>
            </div>
          )}
        </div>

        <div className="surface-card rounded-2xl p-5">
          <p className="text-[11px] text-coral font-bold mb-2 tracking-wider">오늘의 메시지</p>
          <p className="text-[15px] font-semibold leading-relaxed text-foreground/90">
            {dayMessage(day || 1)}
          </p>
        </div>

        <div className="surface-card rounded-2xl px-5 py-4">
          <p className="text-[14px] font-semibold text-foreground/80">
            지금 <span className="mint-text font-extrabold">{active.toLocaleString("ko-KR")}</span>명이 함께 금주 중
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            오늘 체크인 완료한 사람 {checkedIn.toLocaleString("ko-KR")}명
          </p>
        </div>
      </div>

      {/* CTAs */}
      <button
        onClick={onCheckIn}
        className="mt-7 w-full h-14 rounded-2xl bg-gradient-mint text-white text-base font-bold shadow-mint active:scale-[0.98] transition-transform"
      >
        오늘도 안 마셨어요
      </button>

      <button
        onClick={onCrisis}
        className="mt-3 w-full h-12 rounded-2xl surface-card text-[14px] font-bold active:scale-[0.98] transition-transform"
        style={{ color: "hsl(var(--coral-deep))" }}
      >
        🆘 지금 마시고 싶어요
      </button>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 w-full text-[13px] text-muted-foreground py-2"
        >
          오늘 마셨어요
        </button>
      ) : (
        <div className="mt-4 surface-card rounded-2xl p-4 animate-fade-in">
          <p className="text-[13px] text-foreground/80 mb-3 text-center">
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
    </div>
  );
};
