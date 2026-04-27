import { useEffect, useMemo, useRef, useState } from "react";
import { LiverMascot } from "@/components/LiverMascot";
import { formatWon, SobrietyState } from "@/lib/sobriety";

interface Props {
  state: SobrietyState;
  onSurvive: () => void; // 5분 이겨낸 후 체크인
  onRelapse: () => void; // 결국 마심
  onClose: () => void;   // 그냥 닫기 (메인으로)
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

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Step = "truth" | "alt" | "timer" | "won" | "fail";

const TIMER_SECONDS = 5 * 60;

export const CrisisScreen = ({ state, onSurvive, onRelapse, onClose }: Props) => {
  const [step, setStep] = useState<Step>("truth");
  const [seconds, setSeconds] = useState(TIMER_SECONDS);
  const [halfShown, setHalfShown] = useState(false);
  const [confirmingFail, setConfirmingFail] = useState(false);
  const truth = useMemo(() => pick(HARD_TRUTHS), []);
  const alt = useMemo(() => pick(ALTERNATIVES), []);
  const truthTimer = useRef<number | null>(null);

  // Step 1: hard truth — auto-advance after 3s, but allow manual continue after delay
  const [canContinue, setCanContinue] = useState(false);
  useEffect(() => {
    if (step !== "truth") return;
    setCanContinue(false);
    truthTimer.current = window.setTimeout(() => setCanContinue(true), 3000);
    return () => {
      if (truthTimer.current) window.clearTimeout(truthTimer.current);
    };
  }, [step]);

  // Step 3: countdown
  useEffect(() => {
    if (step !== "timer") return;
    if (seconds <= 0) {
      setStep("won");
      return;
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [step, seconds]);

  useEffect(() => {
    if (step === "timer" && seconds <= 150 && !halfShown) setHalfShown(true);
  }, [step, seconds, halfShown]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // ---------- Step 1: 현실 직면 (어두운 배경) ----------
  if (step === "truth") {
    return (
      <div className="app-shell min-h-screen flex flex-col px-6 pt-16 pb-10 animate-fade-in"
        style={{ background: "linear-gradient(180deg, hsl(220 30% 10%), hsl(220 35% 6%))" }}>
        <div className="flex-1 flex flex-col justify-center gap-8 text-white">
          {state.streak >= 1 && (
            <div className="space-y-4">
              <p className="text-4xl font-extrabold leading-tight">
                지금 마시면<br />
                <span className="text-coral" style={{ color: "hsl(var(--coral))" }}>
                  {state.streak}일이 0이 돼요.
                </span>
              </p>
              <p className="text-2xl font-bold leading-snug text-white/90">
                <span style={{ color: "hsl(var(--gold-light))" }}>
                  {formatWon(state.totalSaved)}
                </span>
                {" "}이 오늘 밤 사라져요.
              </p>
            </div>
          )}
          <div className="h-px bg-white/15" />
          <p className="text-xl font-semibold leading-relaxed text-white/95">
            {truth}
          </p>
        </div>

        <button
          onClick={() => setStep("alt")}
          disabled={!canContinue}
          className="w-full h-14 rounded-2xl bg-white text-foreground text-base font-bold disabled:opacity-30 transition-opacity"
        >
          {canContinue ? "그래도 보고 싶어요" : "잠시만요…"}
        </button>
      </div>
    );
  }

  // ---------- Step 2: 솔깃한 대안 ----------
  if (step === "alt") {
    return (
      <div className="app-shell bg-gradient-cream px-5 pt-12 pb-10 min-h-screen flex flex-col animate-fade-in">
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
            onClick={() => setStep("timer")}
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
    const progress = 1 - seconds / TIMER_SECONDS;
    return (
      <div className="app-shell bg-gradient-cream px-5 pt-10 pb-8 min-h-screen flex flex-col animate-fade-in">
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
            className="h-full bg-gradient-mint transition-all duration-1000"
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
                  onClick={() => setStep("fail")}
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
          onClick={onSurvive}
          className="w-full h-14 rounded-2xl bg-gradient-mint text-white text-lg font-bold shadow-mint animate-pulse-soft active:scale-[0.98] transition-transform"
        >
          오늘도 안 마셨어요
        </button>
      </div>
    );
  }

  // ---------- Step 4b: 졌다 (자괴감 없이) ----------
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
        onClick={onRelapse}
        className="w-full h-14 rounded-2xl bg-foreground/85 text-background text-base font-bold active:scale-[0.98] transition-transform"
      >
        닫기
      </button>
    </div>
  );
};
