import { useEffect, useState } from "react";
import { Heart, Trophy } from "lucide-react";
import { LiverMascot } from "@/components/LiverMascot";
import {
  companionCount,
  currentGift,
  formatWon,
  healthStage,
  isRewardedToday,
  pickBodyChange,
  recordImpression,
  recordReward,
  recoveryProgress,
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
  const [change] = useState(() => pickBodyChange(day));
  const [liked, setLiked] = useState(() => isRewardedToday(change.id));
  const recovery = recoveryProgress(day);
  const recoveryPct = Math.round(recovery * 100);

  useEffect(() => {
    recordImpression(change.id);
  }, [change.id]);

  const handleLike = () => {
    if (liked) return;
    recordReward(change.id);
    setLiked(true);
  };

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

      {/* Hero — 간(마스코트+회복게이지) + 돈(₩) + Day 동등 비중 */}
      <section className="surface-card-lg rounded-[28px] px-5 pt-6 pb-6 mb-3">
        <div className="flex justify-center mb-3">
          <div className="animate-bounce-soft">
            <LiverMascot mood="happy" size={140} stage={stage} />
          </div>
        </div>

        {/* 회복도 게이지 */}
        <div className="px-2 mb-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="text-[12px] font-semibold text-foreground/70">간 회복도</p>
            <p className="text-[12px] font-extrabold mint-text tabular-nums">{recoveryPct}%</p>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-mint transition-all duration-700"
              style={{ width: `${recoveryPct}%` }}
            />
          </div>
        </div>

        {/* 두 개 숫자 — 동등 비중 */}
        <div className="grid grid-cols-2 gap-3 px-1">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wide mb-1">모은 돈</p>
            <p
              className="gold-text font-extrabold leading-none tabular-nums"
              style={{ fontSize: 30, letterSpacing: "-0.03em" }}
            >
              {formatWon(state.totalSaved)}
            </p>
          </div>
          <div className="text-center border-l border-border/70">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wide mb-1">맑은 날</p>
            <p
              className="mint-text font-extrabold leading-none tabular-nums"
              style={{ fontSize: 30, letterSpacing: "-0.03em" }}
            >
              {day}<span className="text-base font-bold ml-0.5">일</span>
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="rounded-full bg-coral/10 px-3.5 py-1.5 text-[12px] font-semibold text-coral-deep">
            🔥 연속 {state.streak}일
          </div>
        </div>
      </section>

      {/* Card stack — 12px rhythm */}
      <div className="space-y-3">
        {/* 오늘의 변화 (placebo) */}
        <div className="surface-card rounded-2xl p-5">
          <p className="text-[11px] text-mint-deep font-bold mb-2 tracking-wider">오늘 몸에서</p>
          <p className="text-[16px] font-extrabold leading-snug text-foreground/95">
            {change.headline}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {change.detail}
          </p>
        </div>

        {/* 오늘의 선물 */}
        {gift && (
          <div className="surface-card rounded-2xl p-5">
            <p className="text-[11px] text-coral font-bold mb-2 tracking-wider">오늘의 선물</p>
            <p className="text-[15px] font-semibold text-foreground/90">{gift}</p>
          </div>
        )}

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
