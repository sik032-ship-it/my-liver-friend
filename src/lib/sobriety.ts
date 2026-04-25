export const STORAGE_KEY = "sobriety_state_v1";
export const SAVE_PER_DAY = 5000;
export const MILESTONES = [7, 14, 30, 60, 100];

export type SobrietyState = {
  streak: number;
  totalDays: number;
  totalSaved: number;
  lastCheckInDate: string | null; // YYYY-MM-DD
};

export const initialState: SobrietyState = {
  streak: 0,
  totalDays: 0,
  totalSaved: 0,
  lastCheckInDate: null,
};

export const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayLabel = () => {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
};

export const loadState = (): SobrietyState => {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
};

export const saveState = (s: SobrietyState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

export const isMilestone = (n: number) => MILESTONES.includes(n);

export const nextMilestone = (n: number) => MILESTONES.find((m) => m > n) ?? null;

export const dayMessage = (day: number): string => {
  const map: Record<number, string> = {
    1: "첫 걸음을 떼었어요.",
    3: "오늘 아침 머리가 맑았나요?",
    5: "손이 덜 떨리고, 숙면이 깊어지고 있어요.",
    7: "음식 맛이 달라진 거 느꼈어요?",
    10: "주변 사람들이 뭔가 달라졌다고 느낄 거예요.",
    14: "거울 한번 보세요. 피부가 달라지고 있어요.",
    21: "습관이 바뀌기 시작하는 시점이에요.",
    30: "술자리 대신 생긴 시간에 뭘 했는지 떠올려 보세요.",
    60: "이제 '안 마시는 사람'이 되어가고 있어요.",
    100: "100일. 이건 진짜 대단한 거예요.",
  };
  return map[day] ?? "오늘도 한 걸음 더.";
};

export const formatWon = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
