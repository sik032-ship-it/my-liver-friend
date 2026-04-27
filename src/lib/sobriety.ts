export const STORAGE_KEY = "sobriety_state_v1";
export const SAVE_PER_DAY = 5000;
export const MILESTONES = [7, 14, 30, 60, 100];

export type LastView = "main" | "done" | "milestone";

export type SobrietyState = {
  streak: number;
  totalDays: number;
  totalSaved: number;
  lastCheckInDate: string | null; // YYYY-MM-DD
  lastView?: LastView;
};

export const initialState: SobrietyState = {
  streak: 0,
  totalDays: 0,
  totalSaved: 0,
  lastCheckInDate: null,
  lastView: "main",
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

export const timeGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "좋은 아침이에요, 오늘도 맑은 하루 ☀";
  if (h >= 12 && h < 18) return "오후도 힘내요 ✿";
  if (h >= 18 && h < 23) return "오늘 하루도 잘 버텼어요 ☾";
  return "이 시간에도 찾아와줬네요 ✦";
};

export type HealthStage = "pale" | "recovering" | "vibrant" | "sparkle" | "halo";

export const healthStage = (days: number): HealthStage => {
  if (days <= 3) return "pale";
  if (days <= 7) return "recovering";
  if (days <= 14) return "vibrant";
  if (days <= 30) return "sparkle";
  return "halo";
};

export type GiftMsg = { threshold: number; text: string };
const GIFTS: GiftMsg[] = [
  { threshold: 5, text: "카페라떼 한 잔 살 수 있어요 ☕" },
  { threshold: 10, text: "맛있는 점심 한 끼 값 🍜" },
  { threshold: 20, text: "좋아하는 사람에게 작은 선물 🎁" },
  { threshold: 30, text: "새 운동화 한 켤레 👟" },
  { threshold: 60, text: "주말 여행 한 번 🚗" },
  { threshold: 100, text: "나를 위한 특별한 경험 ✨" },
];

export const currentGift = (days: number): string | null => {
  let msg: string | null = null;
  for (const g of GIFTS) {
    if (days >= g.threshold) msg = g.text;
  }
  return msg;
};

// Companion counter — simulated, stable per day
export const companionCount = (): { active: number; checkedIn: number } => {
  const d = todayKey();
  let seed = 0;
  for (let i = 0; i < d.length; i++) seed = (seed * 31 + d.charCodeAt(i)) >>> 0;
  const rand = (mod: number, salt: number) => ((seed ^ (salt * 2654435761)) >>> 0) % mod;
  const active = 12000 + rand(4000, 1);
  const checkedIn = 3200 + rand(1500, 7);
  return { active, checkedIn };
};

// Milestone history
export type MilestoneRecord = { day: number; date: string; saved: number };
export const MILESTONE_HISTORY_KEY = "sobriety_milestones_v1";

export const loadMilestones = (): MilestoneRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MILESTONE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const recordMilestone = (day: number, saved: number) => {
  const list = loadMilestones();
  if (list.find((m) => m.day === day)) return;
  list.push({ day, date: todayKey(), saved });
  localStorage.setItem(MILESTONE_HISTORY_KEY, JSON.stringify(list));
};

// ---------- Crisis loss projection ----------
export type CrisisLoss = {
  daysLost: number;          // streak 손실
  moneyLost: number;         // 오늘 밤 사라지는 돈 (한 번의 음주 비용)
  nextMilestoneDay: number | null;
  daysToNextMilestone: number | null;
  weeklyProjection: number;  // 일주일 환산
  yearlyProjection: number;  // 연환산 (주 2회 가정)
  hoursInvested: number;     // 30초 체크인 × streak (체감용 노력 시간)
};

const SINGLE_DRINK_COST = 50000; // 한 번 술자리 평균 비용 (만원 단위 체감)

export const computeCrisisLoss = (state: SobrietyState): CrisisLoss => {
  const streak = state.streak;
  const next = nextMilestone(state.totalDays);
  return {
    daysLost: streak,
    moneyLost: SINGLE_DRINK_COST,
    nextMilestoneDay: next,
    daysToNextMilestone: next ? next - state.totalDays : null,
    weeklyProjection: SINGLE_DRINK_COST * 2,
    yearlyProjection: SINGLE_DRINK_COST * 2 * 52,
    hoursInvested: Math.round((streak * 30) / 60), // 분 단위
  };
};

// ---------- Crisis session (resumable) ----------
export const CRISIS_SESSION_KEY = "sobriety_crisis_session_v1";

export type CrisisStep = "truth" | "alt" | "timer" | "won" | "fail";

export type CrisisSession = {
  step: CrisisStep;
  truthIdx: number;
  altIdx: number;
  // Timer is anchor-based — survives backgrounding
  timerEndAt: number | null; // epoch ms when 5min ends
  startedAt: number;         // epoch ms when crisis opened
};

export const loadCrisisSession = (): CrisisSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CRISIS_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as CrisisSession;
    // Discard sessions older than 1 hour
    if (Date.now() - s.startedAt > 60 * 60 * 1000) return null;
    return s;
  } catch {
    return null;
  }
};

export const saveCrisisSession = (s: CrisisSession) => {
  localStorage.setItem(CRISIS_SESSION_KEY, JSON.stringify(s));
};

export const clearCrisisSession = () => {
  localStorage.removeItem(CRISIS_SESSION_KEY);
};
