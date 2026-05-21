import { useMemo } from "react";
import type { AppState } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import {
  PET_OPTIONS,
  EVOLUTION_EMOJI,
  EVOLUTION_LABEL,
  evolutionStage,
  streakStage,
  accidentFreeStreak,
} from "@/lib/pet";
import { levelFromPoints } from "@/lib/storage";
import { computeAchievements } from "@/lib/achievements";
import { cn } from "@/lib/utils";

interface Props {
  state: AppState;
  onBack: () => void;
}

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const Stat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) => {
  return (
    <div className="bg-card rounded-2xl p-3 flex items-center gap-3 shadow-sm">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-extrabold text-lg leading-none">{value}</div>
        <div className="text-[11px] font-bold text-foreground/60 mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
};

export function PetDetailsScreen({ state, onBack }: Props) {
  const species = state.petSpecies!;
  const opt = PET_OPTIONS.find((p) => p.id === species)!;
  const currentStage = evolutionStage(state);
  const liveStage = streakStage(state);
  const maxReached = (state.maxEvolutionStage ?? 0) as 0 | 1 | 2;
  const streak = accidentFreeStreak(state);
  const lvl = levelFromPoints(state.points);

  const stats = useMemo(() => {
    const visits = state.visits;
    const selfVisits = visits.filter((v) => v.trigger === "self").length;
    const wipedSelf = visits.filter((v) => v.wipe === "self").length;
    const poop = visits.filter(
      (v) => v.type === "poop" || v.type === "both",
    ).length;
    const pee = visits.filter(
      (v) => v.type === "pee" || v.type === "both",
    ).length;
    const accidents = state.accidents.length;
    const uniqueDays = new Set(visits.map((v) => dayKey(v.ts))).size;
    return {
      total: visits.length,
      selfVisits,
      wipedSelf,
      poop,
      pee,
      accidents,
      uniqueDays,
    };
  }, [state]);

  const achievements = useMemo(() => computeAchievements(state), [state]);

  const threshold = Math.max(1, state.evolutionThresholdDays || 5);
  const stageThresholds: [number, number, number] = [
    0,
    threshold,
    threshold * 2,
  ];
  const nextStage = currentStage < 2 ? ((currentStage + 1) as 1 | 2) : null;
  const daysToNext = nextStage
    ? Math.max(0, stageThresholds[nextStage] - streak)
    : 0;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6 max-w-md mx-auto">
      <div className="w-full bg-white/90 p-4 mb-6">
        <header className="w-full flex items-center justify-between">
          <Button
            onClick={onBack}
            className="bg-card rounded-full p-2 shadow-sm active:scale-95 "
            aria-label="Tillbaka">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="bg-card rounded-3xl px-3 py-1.5 font-extrabold text-sm border border-amber-200 border-solid border-3 bg-amber-50">
            ⭐ {state.points} p
          </div>
          {/* <div className="font-extrabold text-sm bg-card rounded-2xl px-3 py-1.5 shadow-sm">
            ⭐ {state.points} p
          </div> */}
        </header>

        <div className="text-center">
          <h1 className="font-display font-extrabold text-3xl text-foreground">
            {state.petName}
          </h1>
          <p className="text-sm font-bold text-foreground/60 mt-1">
            {opt.name} · Nivå {lvl.level}
          </p>
          <p className="text-xs font-extrabold text-primary mt-1">
            {EVOLUTION_LABEL[currentStage]} · {streak} olycksfri
            {streak === 1 ? "" : "a"} dag{streak === 1 ? "" : "ar"} 🌱
          </p>
        </div>
        {/* Evolution gallery */}
        <section className="w-90 bg-card/70 backdrop-blur rounded-3xl p-4 shadow-sm mb-4">
          <h2 className="font-extrabold text-sm mb-3 text-foreground/80">
            Utvecklingsstadier
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {([0, 1, 2] as const).map((s) => {
              const unlocked = s <= maxReached;
              const isCurrent = s === currentStage;
              const emoji = EVOLUTION_EMOJI[species][s];
              return (
                <div
                  key={s}
                  style={{
                    background: unlocked
                      ? `radial-gradient(circle at 30% 30%, white, ${opt.color} 120%)`
                      : undefined,
                  }}
                  className={cn(
                    "relative rounded-2xl p-3 flex flex-col items-center gap-1 border-2 transition-all",
                    isCurrent
                      ? "border-border border-yellow-400"
                      : unlocked
                        ? "border-border"
                        : "border-dashed border-foreground/20 bg-muted/40",
                  )}>
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center text-4xl",
                      !unlocked && "grayscale opacity-40",
                    )}>
                    {unlocked ? emoji : "❓"}
                  </div>
                  <span className="text-xs font-extrabold">
                    {EVOLUTION_LABEL[s]}
                  </span>
                  <span className="text-[10px] font-bold text-foreground/60">
                    {s === 0 ? "Start" : `${stageThresholds[s]} dgr`}
                  </span>
                  {!unlocked && (
                    <Lock className="w-3 h-3 absolute top-1 left-1 text-foreground/40" />
                  )}
                  {isCurrent && (
                    <span className="absolute top-1 left-1 text-[9px] font-extrabold bg-primary text-primary-foreground rounded-full p-1 ">
                      NU
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {nextStage && (
            <p className="text-xs font-bold text-foreground/60 mt-3 text-center">
              {daysToNext === 0
                ? `Klar för ${EVOLUTION_LABEL[nextStage]} – logga en olycksfri dag till! ✨`
                : `${daysToNext} dag${daysToNext === 1 ? "" : "ar"} till ${EVOLUTION_LABEL[nextStage]}`}
            </p>
          )}
          {liveStage < maxReached && (
            <p className="text-[11px] font-bold text-foreground/50 mt-2 text-center">
              🔒 Nivån är låst – den försvinner inte vid en olycka.
            </p>
          )}
        </section>

        {/* Achievements */}
        <section className="w-90 bg-card/70 backdrop-blur rounded-3xl p-4 shadow-sm mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-extrabold text-sm text-foreground/80">
              Medaljer
            </h2>
            <span className="text-[11px] font-bold text-foreground/60">
              {achievements.filter((a) => a.unlocked).length} /{" "}
              {achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "relative rounded-2xl p-2 flex flex-col items-center gap-1 border-2 text-center",
                  a.unlocked
                    ? "border-star bg-star/10"
                    : "border-dashed border-foreground/15 bg-muted/40",
                )}
                title={`${a.name} – ${a.description}`}>
                <span
                  className={cn(
                    "text-3xl leading-none mt-1",
                    !a.unlocked && "grayscale opacity-40",
                  )}
                  aria-hidden>
                  {a.emoji}
                </span>
                <span className="text-[10px] font-extrabold leading-tight line-clamp-2">
                  {a.name}
                </span>
                {a.unlocked ? (
                  <span className="text-[9px] font-bold text-star">
                    Upplåst!
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-foreground/60">
                    {a.current}/{a.target}
                  </span>
                )}
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden mt-0.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      a.unlocked ? "bg-star" : "bg-primary/60",
                    )}
                    style={{ width: `${a.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Stats */}
        <section className="w-90 bg-card/70 backdrop-blur rounded-3xl p-4 shadow-sm mb-4">
          <h2 className="font-extrabold text-sm mb-3 text-foreground/80">
            Statistik
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Toabesök" value={stats.total} icon="🚽" />
            <Stat label="På egen hand" value={stats.selfVisits} icon="🦸" />
            <Stat label="Torkat själv" value={stats.wipedSelf} icon="🧻" />
            <Stat label="Bajs" value={stats.poop} icon="💩" />
            <Stat label="Kiss" value={stats.pee} icon="💧" />
            <Stat label="Olyckor" value={stats.accidents} icon="🩹" />
            <Stat label="Aktiva dagar" value={stats.uniqueDays} icon="📅" />
            <Stat label="Daglig streak" value={state.streakDays} icon="🔥" />
          </div>
        </section>
      </div>
    </main>
  );
}
