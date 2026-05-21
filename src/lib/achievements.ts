import type { AppState } from "./storage";
import { accidentFreeStreak } from "./pet";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress: number; // 0-1
  current: number;
  target: number;
}

interface Def {
  id: string;
  name: string;
  description: string;
  emoji: string;
  target: number;
  value: (s: AppState, ctx: Ctx) => number;
}

interface Ctx {
  selfVisits: number;
  wipedSelf: number;
  poop: number;
  total: number;
  accidents: number;
  streakNoAcc: number;
}

const DEFS: Def[] = [
  // Toabesök
  {
    id: "first-visit",
    name: "Första steget",
    description: "Logga ditt första toabesök",
    emoji: "🚽",
    target: 1,
    value: (_, c) => c.total,
  },
  {
    id: "ten-visits",
    name: "Toakompis",
    description: "10 toabesök",
    emoji: "🥉",
    target: 10,
    value: (_, c) => c.total,
  },
  {
    id: "fifty-visits",
    name: "Toahjälte",
    description: "50 toabesök",
    emoji: "🥈",
    target: 50,
    value: (_, c) => c.total,
  },
  {
    id: "hundred-visits",
    name: "Toamästare",
    description: "100 toabesök",
    emoji: "🥇",
    target: 100,
    value: (_, c) => c.total,
  },
  // Självständighet
  {
    id: "self-1",
    name: "På egen hand",
    description: "Gå på toa själv 1 gång",
    emoji: "🦸",
    target: 1,
    value: (_, c) => c.selfVisits,
  },
  {
    id: "self-25",
    name: "Självgående",
    description: "25 självgångar",
    emoji: "🚀",
    target: 25,
    value: (_, c) => c.selfVisits,
  },
  {
    id: "wipe-10",
    name: "Torkproffs",
    description: "Torka själv 10 gånger",
    emoji: "🧻",
    target: 10,
    value: (_, c) => c.wipedSelf,
  },
  // Bajs
  {
    id: "poop-10",
    name: "Bajsbragd",
    description: "10 bajs på toa",
    emoji: "💩",
    target: 10,
    value: (_, c) => c.poop,
  },
  // Dagliga streaks
  {
    id: "streak-3",
    name: "Tre i rad",
    description: "3 dagars streak",
    emoji: "🔥",
    target: 3,
    value: (s) => s.streakDays,
  },
  {
    id: "streak-7",
    name: "Veckokung",
    description: "7 dagars streak",
    emoji: "👑",
    target: 7,
    value: (s) => s.streakDays,
  },
  {
    id: "streak-30",
    name: "Månadshjälte",
    description: "30 dagars streak",
    emoji: "🏆",
    target: 30,
    value: (s) => s.streakDays,
  },
  // Olycksfria streaks
  {
    id: "noacc-5",
    name: "Torr & nöjd",
    description: "5 olycksfria dagar",
    emoji: "🌱",
    target: 5,
    value: (_, c) => c.streakNoAcc,
  },
  {
    id: "noacc-14",
    name: "Två torra veckor",
    description: "14 olycksfria dagar",
    emoji: "🌿",
    target: 14,
    value: (_, c) => c.streakNoAcc,
  },
  {
    id: "noacc-30",
    name: "Olyckslös månad",
    description: "30 olycksfria dagar",
    emoji: "🌟",
    target: 30,
    value: (_, c) => c.streakNoAcc,
  },
  // Olyckor – ärlighet
  {
    id: "honest",
    name: "Ärlig kompis",
    description: "Logga en olycka – det är okej!",
    emoji: "🤗",
    target: 1,
    value: (_, c) => c.accidents,
  },
];

export function computeAchievements(state: AppState): Achievement[] {
  const visits = state.visits;
  const ctx: Ctx = {
    selfVisits: visits.filter((v) => v.trigger === "self").length,
    wipedSelf: visits.filter((v) => v.wipe === "self").length,
    poop: visits.filter((v) => v.type === "poop" || v.type === "both").length,
    total: visits.length,
    accidents: state.accidents.length,
    streakNoAcc: accidentFreeStreak(state),
  };
  return DEFS.map((d) => {
    const current = d.value(state, ctx);
    const unlocked = current >= d.target;
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      emoji: d.emoji,
      unlocked,
      current: Math.min(current, d.target),
      target: d.target,
      progress: Math.max(0, Math.min(1, current / d.target)),
    };
  });
}
