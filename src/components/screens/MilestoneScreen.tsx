import { useRef, useState } from "react";
import html2canvas from "html2canvas";
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
  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

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

  const saveAsImage = async () => {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#FFEEDB",
        scale: 2,
        useCORS: true,
      });

      // watermark
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const fontSize = 20 * 2;
        ctx.font = `bold ${fontSize}px Pretendard, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.textAlign = "center";
        ctx.fillText("간 지키고 돈 벌고", canvas.width / 2, canvas.height - 24);
      }

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("blob fail");

      const file = new File([blob], `sobriety-${day}days.png`, { type: "image/png" });

      // Try native share with file
      const navAny = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (navAny.share && navAny.canShare && navAny.canShare({ files: [file] })) {
        await navAny.share({ files: [file], title: `${day}일 금주 달성` });
      } else {
        // Fallback download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      alert("이미지 저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell px-5 pt-12 pb-10 relative animate-fade-in" style={{ background: "linear-gradient(180deg, hsl(var(--cream)), hsl(22 100% 90%))" }}>
      <Confetti count={28} />

      {/* SNS-shareable square card */}
      <div
        ref={captureRef}
        className="relative rounded-[32px] overflow-hidden shadow-card-lg"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--cream)) 0%, hsl(var(--cream-deep)) 55%, hsl(var(--mint-soft)) 100%)",
          aspectRatio: "1 / 1",
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-50 blur-3xl"
          style={{ background: "hsl(var(--mint) / 0.4)" }}
        />
        <div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-40 blur-3xl"
          style={{ background: "hsl(var(--gold-light) / 0.4)" }}
        />

        <div className="relative h-full w-full flex flex-col items-center justify-between px-7 py-7">
          <div className="self-stretch flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-[0.3em] text-foreground/60">SOBER · DAY</p>
            <p className="text-[11px] font-bold tracking-wider mint-text">CLEAN ✦</p>
          </div>

          <div className="text-center">
            <p
              className="gold-text font-black leading-none animate-glow"
              style={{ fontSize: 168, letterSpacing: "-0.07em" }}
            >
              {day}
            </p>
            <p className="mt-2 text-[15px] font-bold text-foreground/75 tracking-wide">
              days alcohol-free
            </p>
          </div>

          <div className="animate-bounce-soft">
            <LiverMascot mood="starry" size={120} stage="halo" />
          </div>

          <div className="self-stretch flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-0.5">SAVED</p>
              <p className="text-[18px] font-extrabold gold-text leading-none">
                {formatWon(state.totalSaved)}
              </p>
            </div>
            <p className="text-[11px] font-bold text-foreground/60 tracking-wider">
              @간지키고돈벌고
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={saveAsImage}
        disabled={saving}
        className="mt-6 w-full h-14 rounded-2xl bg-foreground text-background font-bold active:scale-[0.98] transition disabled:opacity-60"
      >
        {saving ? "저장 중..." : "이미지로 저장하기"}
      </button>

      <button
        onClick={share}
        className="mt-3 w-full h-14 rounded-2xl bg-gradient-gold text-white font-bold shadow-gold active:scale-[0.98] transition"
      >
        {day}일 달성 공유하기
      </button>

      {next ? (
        <button onClick={onClose} className="mt-3 w-full text-sm font-semibold text-foreground/70 py-2">
          다음 목표: {next}일 →
        </button>
      ) : (
        <button onClick={onClose} className="mt-3 w-full text-sm text-foreground/70 py-2">
          계속 이어가기 ✿
        </button>
      )}
    </div>
  );
};
