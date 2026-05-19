// State management and related logic for Toilet Buddy app (LocalStorage, points, levels, evolution, etc)
import { streakStage } from "./pet";

export type VisitType = "pee" | "poop" | "both";
export type VisitTrigger = "self" | "reminder";
export type WipeMode = "self" | "help" | "na";
export type AccidentType = "pee" | "poop";

export interface Visit {
  id: string;
  ts: number;
  type: VisitType;
  trigger: VisitTrigger;
  wipe?: WipeMode;
  points: number;
}

export interface Accident {
  id: string;
  ts: number;
  type: AccidentType;
}

export type PetSpecies = "dragon" | "monster" | "alien" | "blob";

export interface ReminderSettings {
  enabled: boolean;
  times: string[]; // "HH:MM" 24h, sorted
  fallbackHours: number; // nudge if no visit for this many hours
  permission: NotificationPermission | "unsupported";
}

export interface ParentPin {
  // SHA-256 hex of the 4-digit pin. Kid-proof, not adult-proof.
  hash: string | null;
}

export interface AppState {
  petSpecies: PetSpecies;
  petName: string;
  points: number;
  level: number;
  visits: Visit[];
  accidents: Accident[];
  unlocked: string[]; // accessory ids
  equipped: string[];
  lastReminderTs: number | null;
  lastFedTs: number | null;
  streakDays: number;
  lastSelfVisitDay: string | null; // YYYY-MM-DD
  reminders: ReminderSettings;
  parentPin: ParentPin;
  evolutionThresholdDays: number;
  maxEvolutionStage: 0 | 1 | 2;
}

const KEY = "toilet-buddy-v1";

const initial: AppState = {
  petSpecies: "dragon",
  petName: "Buddy",
  points: 0,
  level: 1,
  visits: [],
  accidents: [],
  unlocked: [],
  equipped: [],
  lastReminderTs: null,
  lastFedTs: null,
  streakDays: 0,
  lastSelfVisitDay: null,
  reminders: {
    enabled: false,
    times: ["08:00", "12:00", "15:00", "19:00"],
    fallbackHours: 3,
    permission:
      typeof Notification !== "undefined"
        ? Notification.permission
        : "unsupported",
  },
  parentPin: { hash: null },
  evolutionThresholdDays: 5,
  maxEvolutionStage: 0,
};

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function deletePet(state: AppState): AppState {
  return {
    ...state,
    petSpecies: "dragon",
    petName: "Buddy",
    equipped: [],
  };
}

export function clearHistory(state: AppState): AppState {
  return { ...state, visits: [], accidents: [] };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    return {
      ...initial,
      ...parsed,
      reminders: { ...initial.reminders, ...(parsed.reminders ?? {}) },
      parentPin: { ...initial.parentPin, ...(parsed.parentPin ?? {}) },
    };
  } catch {
    return initial;
  }
}

export function saveState(s: AppState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function pointsForLevel(level: number) {
  return level * 50;
}

export function levelFromPoints(points: number) {
  let lvl = 1;
  let remaining = points;
  while (remaining >= pointsForLevel(lvl)) {
    remaining -= pointsForLevel(lvl);
    lvl++;
  }
  return { level: lvl, intoLevel: remaining, needed: pointsForLevel(lvl) };
}

export function pointsForVisit(
  type: VisitType,
  trigger: VisitTrigger,
  wipe: WipeMode = "na",
): number {
  const base = type === "both" ? 15 : type === "poop" ? 10 : 5;
  const triggerMul = trigger === "self" ? base * 3 : base;
  const wipeBonus = wipe === "self" ? 5 : 0;
  return triggerMul + wipeBonus;
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

export function addVisit(
  state: AppState,
  type: VisitType,
  trigger: VisitTrigger,
  wipe: WipeMode = "na",
): AppState {
  const points = pointsForVisit(type, trigger, wipe);
  const visit: Visit = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    type,
    trigger,
    wipe,
    points,
  };

  let streakDays = state.streakDays;
  let lastSelfVisitDay = state.lastSelfVisitDay;
  const today = todayKey();

  // Update streak on any visit (self or reminder) - counts as accident-free day
  if (lastSelfVisitDay === null) {
    // First ever visit
    streakDays = 1;
  } else if (lastSelfVisitDay === today) {
    // Already have a visit logged today, don't change streak
    // (do nothing)
  } else {
    const dayGap = daysBetween(lastSelfVisitDay, today);
    if (dayGap === 1) {
      // Consecutive day - continue the streak
      streakDays = state.streakDays + 1;
    } else {
      // Gap of 2+ days or negative (time travel?) - reset streak
      streakDays = 1;
    }
  }
  lastSelfVisitDay = today;

  // Update maxEvolutionStage based on accident-free streak
  console.log("addVisit - before streakStage:", {
    state: state.maxEvolutionStage,
    accidents: state.accidents.length,
  });
  const maxEvolutionStage = Math.max(
    state.maxEvolutionStage,
    streakStage({
      ...state,
      streakDays,
      lastSelfVisitDay,
    }),
  ) as AppState["maxEvolutionStage"];
  console.log("addVisit - after streakStage:", { maxEvolutionStage });

  return {
    ...state,
    visits: [...state.visits, visit],
    points: state.points + points,
    streakDays,
    lastSelfVisitDay,
    maxEvolutionStage,
  };
}

export function addAccident(state: AppState, type: AccidentType): AppState {
  const accident: Accident = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    type,
  };
  const newState = {
    ...state,
    accidents: [...state.accidents, accident],
    streakDays: 0, // Reset accident-free streak
  };
  // maxEvolutionStage should never decrease, so use Math.max
  const newMaxStage = streakStage(newState);
  return {
    ...newState,
    maxEvolutionStage: Math.max(
      state.maxEvolutionStage,
      newMaxStage,
    ) as AppState["maxEvolutionStage"],
  };
}

export function feedPet(state: AppState, cost: number): AppState | null {
  if (state.points < cost) return null;
  return {
    ...state,
    points: state.points - cost,
    lastFedTs: Date.now(),
  };
}

export function unlockAccessory(
  state: AppState,
  id: string,
  cost: number,
): AppState | null {
  if (state.unlocked.includes(id)) return null;
  if (state.points < cost) return null;
  return {
    ...state,
    points: state.points - cost,
    unlocked: [...state.unlocked, id],
  };
}

export function toggleEquip(
  state: AppState,
  id: string,
  slot: string,
  slotIds: string[],
): AppState {
  // Only one item per slot. slotIds = ids of all accessories in this slot.
  const isEquipped = state.equipped.includes(id);
  const withoutSlot = state.equipped.filter((eid) => !slotIds.includes(eid));
  return {
    ...state,
    equipped: isEquipped ? withoutSlot : [...withoutSlot, id],
  };
}
