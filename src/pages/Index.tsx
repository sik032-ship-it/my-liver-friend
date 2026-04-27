import { useEffect, useState } from "react";
import { MainScreen } from "@/components/screens/MainScreen";
import { CheckInDoneScreen } from "@/components/screens/CheckInDoneScreen";
import { MilestoneScreen } from "@/components/screens/MilestoneScreen";
import { MilestonesListScreen } from "@/components/screens/MilestonesListScreen";
import { CrisisScreen } from "@/components/screens/CrisisScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import {
  getSavePerDay,
  isMilestone,
  loadCrisisSession,
  loadState,
  recordMilestone,
  saveState,
  SobrietyState,
  todayKey,
  LastView,
} from "@/lib/sobriety";
import { initReminder, ReminderConfig } from "@/lib/reminder";

type View = LastView | "milestones-list" | "crisis" | "onboarding";

const Index = () => {
  const [state, setState] = useState<SobrietyState | null>(null);
  const [view, setView] = useState<View>("main");
  const [alreadyToday, setAlreadyToday] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);

    if (!loaded.onboarded) {
      setView("onboarding");
    } else {
      // 1) 위기 세션이 진행 중이면 무조건 그 화면으로 복원
      const crisis = loadCrisisSession();
      if (crisis) {
        setView("crisis");
      } else if (loaded.lastCheckInDate === todayKey() && loaded.lastView) {
        // 2) 오늘 이미 체크인 했으면 마지막 화면 복원
        setView(loaded.lastView);
      } else {
        setView("main");
      }
      // 알림 스케줄 시작
      initReminder();
    }

    // Trigger fade-in next tick
    requestAnimationFrame(() => setMounted(true));

    document.title = "간 지키고 돈 벌고 — 금주 챌린지";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "매일 30초 체크인으로 금주 여정을 즐기세요. 간을 지키고, 돈을 모으는 매일의 기록.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  if (!state) return null;

  const updateView = (v: View, nextState?: SobrietyState) => {
    setView(v);
    const base = nextState ?? state;
    // Only persist LastView types
    const persistView: LastView =
      v === "milestones-list" || v === "crisis" || v === "onboarding"
        ? "main"
        : (v as LastView);
    const merged: SobrietyState = { ...base, lastView: persistView };
    setState(merged);
    saveState(merged);
  };

  const handleOnboardingDone = (data: { savePerDay: number; reminder: ReminderConfig | null }) => {
    const next: SobrietyState = {
      ...state,
      savePerDay: data.savePerDay,
      onboarded: true,
      lastView: "main",
    };
    setState(next);
    saveState(next);
    setView("main");
    if (data.reminder?.enabled) initReminder();
  };

  const handleCheckIn = () => {
    const today = todayKey();
    if (state.lastCheckInDate === today) {
      setAlreadyToday(true);
      setTimeout(() => setAlreadyToday(false), 2200);
      return;
    }
    const perDay = getSavePerDay(state);
    const next: SobrietyState = {
      ...state,
      streak: state.streak + 1,
      totalDays: state.totalDays + 1,
      totalSaved: state.totalSaved + perDay,
      lastCheckInDate: today,
    };
    const reachedMilestone = isMilestone(next.totalDays);
    if (reachedMilestone) {
      recordMilestone(next.totalDays, next.totalSaved);
    }
    const nextView: LastView = reachedMilestone ? "milestone" : "done";
    updateView(nextView, next);
  };

  const handleRelapse = () => {
    const next: SobrietyState = { ...state, streak: 0 };
    setState(next);
    saveState(next);
  };

  return (
    <main
      className="transition-opacity duration-500"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <div key={view} className="view-enter">
        {view === "onboarding" && (
          <OnboardingScreen onDone={handleOnboardingDone} />
        )}
        {view === "main" && (
          <MainScreen
            state={state}
            onCheckIn={handleCheckIn}
            onRelapse={handleRelapse}
            onOpenMilestones={() => setView("milestones-list")}
            onCrisis={() => setView("crisis")}
          />
        )}
        {view === "crisis" && (
          <CrisisScreen
            state={state}
            onSurvive={handleCheckIn}
            onRelapse={() => {
              handleRelapse();
              setView("main");
            }}
            onClose={() => setView("main")}
          />
        )}
        {view === "done" && <CheckInDoneScreen state={state} onClose={() => updateView("main")} />}
        {view === "milestone" && (
          <MilestoneScreen state={state} onClose={() => updateView("main")} />
        )}
        {view === "milestones-list" && (
          <MilestonesListScreen state={state} onBack={() => setView("main")} />
        )}
      </div>

      {alreadyToday && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-foreground text-background text-sm font-semibold shadow-card animate-fade-in">
          오늘은 이미 체크인했어요 ✿
        </div>
      )}
    </main>
  );
};

export default Index;
