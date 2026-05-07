import type { AppState, PetSpecies } from "./storage";

export type Mood = "happy" | "sleepy" | "hungry" | "sad" | "excited";

export function computeMood(state: AppState): Mood {
  const last = state.visits[state.visits.length - 1];
  const fedHours = state.lastFedTs
    ? (Date.now() - state.lastFedTs) / 36e5
    : Infinity;
  // Recently fed → instant excited boost
  if (fedHours < 0.25) return "excited";
  if (!last) return "hungry";
  const hours = (Date.now() - last.ts) / 36e5;
  if (hours < 0.5) return "excited";
  if (hours < 2) return "happy";
  if (hours < 4) return "sleepy";
  // If fed within last few hours, skip "hungry"
  if (hours < 6) return fedHours < 3 ? "sleepy" : "hungry";
  return fedHours < 4 ? "sleepy" : "sad";
}

export function moodMessage(mood: Mood, name: string): string {
  switch (mood) {
    case "excited":
      return `Wow, ${name} mår jättebra! 🎉`;
    case "happy":
      return `${name} är glad och studsig! 😊`;
    case "sleepy":
      return `${name} börjar bli lite sömnig...`;
    case "hungry":
      return `${name} är sugen på poäng!`;
    case "sad":
      return `${name} saknar dig. En toabesök skulle hjälpa!`;
  }
}

export const PET_OPTIONS: {
  id: PetSpecies;
  name: string;
  emoji: string;
  color: string;
}[] = [
  { id: "dragon", name: "Drako", emoji: "🐲", color: "hsl(140 70% 55%)" },
  { id: "monster", name: "Mungo", emoji: "👾", color: "hsl(280 70% 65%)" },
  { id: "alien", name: "Zip", emoji: "👽", color: "hsl(180 70% 55%)" },
  { id: "blob", name: "Blob", emoji: "🟡", color: "hsl(45 100% 60%)" },
];

// Three evolution stages per species. Stage 0 = baby, 1 = teen, 2 = adult.
export const EVOLUTION_EMOJI: Record<PetSpecies, [string, string, string]> = {
  dragon: ["🥚", "🐲", "🐉"],
  monster: ["🫧", "👾", "🤖"],
  alien: ["🛸", "👽", "🧞"],
  blob: ["🟡", "🟠", "🔴"],
};

export const EVOLUTION_LABEL: [string, string, string] = [
  "Bebis",
  "Tonåring",
  "Vuxen",
];

export type EvolutionStage = 0 | 1 | 2;

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Count consecutive recent days (ending today) without any logged accident.
 * Today counts if accident-free so far.
 */
export function accidentFreeStreak(state: AppState): number {
  const accidentDays = new Set(state.accidents.map((a) => dayKey(a.ts)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    if (accidentDays.has(dayKey(d.getTime()))) break;
    streak++;
  }
  return streak;
}

/** Stage purely based on current accident-free streak (can go down). */
export function streakStage(state: AppState): EvolutionStage {
  const threshold = Math.max(1, state.evolutionThresholdDays || 5);
  const streak = accidentFreeStreak(state);
  if (streak >= threshold * 2) return 2;
  if (streak >= threshold) return 1;
  return 0;
}

/**
 * Effective stage shown to the child. Once a stage is reached it is never lost,
 * so a single accident doesn't undo the child's progress.
 */
// export function evolutionStage(state: AppState): EvolutionStage {
//   const current = streakStage(state);
//   const max = (state.maxEvolutionStage ?? 0) as EvolutionStage;
// }

export function getStageInfo(maxEvolutionStage: number): {
  name: string;
  stage: EvolutionStage;
} {
  const stage = (maxEvolutionStage ?? 0) as EvolutionStage;
  const name = EVOLUTION_LABEL[stage] || "Bebis";
  return { name, stage };
}

// import type { AppState, PetSpecies } from "./storage";

// export type Mood = "happy" | "sleepy" | "hungry" | "sad" | "excited";

// export function computeMood(state: AppState): Mood {
//   const last = state.visits[state.visits.length - 1];
//   const fedHours = state.lastFedTs
//     ? (Date.now() - state.lastFedTs) / 36e5
//     : Infinity;
//   // Recently fed → instant excited boost
//   if (fedHours < 0.25) return "excited";
//   if (!last) return "hungry";
//   const hours = (Date.now() - last.ts) / 36e5;
//   if (hours < 0.5) return "excited";
//   if (hours < 2) return "happy";
//   if (hours < 4) return "sleepy";
//   // If fed within last few hours, skip "hungry"
//   if (hours < 6) return fedHours < 3 ? "sleepy" : "hungry";
//   return fedHours < 4 ? "sleepy" : "sad";
// }

// export function moodMessage(mood: Mood, name: string): string {
//   switch (mood) {
//     case "excited":
//       return `Wow, ${name} mår jättebra! 🎉`;
//     case "happy":
//       return `${name} är glad och studsig! 😊`;
//     case "sleepy":
//       return `${name} börjar bli lite sömnig...`;
//     case "hungry":
//       return `${name} är sugen på poäng!`;
//     case "sad":
//       return `${name} saknar dig. En toabesök skulle hjälpa!`;
//   }
// }

// export const PET_OPTIONS: {
//   id: PetSpecies;
//   name: string;
//   emoji: string;
//   color: string;
// }[] = [
//   { id: "dragon", name: "Drako", emoji: "🐲", color: "hsl(140 70% 55%)" },
//   { id: "monster", name: "Mungo", emoji: "👾", color: "hsl(280 70% 65%)" },
//   { id: "alien", name: "Zip", emoji: "👽", color: "hsl(180 70% 55%)" },
//   { id: "blob", name: "Blob", emoji: "🟡", color: "hsl(45 100% 60%)" },
// ];

// // Three evolution stages per species. Stage 0 = baby, 1 = teen, 2 = adult.
// export const EVOLUTION_EMOJI: Record<PetSpecies, [string, string, string]> = {
//   dragon: ["🥚", "🐲", "🐉"],
//   monster: ["🫧", "👾", "🤖"],
//   alien: ["🛸", "👽", "🧞"],
//   blob: ["🟡", "🟠", "🔴"],
// };

// export const EVOLUTION_LABEL: [string, string, string] = [
//   "Bebis",
//   "Tonåring",
//   "Vuxen",
// ];

// export type EvolutionStage = 0 | 1 | 2;

// const dayKey = (ts: number) => {
//   const d = new Date(ts);
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// };

// /**
//  * Count consecutive recent days (ending today) without any logged accident.
//  * Today counts if accident-free so far.
//  */
// export function accidentFreeStreak(state: AppState): number {
//   const accidentDays = new Set(state.accidents.map((a) => dayKey(a.ts)));
//   let streak = 0;
//   const today = new Date();
//   for (let i = 0; i < 365; i++) {
//     const d = new Date(today.getTime() - i * 86400000);
//     if (accidentDays.has(dayKey(d.getTime()))) break;
//     streak++;
//   }
//   return streak;
// }

// /** Stage purely based on current accident-free streak (can go down). */
// export function streakStage(state: AppState): EvolutionStage {
//   const threshold = Math.max(1, state.evolutionThresholdDays || 5);
//   const streak = accidentFreeStreak(state);
//   if (streak >= threshold * 2) return 2;
//   if (streak >= threshold) return 1;
//   return 0;
// }

// /**
//  * Effective stage shown to the child. Once a stage is reached it is never lost,
//  * so a single accident doesn't undo the child's progress.
//  */
// export function evolutionStage(state: AppState): EvolutionStage {
//   const current = streakStage(state);
//   const max = (state.maxEvolutionStage ?? 0) as EvolutionStage;
//   return (current > max ? current : max) as EvolutionStage;
// }
