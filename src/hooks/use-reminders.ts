import { useEffect, useRef } from "react";
import type { AppState } from "@/lib/storage";

const PLAYFUL_MESSAGES = [
  (n: string) => `${n} viftar med svansen — dags för en toa-paus? 🚽`,
  (n: string) => `Psst! ${n} undrar om du behöver kissa? 💧`,
  (n: string) => `${n} har en känsla… toa-dags? ✨`,
  (n: string) => `Hopp hopp! ${n} följer med till toa! 🦘`,
  (n: string) => `${n} viskar: "lyssna på magen!" 👂`,
  (n: string) => `Toa-tid! ${n} håller tummarna 🤞`,
];

const REMINDER_TITLES = [
  "Toa-koll! 🚽",
  "Psst, en liten påminnelse",
  "Din kompis kallar! 💖",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function fireReminderNotification(petName: string) {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission !== "granted") return false;
  try {
    const body = pick(PLAYFUL_MESSAGES)(petName);
    const title = pick(REMINDER_TITLES);
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "toilet-buddy-reminder",
    });
    return true;
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof Notification === "undefined") return "unsupported";
  if (
    Notification.permission === "granted" ||
    Notification.permission === "denied"
  ) {
    return Notification.permission;
  }
  return await Notification.requestPermission();
}

interface Args {
  state: AppState;
  onFired: () => void; // updates lastReminderTs
}

/**
 * Watches the clock once per minute. Fires a notification when:
 *  - a scheduled time has just passed (within the last minute), OR
 *  - it's been longer than fallbackHours since the last visit AND
 *    we haven't already nudged in the past fallbackHours.
 */
export function useReminders({ state, onFired }: Args) {
  const lastFiredRef = useRef<number | null>(state.lastReminderTs);

  useEffect(() => {
    lastFiredRef.current = state.lastReminderTs;
  }, [state.lastReminderTs]);

  useEffect(() => {
    if (!state.reminders.enabled) return;
    if (state.reminders.permission !== "granted") return;

    const check = () => {
      const now = new Date();
      const petName = state.petName || "Din kompis";

      // 1. scheduled times — fire if current minute matches
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const matched = state.reminders.times.includes(hhmm);

      // 2. fallback interval since last visit
      const lastVisit = state.visits[state.visits.length - 1];
      const lastVisitTs = lastVisit?.ts ?? 0;
      const hoursSinceVisit = (now.getTime() - lastVisitTs) / 36e5;
      const fallbackDue = hoursSinceVisit >= state.reminders.fallbackHours;

      // dedupe: don't fire twice within fallbackHours
      const lastFired = lastFiredRef.current ?? 0;
      const hoursSinceFired = (now.getTime() - lastFired) / 36e5;
      const cooledDown =
        hoursSinceFired >= Math.min(state.reminders.fallbackHours, 1);

      if ((matched || fallbackDue) && cooledDown) {
        const ok = fireReminderNotification(petName);
        if (ok) {
          lastFiredRef.current = now.getTime();
          onFired();
        }
      }
    };

    check(); // run immediately on mount/settings change
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [
    state.reminders.enabled,
    state.reminders.permission,
    state.reminders.times,
    state.reminders.fallbackHours,
    state.visits,
    state.petName,
    onFired,
  ]);
}
