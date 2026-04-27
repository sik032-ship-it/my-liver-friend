import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Check, Share2 } from "lucide-react";
import { LiverMascot } from "@/components/LiverMascot";
import { Confetti } from "@/components/Confetti";
import {
  formatWon,
  milestoneCaptions,
  nextMilestone,
  ShareCaption,
  SobrietyState,
} from "@/lib/sobriety";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  state: SobrietyState;
  onClose: () => void;
}

export const MilestoneScreen = ({ state, onClose }: Props) => {
  const day = state.totalDays;
  const next = nextMilestone(day);
  const captureRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const captions = useMemo(() => milestoneCaptions(day, state.totalSaved), [day, state.totalSaved]);
  const [pickedId, setPickedId] = useState<string>(captions[0].id);

  const captureBlob = async (): Promise<{ blob: Blob; file: File } | null> => {
    if (!captureRef.current) return null;
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
    if (!blob) return null;
    return {
      blob,
      file: new File([blob], `sober-day-${day}.png`, { type: "image/png" }),
    };
  };

  const downloadFallback = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // 자동 공유: 캡처 → 캡션 시트 → 선택 → navigator.share(file+text)
  const openShareSheet = () => setSheetOpen(true);

  const confirmShare = async (caption: ShareCaption) => {
    if (sharing) return;
    setSharing(true);
    try {
      const out = await captureBlob();
      if (!out) throw new Error("capture fail");
      const navAny = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      const shareData: ShareData = {
        title: `금주 ${day}일 달성`,
        text: caption.text,
        files: [out.file],
      };
      if (navAny.share && navAny.canShare && navAny.canShare(shareData)) {
        await navAny.share(shareData);
      } else if (navAny.share) {
        // 파일 공유 미지원 환경 — 텍스트만 공유 + 이미지는 다운로드
        await navAny.share({ title: shareData.title, text: caption.text });
        downloadFallback(out.blob, out.file.name);
      } else {
        // 완전 미지원 — 클립보드 + 다운로드
        try { await navigator.clipboard.writeText(caption.text); } catch {}
        downloadFallback(out.blob, out.file.name);
        alert("이미지를 저장하고 캡션을 복사했어요");
      }
      setSheetOpen(false);
    } catch (e) {
      console.error(e);
      alert("공유에 실패했어요");
    } finally {
      setSharing(false);
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
        onClick={openShareSheet}
        className="mt-6 w-full h-14 rounded-2xl bg-gradient-gold text-white font-bold shadow-gold active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        <Share2 size={18} strokeWidth={2.6} />
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[28px] border-0 px-5 pt-6 pb-7 max-h-[88vh] overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-[20px] font-extrabold tracking-tight">
              어떤 톤으로 공유할까요?
            </SheetTitle>
            <SheetDescription className="text-[13px] text-muted-foreground">
              이미지는 자동으로 함께 첨부돼요.
            </SheetDescription>
          </SheetHeader>

          <ul className="space-y-3">
            {captions.map((c) => {
              const picked = pickedId === c.id;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setPickedId(c.id)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all ${
                      picked
                        ? "border-mint-deep bg-mint-soft/60"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold tracking-wider ${picked ? "mint-text" : "text-muted-foreground"}`}>
                        {c.tone.toUpperCase()}
                      </span>
                      {picked && (
                        <span className="size-5 rounded-full bg-gradient-mint flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-foreground/90">
                      {c.text}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => {
              const c = captions.find((x) => x.id === pickedId) ?? captions[0];
              confirmShare(c);
            }}
            disabled={sharing}
            className="mt-5 w-full h-14 rounded-2xl bg-foreground text-background font-bold active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {sharing ? "준비 중..." : (
              <>
                <Share2 size={18} strokeWidth={2.6} />
                이 캡션으로 공유
              </>
            )}
          </button>
          <button
            onClick={() => setSheetOpen(false)}
            className="mt-2 w-full text-[13px] text-muted-foreground py-2"
          >
            닫기
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
};
