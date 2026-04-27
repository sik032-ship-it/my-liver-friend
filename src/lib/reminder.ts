// 매일 같은 시간 브라우저 알림을 보내는 가벼운 스케줄러.
// PWA/서비스워커 없이 동작 — 앱이 열려있는 동안만 트리거.
// 닫혀있을 때를 대비해 다음 세션 시작 시 "놓친 알림"도 한 번 표시.

const REMINDER_KEY = "sobriety_reminder_v1";
const LAST_FIRED_KEY = "sobriety_reminder_last_v1";

export type ReminderConfig = {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
};

export const loadReminder = (): ReminderConfig | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveReminder = (c: ReminderConfig) => {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(c));
};

const todayKeyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fireNotification = () => {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("30초만요 ✿", {
      body: "오늘도 안 마셨다면 체크인 한 번. 간이 박수치고 있어요.",
      tag: "sobriety-daily",
    });
    localStorage.setItem(LAST_FIRED_KEY, todayKeyLocal());
  } catch {
    // ignore
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return await Notification.requestPermission();
};

let timer: number | null = null;

const scheduleNext = () => {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  const cfg = loadReminder();
  if (!cfg || !cfg.enabled) return;

  const now = new Date();
  const target = new Date();
  target.setHours(cfg.hour, cfg.minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    // 오늘 시간이 지났으면 내일로
    target.setDate(target.getDate() + 1);
  }
  const delay = target.getTime() - now.getTime();

  timer = window.setTimeout(() => {
    fireNotification();
    scheduleNext();
  }, delay);
};

// 앱 시작 시 호출 — 놓친 알림 회수 + 스케줄 시작
export const initReminder = () => {
  const cfg = loadReminder();
  if (!cfg || !cfg.enabled) return;

  // 오늘 알림 시각이 이미 지났고 오늘 한 번도 안 쐈으면 즉시 한 번
  const now = new Date();
  const target = new Date();
  target.setHours(cfg.hour, cfg.minute, 0, 0);
  const lastFired = localStorage.getItem(LAST_FIRED_KEY);
  if (target.getTime() <= now.getTime() && lastFired !== todayKeyLocal()) {
    fireNotification();
  }
  scheduleNext();
};
