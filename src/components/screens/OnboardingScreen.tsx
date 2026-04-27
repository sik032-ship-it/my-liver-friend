import { useState } from "react";
import { ArrowRight, Bell, Coins, Heart } from "lucide-react";
import { LiverMascot } from "@/components/LiverMascot";
import { formatWon } from "@/lib/sobriety";
import {
  ReminderConfig,
  requestNotificationPermission,
  saveReminder,
} from "@/lib/reminder";

interface Props {
  onDone: (data: { savePerDay: number; reminder: ReminderConfig | null }) => void;
}

type Step = 0 | 1 | 2;

// 1주에 마시는 횟수 옵션
const FREQ_OPTIONS = [
  { label: "주 1회", value: 1 },
  { label: "주 2~3회", value: 2.5 },
  { label: "주 4회 이상", value: 4 },
  { label: "거의 매일", value: 6 },
];

// 한 번 술자리 평균 지출 옵션
const SPEND_OPTIONS = [
  { label: "1~2만원", value: 15000 },
  { label: "3~5만원", value: 40000 },
  { label: "6~10만원", value: 80000 },
  { label: "10만원+", value: 130000 },
];

const HOUR_OPTIONS = [9, 12, 18, 21, 22, 23];

export const OnboardingScreen = ({ onDone }: Props) => {
  const [step, setStep] = useState<Step>(0);
  const [freq, setFreq] = useState<number | null>(null);
  const [spend, setSpend] = useState<number | null>(null);
  const [hour, setHour] = useState<number>(21);
  const [minute] = useState<number>(0);
  const [reminderOn, setReminderOn] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  const savePerDay =
    freq !== null && spend !== null ? Math.round((freq * spend) / 7) : 5000;

  const goNext = () => setStep((s) => (s < 2 ? ((s + 1) as Step) : s));

  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    let reminder: ReminderConfig | null = null;
    if (reminderOn) {
      const perm = await requestNotificationPermission();
      reminder = { enabled: perm === "granted", hour, minute };
      saveReminder(reminder);
    }
    onDone({ savePerDay, reminder });
  };

  return (
    <div
      className="app-shell px-5 pt-12 pb-10 flex flex-col"
      style={{ background: "hsl(var(--cream))" }}
    >
      {/* Step indicator */}
      <div className="flex gap-1.5 mb-7">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= step ? "bg-gradient-mint" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* STEP 0 — 약속 */}
      {step === 0 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="animate-bounce-soft">
              <LiverMascot mood="starry" size={148} stage="halo" />
            </div>
          </div>

          <h1 className="text-[26px] font-black leading-tight text-center text-foreground/95 mb-2">
            매일 30초.<br />
            <span className="mint-text">간</span>은 살아나고
            {" "}<span className="gold-text">통장</span>은 채워져요.
          </h1>
          <p className="text-center text-[14px] text-muted-foreground leading-relaxed mb-8 px-2">
            금주 카운터가 아니에요.<br />
            "내가 결정한 사람"이 되는 가장 작은 신호예요.
          </p>

          <div className="space-y-3 mb-8">
            <div className="surface-card rounded-2xl p-4 flex items-start gap-3">
              <div className="size-10 rounded-xl bg-mint-soft flex items-center justify-center shrink-0">
                <Heart size={18} className="mint-text" strokeWidth={2.6} />
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-foreground/90">
                  간 회복도, 매일 시각화
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  몸에서 지금 일어나는 변화를 알려드려요
                </p>
              </div>
            </div>
            <div className="surface-card rounded-2xl p-4 flex items-start gap-3">
              <div className="size-10 rounded-xl bg-cream-deep flex items-center justify-center shrink-0">
                <Coins size={18} style={{ color: "hsl(var(--gold-deep))" }} strokeWidth={2.6} />
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-foreground/90">
                  오늘 안 쓴 술값, 자동 적립
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  당신의 음주 패턴에 맞춰 계산해드려요
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={goNext}
            className="mt-auto w-full h-14 rounded-2xl bg-gradient-mint text-white text-base font-bold shadow-mint active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            시작하기 <ArrowRight size={18} strokeWidth={2.8} />
          </button>
        </div>
      )}

      {/* STEP 1 — 음주 패턴 */}
      {step === 1 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <h1 className="text-[22px] font-black leading-tight text-foreground/95 mb-1">
            평소 음주 패턴이 어땠어요?
          </h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            더 정확한 절약액을 보여드릴게요.
          </p>

          <p className="text-[12px] font-bold text-foreground/70 tracking-wider mb-2">
            평소 음주 빈도
          </p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {FREQ_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setFreq(o.value)}
                className={`h-12 rounded-xl text-[14px] font-bold transition-all border ${
                  freq === o.value
                    ? "border-mint-deep bg-mint-soft mint-text"
                    : "border-border bg-card text-foreground/80"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <p className="text-[12px] font-bold text-foreground/70 tracking-wider mb-2">
            한 번 술자리 평균 지출
          </p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {SPEND_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSpend(o.value)}
                className={`h-12 rounded-xl text-[14px] font-bold transition-all border ${
                  spend === o.value
                    ? "border-gold bg-cream-deep"
                    : "border-border bg-card text-foreground/80"
                }`}
                style={spend === o.value ? { color: "hsl(var(--gold-deep))" } : undefined}
              >
                {o.label}
              </button>
            ))}
          </div>

          {freq !== null && spend !== null && (
            <div className="surface-card rounded-2xl p-4 mb-4 animate-fade-in text-center">
              <p className="text-[11px] font-bold text-muted-foreground tracking-wider mb-1">
                하루 평균 절약 예상
              </p>
              <p className="gold-text text-[26px] font-black tabular-nums leading-none">
                {formatWon(savePerDay)}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1.5">
                한 달이면 약 {formatWon(savePerDay * 30)}
              </p>
            </div>
          )}

          <button
            onClick={goNext}
            disabled={freq === null || spend === null}
            className="mt-auto w-full h-14 rounded-2xl bg-gradient-mint text-white text-base font-bold shadow-mint active:scale-[0.98] transition-transform disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            다음 <ArrowRight size={18} strokeWidth={2.8} />
          </button>
        </div>
      )}

      {/* STEP 2 — 알림 */}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="size-16 rounded-2xl bg-mint-soft flex items-center justify-center">
              <Bell size={28} className="mint-text" strokeWidth={2.4} />
            </div>
          </div>
          <h1 className="text-[22px] font-black leading-tight text-center text-foreground/95 mb-2">
            매일 언제 알려드릴까요?
          </h1>
          <p className="text-[13px] text-muted-foreground text-center mb-6 px-2">
            30초 체크인 한 번, 그날 하루가 달라져요.
          </p>

          <div className="surface-card rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-extrabold text-foreground/90">알림 받기</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">언제든 끌 수 있어요</p>
            </div>
            <button
              onClick={() => setReminderOn((v) => !v)}
              aria-label="알림 토글"
              className={`relative w-12 h-7 rounded-full transition-colors ${
                reminderOn ? "bg-gradient-mint" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-card transition-transform ${
                  reminderOn ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {reminderOn && (
            <div className="animate-fade-in">
              <p className="text-[12px] font-bold text-foreground/70 tracking-wider mb-2">
                알림 시간
              </p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {HOUR_OPTIONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHour(h)}
                    className={`h-12 rounded-xl text-[14px] font-bold transition-all border ${
                      hour === h
                        ? "border-mint-deep bg-mint-soft mint-text"
                        : "border-border bg-card text-foreground/80"
                    }`}
                  >
                    {h < 12 ? `오전 ${h}시` : h === 12 ? "정오" : `오후 ${h - 12}시`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                브라우저 알림 권한이 필요해요.
              </p>
            </div>
          )}

          <button
            onClick={finish}
            disabled={submitting}
            className="mt-auto w-full h-14 rounded-2xl bg-gradient-mint text-white text-base font-bold shadow-mint active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {submitting ? "준비 중..." : "시작하기 ✦"}
          </button>
          <button
            onClick={finish}
            className="mt-2 w-full text-[13px] text-muted-foreground py-2"
          >
            나중에 설정할게요
          </button>
        </div>
      )}
    </div>
  );
};
