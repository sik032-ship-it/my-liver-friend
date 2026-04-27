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

// 오늘 몸 안에서 일어나는 변화 — placebo 강화용 디테일
// ---------- Body change message: variant pools per day-bucket ----------
export type BodyMsg = { id: string; headline: string; detail: string };

// 일자 버킷별 변형 풀 (id는 글로벌 유일)
const BODY_BUCKETS: { max: number; key: string; variants: BodyMsg[] }[] = [
  {
    max: 1, key: "d1",
    variants: [
      { id: "d1.a", headline: "지금 이 순간 간이 쉬고 있어요", detail: "마지막 술 8시간 후부터 간 효소 회복이 시작돼요." },
      { id: "d1.b", headline: "오늘 밤이 진짜 시작이에요", detail: "잠드는 동안 간이 가장 활발하게 회복해요." },
      { id: "d1.c", headline: "단 하루도 작지 않아요", detail: "혈중 알코올이 0이 되는 데 보통 24시간이면 충분해요." },
    ],
  },
  {
    max: 3, key: "d3",
    variants: [
      { id: "d3.a", headline: "수분이 다시 차오르고 있어요", detail: "탈수가 풀리면서 두통과 피곤이 줄어드는 시기예요." },
      { id: "d3.b", headline: "아침에 눈 뜨는 느낌이 다를 거예요", detail: "수면이 깊어지면서 기상 직후 피로가 줄어요." },
      { id: "d3.c", headline: "위장이 한숨 돌리는 중이에요", detail: "위벽 자극이 가라앉으면서 속쓰림이 잦아들어요." },
    ],
  },
  {
    max: 6, key: "d6",
    variants: [
      { id: "d6.a", headline: "수면의 질이 회복 중이에요", detail: "REM 수면이 정상화되면서 꿈이 선명해질 거예요." },
      { id: "d6.b", headline: "혈당이 안정되는 시기예요", detail: "에너지 기복이 줄고 식후 졸음이 덜해져요." },
      { id: "d6.c", headline: "얼굴 부기가 빠지고 있어요", detail: "체내 염증과 수분 정체가 줄어드는 구간이에요." },
    ],
  },
  {
    max: 10, key: "d10",
    variants: [
      { id: "d10.a", headline: "간세포가 다시 자라고 있어요", detail: "간은 재생 능력이 강한 장기예요. 매일 조금씩 회복해요." },
      { id: "d10.b", headline: "주변이 변화를 알아채는 시점", detail: "안색과 눈빛부터 사람들이 먼저 알아봐요." },
      { id: "d10.c", headline: "집중력이 한 단계 올라와요", detail: "전두엽 활동이 회복되면서 일 처리 속도가 빨라져요." },
    ],
  },
  {
    max: 14, key: "d14",
    variants: [
      { id: "d14.a", headline: "피부 톤이 달라지는 시기예요", detail: "혈류와 콜라겐 합성이 안정되면서 안색이 밝아져요." },
      { id: "d14.b", headline: "거울이 다르게 보일 거예요", detail: "2주 금주는 피부 수분과 탄력이 측정될 만큼 변해요." },
      { id: "d14.c", headline: "심장이 가벼워지는 시점", detail: "안정 시 심박수와 혈압이 의미있게 떨어져요." },
    ],
  },
  {
    max: 21, key: "d21",
    variants: [
      { id: "d21.a", headline: "뇌가 도파민 균형을 되찾고 있어요", detail: "기분 기복이 줄고, 작은 일에도 기쁨을 느끼게 돼요." },
      { id: "d21.b", headline: "습관이 새로 자리잡는 구간", detail: "21일은 새 행동이 자동화되기 시작하는 임계점이에요." },
      { id: "d21.c", headline: "불안이 가라앉는 시기예요", detail: "GABA 수용체가 안정되면서 잔잔한 평온이 와요." },
    ],
  },
  {
    max: 30, key: "d30",
    variants: [
      { id: "d30.a", headline: "지방간이 줄어드는 구간이에요", detail: "한 달 금주만으로도 지방간 수치가 의미있게 떨어져요." },
      { id: "d30.b", headline: "한 달, 몸이 다시 세팅됐어요", detail: "간 효소(ALT/AST)가 정상 범위로 회복되는 시점이에요." },
      { id: "d30.c", headline: "면역력이 회복되는 시기", detail: "감기와 염증 발생 빈도가 눈에 띄게 줄어요." },
    ],
  },
  {
    max: 60, key: "d60",
    variants: [
      { id: "d60.a", headline: "혈압과 콜레스테롤이 안정돼요", detail: "심혈관 위험도가 본격적으로 낮아지는 시점이에요." },
      { id: "d60.b", headline: "수면 구조가 완전히 회복됐어요", detail: "깊은 수면 시간이 늘면서 아침이 가뿐해져요." },
      { id: "d60.c", headline: "체중과 체지방이 안정 구간", detail: "빈 칼로리가 빠지면서 자연스럽게 체형이 잡혀요." },
    ],
  },
  {
    max: Infinity, key: "d100",
    variants: [
      { id: "d100.a", headline: "당신은 이제 '안 마시는 사람'이에요", detail: "간은 거의 완전히 회복됐고, 이제 그걸 지키는 단계예요." },
      { id: "d100.b", headline: "정체성이 바뀌었어요", detail: "이 정도면 술이 없는 일상이 더 자연스러워졌어요." },
      { id: "d100.c", headline: "암 발병 위험까지 낮아진 단계", detail: "장기 금주는 간/식도/구강암 위험을 의미있게 줄여요." },
    ],
  },
];

const bucketFor = (day: number) => BODY_BUCKETS.find((b) => day <= b.max)!;

// ---------- Thompson sampling for variant selection ----------
type VariantStat = { impressions: number; rewards: number };
type StatsMap = Record<string, VariantStat>;
const VARIANT_STATS_KEY = "sobriety_msg_stats_v1";
const VARIANT_TODAY_KEY = "sobriety_msg_today_v1";

const loadStats = (): StatsMap => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VARIANT_STATS_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveStats = (s: StatsMap) => {
  localStorage.setItem(VARIANT_STATS_KEY, JSON.stringify(s));
};

// Beta(α=rewards+1, β=impressions-rewards+1) sample using two gammas
// Approximation: use Math.random transformations (good enough for UI bandit)
const sampleBeta = (alpha: number, beta: number): number => {
  // Use ratio of two gamma samples; for small ints use Marsaglia-Tsang fallback to simple noisy mean
  const ga = sampleGamma(alpha);
  const gb = sampleGamma(beta);
  return ga / (ga + gb);
};

const sampleGamma = (k: number): number => {
  // Marsaglia and Tsang for k >= 1; for k < 1 use boost
  if (k < 1) return sampleGamma(k + 1) * Math.pow(Math.random(), 1 / k);
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x: number, v: number;
    do {
      const u1 = Math.random();
      const u2 = Math.random();
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // standard normal
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
};

// 하루에 같은 메시지를 보장 — 학습은 인상이 한번만 카운트되도록
type TodayPick = { date: string; bucket: string; id: string };

const loadTodayPick = (): TodayPick | null => {
  try {
    return JSON.parse(localStorage.getItem(VARIANT_TODAY_KEY) || "null");
  } catch { return null; }
};

const saveTodayPick = (p: TodayPick) => {
  localStorage.setItem(VARIANT_TODAY_KEY, JSON.stringify(p));
};

// 오늘 보여줄 메시지를 선택 (하루 1회 결정 후 고정)
export const pickBodyChange = (day: number): BodyMsg => {
  const bucket = bucketFor(day);
  const today = todayKey();
  const cached = loadTodayPick();
  if (cached && cached.date === today && cached.bucket === bucket.key) {
    const found = bucket.variants.find((v) => v.id === cached.id);
    if (found) return found;
  }
  const stats = loadStats();
  // Thompson sample
  let bestId = bucket.variants[0].id;
  let bestSample = -1;
  for (const v of bucket.variants) {
    const s = stats[v.id] ?? { impressions: 0, rewards: 0 };
    const alpha = s.rewards + 1;
    const beta = Math.max(0, s.impressions - s.rewards) + 1;
    const sample = sampleBeta(alpha, beta);
    if (sample > bestSample) {
      bestSample = sample;
      bestId = v.id;
    }
  }
  saveTodayPick({ date: today, bucket: bucket.key, id: bestId });
  return bucket.variants.find((v) => v.id === bestId)!;
};

// 노출 1회 기록 (하루 1회만 카운트되도록 별도 키로 가드)
const VARIANT_IMPRESSED_KEY = "sobriety_msg_imp_today_v1";
export const recordImpression = (id: string) => {
  const today = todayKey();
  const last = localStorage.getItem(VARIANT_IMPRESSED_KEY);
  if (last === `${today}:${id}`) return; // 이미 카운트
  const stats = loadStats();
  const s = stats[id] ?? { impressions: 0, rewards: 0 };
  s.impressions += 1;
  stats[id] = s;
  saveStats(stats);
  localStorage.setItem(VARIANT_IMPRESSED_KEY, `${today}:${id}`);
};

// 보상(좋아요/공감) 기록. 하루 1회만 카운트.
const VARIANT_REWARDED_KEY = "sobriety_msg_rwd_today_v1";
export const recordReward = (id: string) => {
  const today = todayKey();
  const last = localStorage.getItem(VARIANT_REWARDED_KEY);
  if (last === `${today}:${id}`) return;
  const stats = loadStats();
  const s = stats[id] ?? { impressions: 0, rewards: 0 };
  s.rewards += 1;
  stats[id] = s;
  saveStats(stats);
  localStorage.setItem(VARIANT_REWARDED_KEY, `${today}:${id}`);
};

export const isRewardedToday = (id: string): boolean => {
  const today = todayKey();
  return localStorage.getItem(VARIANT_REWARDED_KEY) === `${today}:${id}`;
};

// 기존 시그니처 호환 — 학습 없는 단순 호출용
export const bodyChange = (day: number) => pickBodyChange(day);

// 간 회복도 (0~1) — 시각 게이지용. 100일 전후로 1.0에 수렴
export const recoveryProgress = (day: number): number => {
  if (day <= 0) return 0;
  // 점근선: 100일에 약 0.95, 그 이후로 1에 수렴
  const v = 1 - Math.exp(-day / 35);
  return Math.min(1, v);
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
