import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { LiverMascot } from "@/components/LiverMascot";
import {
  clearCrisisSession,
  computeCrisisLoss,
  CrisisSession,
  CrisisStep,
  formatWon,
  loadCrisisSession,
  saveCrisisSession,
  SobrietyState,
} from "@/lib/sobriety";

interface Props {
  state: SobrietyState;
  onSurvive: () => void;
  onRelapse: () => void;
  onClose: () => void; // 메인으로 (세션은 유지)
}

const HARD_TRUTHS = [
  "술 한 잔이 간세포 수천 개를 죽여요. 간은 말없이 버티다가 한순간에 무너져요.",
  "음주 후 판단력은 40% 떨어져요. 그 상태로 한 말, 한 행동 — 되돌릴 수 없어요.",
  "매주 음주하면 위암 확률 1.7배. 당신의 가족이 병원에서 기다리는 모습, 상상 돼요?",
  "음주운전 사고의 70%는 '한두 잔만 마셨는데'에서 시작돼요.",
  "오늘 5만원 술값 × 주 2회 × 1년 = 520만원. 그 돈이면 뭘 할 수 있었을까요?",
  "술자리에서 한 실수 하나가 10년 쌓은 신뢰를 무너뜨릴 수 있어요.",
  "당신이 술 마시는 동안, 누군가는 당신 걱정에 잠 못 자고 있을 수도 있어요.",
];

const ALTERNATIVES = [
  "🍜 퇴근길에 평소 먹고 싶었던 맛집 가보세요. 술 없이 먹는 밥이 진짜 맛이에요.",
  "☕ 분위기 좋은 카페에서 커피 한 잔. 내일 아침 후회 대신 여유가 와요.",
  "🎬 보고 싶었던 영화나 드라마. 술 마시면 기억도 못 하잖아요.",
  "🛒 오늘 참은 5,000원 모아서 한 달 뒤 나한테 선물 사세요.",
  "🏃 30분만 걸어보세요. 걷고 나면 마시고 싶은 마음이 사라져 있을 거예요.",
  "📞 오랫동안 연락 못 한 사람한테 전화해보세요. 술자리보다 값진 시간이에요.",
  "🛁 뜨거운 물에 샤워하고 일찍 자보세요. 내일 아침 거울 속 내 얼굴이 달라요.",
];

const TIMER_MS = 5 * 60 * 1000;
const HALF_REMAINING_MS = 2.5 * 60 * 1000;

const initSession = (): CrisisSession => {
  const existing = loadCrisisSession();
  if (existing) return existing;
  const fresh: CrisisSession = {
    step: "truth",
    truthIdx: Math.floor(Math.random() * HARD_TRUTHS.length),
    altIdx: Math.floor(Math.random() * ALTERNATIVES.length),
    timerEndAt: null,
    startedAt: Date.now(),
  };
  saveCrisisSession(fresh);
  return fresh;
};

export const CrisisScreen = ({ state, onSurvive, onRelapse, onClose }: Props) => {
  const sessionRef = useRef<CrisisSession>(initSession());
  const [step, setStep] = useState<CrisisStep>(sessionRef.current.step);
  const [now, setNow] = useState(Date.now());
  const [confirmingFail, setConfirmingFail] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const wonCaptureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const truth = HARD_TRUTHS[sessionRef.current.truthIdx];
  const alt = ALTERNATIVES[sessionRef.current.altIdx];
  const loss = useMemo(() => computeCrisisLoss(state), [state]);

  // Persist step changes
  const updateStep = (next: CrisisStep, extra?: Partial<CrisisSession>) => {
    sessionRef.current = { ...sessionRef.current, step: next, ...extra };
    saveCrisisSession(sessionRef.current);
    setStep(next);
  };

  // Step 1: 3-second hold (anchor-based so backgrounding still counts)
  useEffect(() => {
    if (step !== "truth") {
      setCanContinue(false);
      return;
    }
    const elapsed = Date.now() - sessionRef.current.startedAt;
    if (elapsed >= 3000) {
      setCanContinue(true);
      return;
    }
    const id = window.setTimeout(() => setCanContinue(true), 3000 - elapsed);
    return () => window.clearTimeout(id);
  }, [step]);

  // Timer tick — anchor-based using timerEndAt, so background time still counts
  useEffect(() => {
    if (step !== "timer") return;
    if (!sessionRef.current.timerEndAt) {
      const endAt = Date.now() + TIMER_MS;
      sessionRef.current = { ...sessionRef.current, timerEndAt: endAt };
      saveCrisisSession(sessionRef.current);
    }
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    const onVis = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [step]);

  // Auto-advance when timer hits zero
  const remainingMs = sessionRef.current.timerEndAt
    ? Math.max(0, sessionRef.current.timerEndAt - now)
    : TIMER_MS;
  useEffect(() => {
    if (step === "timer" && remainingMs <= 0) {
      updateStep("won");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, remainingMs]);

  const totalSec = Math.ceil(remainingMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const halfShown = step === "timer" && remainingMs <= HALF_REMAINING_MS && remainingMs > 0;

  const handleSurvive = () => {
    clearCrisisSession();
    onSurvive();
  };
  const handleRelapse = () => {
    clearCrisisSession();
    onRelapse();
  };

  // ---------- Step 1: 현실 직면 ----------
  if (step === "truth") {
    return (
      <div
        className="app-shell min-h-screen flex flex-col px-6 pt-14 pb-8 animate-fade-in"
        style={{ background: "linear-gradient(180deg, hsl(220 30% 10%), hsl(220 35% 6%))" }}
      >
        <button
          onClick={onClose}
          aria-label="닫기"
          className="self-end text-white/50 text-sm mb-2"
        >
          닫기
        </button>

        <div className="flex-1 flex flex-col justify-center gap-7 text-white">
          {loss.daysLost >= 1 ? (
            <div className="space-y-3">
              <p className="text-[40px] font-extrabold leading-[1.1]">
                지금 마시면<br />
                <span style={{ color: "hsl(var(--coral))" }}>
                  {loss.daysLost}일이 0이 돼요.
                </span>
              </p>
              {loss.daysLost >= 7 && (
                <p className="text-base text-white/70">
                  {loss.daysLost}일 동안 {loss.daysLost}번의 맑은 아침을 되찾았는데,
                  <br />그게 오늘 밤 한 번에 사라져요.
                </p>
              )}
              {loss.daysToNextMilestone !== null && loss.daysToNextMilestone <= 14 && (
                <p className="text-base text-white/70">
                  다음 마일스톤 <b className="text-white">{loss.nextMilestoneDay}일</b>까지
                  {" "}딱 <b className="text-white">{loss.daysToNextMilestone}일</b> 남았는데요.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[36px] font-extrabold leading-[1.15]">
                여기서 마시면<br />
                <span style={{ color: "hsl(var(--coral))" }}>다시 0일부터예요.</span>
              </p>
              <p className="text-base text-white/70">
                시작이 가장 어려워요. 오늘 한 번만 더 버텨봐요.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-2xl font-bold leading-snug text-white/90">
              <span style={{ color: "hsl(var(--gold-light))" }}>
                {formatWon(loss.moneyLost)}
              </span>
              {" "}이 오늘 밤 사라져요.
            </p>
            {state.totalSaved > 0 ? (
              <p className="text-sm text-white/55">
                지금까지 {formatWon(state.totalSaved)} 모았어요.
                {state.totalSaved >= loss.moneyLost
                  ? ` 오늘 마시면 그중 ${Math.round((loss.moneyLost / state.totalSaved) * 100)}%가 한 번에 날아가요.`
                  : " 한 번의 술자리가 그 모든 노력보다 비싸요."}
              </p>
            ) : (
              <p className="text-sm text-white/55">
                오늘 안 마시면 그게 첫 5,000원이 돼요.
              </p>
            )}
            <p className="text-sm text-white/55">
              주 2회 × 1년이면 <b className="text-white/85">{formatWon(loss.yearlyProjection)}</b>.
              {state.totalSaved > 0 && loss.daysLost > 0 && (
                <> 지금 페이스면 1년 뒤 <b className="text-white/85">{formatWon(Math.round((state.totalSaved / Math.max(loss.daysLost, 1)) * 365))}</b>.</>
              )}
            </p>
          </div>

          <div className="h-px bg-white/15" />

          <p className="text-xl font-semibold leading-relaxed text-white/95">
            {truth}
          </p>
        </div>

        <button
          onClick={() => updateStep("alt")}
          disabled={!canContinue}
          className="w-full h-14 rounded-2xl bg-white text-foreground text-base font-bold disabled:opacity-30 transition-opacity"
        >
          {canContinue ? "그래도 보고 싶어요" : "잠시만요…"}
        </button>
      </div>
    );
  }

  // ---------- Step 2: 대안 ----------
  if (step === "alt") {
    return (
      <div className="app-shell bg-gradient-cream px-5 pt-12 pb-10 min-h-screen flex flex-col animate-fade-in">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="self-end text-muted-foreground text-sm mb-2"
        >
          닫기
        </button>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm tracking-wider font-bold text-coral mb-3">오늘 술값 대신</p>
          <h2 className="text-3xl font-extrabold text-foreground/90 mb-8 leading-snug">
            이건 어때요?
          </h2>
          <div className="glass-card rounded-3xl p-7 animate-fade-up">
            <p className="text-xl font-semibold leading-relaxed text-foreground/90">
              {alt}
            </p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground text-center">
            마음이 조금 흔들렸나요?
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => updateStep("timer", { timerEndAt: Date.now() + TIMER_MS })}
            className="w-full h-14 rounded-2xl bg-gradient-mint text-white text-lg font-bold shadow-mint active:scale-[0.98] transition-transform"
          >
            5분만 버텨볼게요
          </button>
          <button
            onClick={onClose}
            className="w-full h-11 text-sm text-muted-foreground"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ---------- Step 3: 타이머 ----------
  if (step === "timer") {
    const progress = 1 - remainingMs / TIMER_MS;
    return (
      <div className="app-shell bg-gradient-cream px-5 pt-10 pb-8 min-h-screen flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-muted-foreground">위기 모드 진행 중</span>
          <button
            onClick={onClose}
            aria-label="잠시 닫기"
            className="text-muted-foreground text-sm"
          >
            잠시 닫기
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-base font-semibold text-foreground/80">
            충동은 보통 5분이면 지나가요.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <LiverMascot mood="proud" size={180} stage="recovering" />
        </div>

        <div className="text-center mb-6">
          <p
            className="mint-text font-extrabold tabular-nums leading-none"
            style={{ fontSize: 88, letterSpacing: "-0.04em" }}
          >
            {mm}:{ss}
          </p>
        </div>

        <div className="h-2 rounded-full bg-white/60 overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-mint transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {halfShown && (
          <div className="glass-card rounded-2xl p-4 text-center animate-fade-up mb-4">
            <p className="text-base font-bold text-foreground/90">
              반 왔어요. 잘하고 있어요.
            </p>
          </div>
        )}

        <div className="mt-auto">
          {!confirmingFail ? (
            <button
              onClick={() => setConfirmingFail(true)}
              className="w-full text-xs text-muted-foreground/70 py-3"
            >
              그래도 마실래요
            </button>
          ) : (
            <div className="glass-card rounded-2xl p-4 animate-fade-in">
              <p className="text-sm text-foreground/85 mb-3 text-center font-semibold">
                정말요?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingFail(false)}
                  className="flex-1 h-11 rounded-xl bg-gradient-mint text-white font-bold"
                >
                  더 버틸게요
                </button>
                <button
                  onClick={() => updateStep("fail")}
                  className="flex-1 h-11 rounded-xl bg-muted text-foreground/70 font-semibold"
                >
                  네, 마실래요
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- Step 4a: 이겼다 ----------
  if (step === "won") {
    return (
      <div className="app-shell bg-gradient-cream px-5 pt-16 pb-10 min-h-screen flex flex-col animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="animate-bounce-soft mb-6">
            <LiverMascot mood="starry" size={210} stage="halo" />
          </div>
          <h2 className="text-3xl font-extrabold mint-text mb-3 leading-snug">
            이겨냈어요.
          </h2>
          <p className="text-lg font-semibold text-foreground/85">
            오늘도 당신이 이겼어요.
          </p>
        </div>
        <button
          onClick={handleSurvive}
          className="w-full h-14 rounded-2xl bg-gradient-mint text-white text-lg font-bold shadow-mint animate-pulse-soft active:scale-[0.98] transition-transform"
        >
          오늘도 안 마셨어요
        </button>
      </div>
    );
  }

  // ---------- Step 4b: 졌다 ----------
  return (
    <div className="app-shell bg-gradient-cream px-5 pt-16 pb-10 min-h-screen flex flex-col animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <LiverMascot mood="proud" size={180} stage="recovering" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground/90 mb-3 leading-snug">
          괜찮아요.
        </h2>
        <p className="text-base font-medium text-foreground/75 leading-relaxed">
          내일 다시 오면 돼요.
        </p>
      </div>
      <button
        onClick={handleRelapse}
        className="w-full h-14 rounded-2xl bg-foreground/85 text-background text-base font-bold active:scale-[0.98] transition-transform"
      >
        닫기
      </button>
    </div>
  );
};
