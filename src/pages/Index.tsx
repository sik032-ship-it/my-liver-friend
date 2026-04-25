import { useEffect, useState } from "react";
import { MainScreen } from "@/components/screens/MainScreen";
import { CheckInDoneScreen } from "@/components/screens/CheckInDoneScreen";
import { MilestoneScreen } from "@/components/screens/MilestoneScreen";
import {
  isMilestone,
  loadState,
  saveState,
  SAVE_PER_DAY,
  SobrietyState,
  todayKey,
} from "@/lib/sobriety";

type View = "main" | "done" | "milestone";

const Index = () => {
  const [state, setState] = useState<SobrietyState | null>(null);
  const [view, setView] = useState<View>("main");
  const [alreadyToday, setAlreadyToday] = useState(false);

  useEffect(() => {
    setState(loadState());
    document.title = "간 지키고 돈 벌고 — 금주 챌린지";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "매일 30초 체크인으로 금주 여정을 즐기세요. 간을 지키고, 돈을 모으는 매일의 기록.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "매일 30초 체크인으로 금주 여정을 즐기세요. 간을 지키고, 돈을 모으는 매일의 기록.";
      document.head.appendChild(m);
    }
  }, []);

  if (!state) return null;

  const handleCheckIn = () => {
    const today = todayKey();
    if (state.lastCheckInDate === today) {
      setAlreadyToday(true);
      setTimeout(() => setAlreadyToday(false), 2200);
      return;
    }
    const next: SobrietyState = {
      streak: state.streak + 1,
      totalDays: state.totalDays + 1,
      totalSaved: state.totalSaved + SAVE_PER_DAY,
      lastCheckInDate: today,
    };
    setState(next);
    saveState(next);
    setView(isMilestone(next.totalDays) ? "milestone" : "done");
  };

  const handleRelapse = () => {
    const next: SobrietyState = { ...state, streak: 0 };
    setState(next);
    saveState(next);
  };

  return (
    <main>
      {view === "main" && (
        <MainScreen state={state} onCheckIn={handleCheckIn} onRelapse={handleRelapse} />
      )}
      {view === "done" && <CheckInDoneScreen state={state} onClose={() => setView("main")} />}
      {view === "milestone" && (
        <MilestoneScreen state={state} onClose={() => setView("main")} />
      )}

      {alreadyToday && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-foreground text-background text-sm font-semibold shadow-card animate-fade-in">
          오늘은 이미 체크인했어요 ✿
        </div>
      )}
    </main>
  );
};

export default Index;
