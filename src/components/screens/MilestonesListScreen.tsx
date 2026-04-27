import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { LiverMascot } from "@/components/LiverMascot";
import {
  formatWon,
  loadMilestones,
  MILESTONES,
  SAVE_PER_DAY,
  SobrietyState,
} from "@/lib/sobriety";

interface Props {
  state: SobrietyState;
  onBack: () => void;
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
};

export const MilestonesListScreen = ({ state, onBack }: Props) => {
  const records = loadMilestones();
  const recordMap = new Map(records.map((r) => [r.day, r]));
  const totalReached = MILESTONES.filter((m) => state.totalDays >= m).length;

  return (
    <div className="app-shell px-5 pt-10 pb-12" style={{ background: "hsl(var(--cream))" }}>
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          aria-label="뒤로"
          className="size-10 rounded-full surface-card flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[12px] text-muted-foreground">나의 여정</p>
          <h1 className="text-[20px] font-extrabold text-foreground/90 leading-tight">마일스톤</h1>
        </div>
      </header>

      <div className="surface-card-lg rounded-[24px] p-5 flex items-center gap-4 mb-4">
        <LiverMascot size={60} stage="sparkle" mood="proud" />
        <div className="flex-1">
          <p className="text-[12px] text-muted-foreground">달성한 마일스톤</p>
          <p className="text-[24px] font-extrabold gold-text leading-none mt-1">
            {totalReached} <span className="text-sm font-bold text-foreground/60">/ {MILESTONES.length}</span>
          </p>
        </div>
        <Trophy size={28} style={{ color: "hsl(var(--gold-deep))" }} />
      </div>

      <ul className="space-y-3">
        {MILESTONES.map((m, i) => {
          const reached = state.totalDays >= m;
          const rec = recordMap.get(m);
          const remaining = m - state.totalDays;
          const savedAtMilestone = rec?.saved ?? m * SAVE_PER_DAY;

          return (
            <li
              key={m}
              className={`surface-card rounded-2xl p-4 flex items-center gap-4 animate-fade-up ${
                reached ? "" : "opacity-75"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`size-12 rounded-2xl flex items-center justify-center font-extrabold text-[15px] ${
                  reached ? "bg-gradient-gold text-white shadow-gold" : "bg-muted text-muted-foreground"
                }`}
              >
                {reached ? `${m}` : <Lock size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-foreground/90">{m}일 달성</p>
                {reached ? (
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {rec ? `${formatDate(rec.date)} · ` : ""}
                    <span className="gold-text font-bold">{formatWon(savedAtMilestone)}</span> 절약
                  </p>
                ) : (
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {remaining}일 남았어요
                  </p>
                )}
              </div>
              {reached && <span className="text-lg">✿</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
