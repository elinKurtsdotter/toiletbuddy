import { PET_OPTIONS, EVOLUTION_EMOJI, type EvolutionStage } from "@/lib/pet";
import type { Mood } from "@/lib/pet";
import type { PetSpecies } from "@/lib/storage";
import { getAccessory } from "@/lib/accessories";
import { cn } from "@/lib/utils";

interface PetProps {
  species: PetSpecies;
  mood: Mood;
  celebrating?: boolean;
  nudging?: boolean;
  size?: "md" | "lg";
  equipped?: string[];
  stage?: EvolutionStage;
}

const moodRing: Record<Mood, string> = {
  excited: "ring-star",
  happy: "ring-happy",
  sleepy: "ring-sleepy",
  hungry: "ring-hungry",
  sad: "ring-sad",
};

const moodFace: Record<Mood, string> = {
  excited: "✨",
  happy: "",
  sleepy: "💤",
  hungry: "🍽️",
  sad: "💧",
};

export function Pet({
  species,
  mood,
  celebrating,
  nudging,
  size = "lg",
  equipped = [],
  stage = 0,
}: PetProps) {
  const opt = PET_OPTIONS.find((p) => p.id === species) ?? PET_OPTIONS[0];
  const stageEmoji = EVOLUTION_EMOJI[opt.id]?.[stage] ?? opt.emoji;
  // const stageName = stage === 0 ? "bebis" : stage === 2 ? "adult" : "child";
  // Babies look smaller, adults bigger
  const stageScale = stage === 0 ? "scale-75" : stage === 2 ? "scale-110" : "";
  const dim = size === "lg" ? "w-full h-48 text-[7rem]" : "w-28 h-28 text-6xl";

  const items = equipped.map(getAccessory).filter(Boolean) as NonNullable<
    ReturnType<typeof getAccessory>
  >[];
  const hat = items.find((i) => i.slot === "hat");
  const face = items.find((i) => i.slot === "face");
  const neck = items.find((i) => i.slot === "neck");
  const side = items.find((i) => i.slot === "side");

  const accessoryBase = size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "w-full rounded-xl bg-card flex items-center justify-center pet-shadow border-4 border-green-500 transition-all relative box-border",
          dim,
          moodRing[mood],
          celebrating
            ? "animate-celebrate"
            : nudging
              ? "animate-shake"
              : mood === "sleepy"
                ? ""
                : "animate-bounce-soft",
        )}
        style={{
          background: `radial-gradient(circle at 50% 30%, white, ${opt.color} 120%)`,
        }}>
        <span
          className={cn(
            "drop-shadow-sm select-none transition-transform",
            stageScale,
          )}
          role="img"
          aria-label={opt.name}>
          {stageEmoji}
        </span>
        {face && (
          <span
            className={cn("absolute select-none drop-shadow", accessoryBase)}
            style={{ top: "38%" }}
            aria-label={face.name}>
            {face.emoji}
          </span>
        )}
      </div>

      {hat && (
        <span
          className={cn(
            "absolute select-none drop-shadow-md",
            size === "lg"
              ? "text-5xl -top-6 left-1/2 -translate-x-1/2"
              : "text-3xl -top-4 left-1/2 -translate-x-1/2",
          )}
          aria-label={hat.name}>
          {hat.emoji}
        </span>
      )}
      {neck && (
        <span
          className={cn(
            "absolute select-none drop-shadow",
            size === "lg"
              ? "text-3xl bottom-2 left-1/2 -translate-x-1/2"
              : "text-xl bottom-1 left-1/2 -translate-x-1/2",
          )}
          aria-label={neck.name}>
          {neck.emoji}
        </span>
      )}
      {side && (
        <span
          className={cn(
            "absolute select-none drop-shadow animate-float",
            size === "lg"
              ? "text-3xl -right-3 top-2"
              : "text-xl -right-2 top-1",
          )}
          aria-label={side.name}>
          {side.emoji}
        </span>
      )}

      {moodFace[mood] && (
        <div className="absolute -top-2 -left-2 text-3xl animate-float">
          {moodFace[mood]}
        </div>
      )}
    </div>
  );
}

// import { PET_OPTIONS } from "@/lib/pet";
// import type { Mood } from "@/lib/pet";
// import type { PetSpecies } from "@/lib/storage";
// import { getAccessory } from "@/lib/accessories";
// import { cn } from "@/lib/utils";

// interface PetProps {
//   species: PetSpecies;
//   mood: Mood;
//   celebrating?: boolean;
//   nudging?: boolean;
//   size?: "md" | "lg";
//   equipped?: string[];
// }

// const moodRing: Record<Mood, string> = {
//   excited: "ring-star",
//   happy: "ring-happy",
//   sleepy: "ring-sleepy",
//   hungry: "ring-hungry",
//   sad: "ring-sad",
// };

// const moodFace: Record<Mood, string> = {
//   excited: "✨",
//   happy: "",
//   sleepy: "💤",
//   hungry: "🍽️",
//   sad: "💧",
// };

// export function Pet({
//   species,
//   mood,
//   celebrating,
//   nudging,
//   size = "lg",
//   equipped = [],
// }: PetProps) {
//   const opt = PET_OPTIONS.find((p) => p.id === species) ?? PET_OPTIONS[0];
//   const dim = size === "lg" ? "h-48 text-[7rem]" : "h-28 text-6xl";

//   const items = equipped.map(getAccessory).filter(Boolean) as NonNullable<
//     ReturnType<typeof getAccessory>
//   >[];
//   const hat = items.find((i) => i.slot === "hat");
//   const face = items.find((i) => i.slot === "face");
//   const neck = items.find((i) => i.slot === "neck");
//   const side = items.find((i) => i.slot === "side");

//   const accessoryBase = size === "lg" ? "text-4xl" : "text-2xl";

//   return (
//     <div className="relative w-full">
//       <div
//         className={cn(
//           "w-full rounded-xl bg-card flex items-center justify-center pet-shadow border-4 border-green-500 transition-all relative box-border",
//           dim,
//           moodRing[mood],
//           celebrating
//             ? "animate-celebrate"
//             : nudging
//               ? "animate-shake"
//               : mood === "sleepy"
//                 ? ""
//                 : "animate-bounce-soft",
//         )}
//         style={{
//           background: `radial-gradient(circle at 30% 30%, white, ${opt.color} 120%)`,
//         }}>
//         <span
//           className="drop-shadow-sm select-none"
//           role="img"
//           aria-label={opt.name}>
//           {opt.emoji}
//         </span>
//         {face && (
//           <span
//             className={cn("absolute select-none drop-shadow", accessoryBase)}
//             style={{ top: "38%" }}
//             aria-label={face.name}>
//             {face.emoji}
//           </span>
//         )}
//       </div>

//       {hat && (
//         <span
//           className={cn(
//             "absolute select-none drop-shadow-md",
//             size === "lg"
//               ? "text-5xl -top-6 left-1/2 -translate-x-1/2"
//               : "text-3xl -top-4 left-1/2 -translate-x-1/2",
//           )}
//           aria-label={hat.name}>
//           {hat.emoji}
//         </span>
//       )}
//       {neck && (
//         <span
//           className={cn(
//             "absolute select-none drop-shadow",
//             size === "lg"
//               ? "text-3xl bottom-2 left-1/2 -translate-x-1/2"
//               : "text-xl bottom-1 left-1/2 -translate-x-1/2",
//           )}
//           aria-label={neck.name}>
//           {neck.emoji}
//         </span>
//       )}
//       {side && (
//         <span
//           className={cn(
//             "absolute select-none drop-shadow animate-float",
//             size === "lg"
//               ? "text-3xl -right-3 top-2"
//               : "text-xl -right-2 top-1",
//           )}
//           aria-label={side.name}>
//           {side.emoji}
//         </span>
//       )}

//       {moodFace[mood] && (
//         <div className="absolute -top-2 -left-2 text-3xl animate-float">
//           {moodFace[mood]}
//         </div>
//       )}
//     </div>
//   );
// }
