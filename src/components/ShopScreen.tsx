import { useMemo, useState } from "react";
import { ACCESSORIES, SLOT_LABEL, type AccessorySlot } from "@/lib/accessories";
import { FOODS } from "@/lib/food";
import { Pet } from "@/components/Pet";
import type { AppState } from "@/lib/storage";
import {
  levelFromPoints,
  unlockAccessory,
  toggleEquip,
  feedPet,
} from "@/lib/storage";
import { computeMood } from "@/lib/pet";
import { emitNudge } from "@/lib/nudge";
import { cn } from "@/lib/utils";
import { customToast } from "@/components/ui/custom-toast";
import { ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "./ui/button";

interface ShopScreenProps {
  state: AppState;
  setState: (s: AppState) => void;
  onBack: () => void;
}

type ShopTab = AccessorySlot | "food";
const TABS: { id: ShopTab; label: string }[] = [
  { id: "food", label: "Mat" },
  { id: "hat", label: SLOT_LABEL.hat },
  { id: "face", label: SLOT_LABEL.face },
  { id: "neck", label: SLOT_LABEL.neck },
  { id: "side", label: SLOT_LABEL.side },
];

export function ShopScreen({ state, setState, onBack }: ShopScreenProps) {
  const [tab, setTab] = useState<ShopTab>("food");
  const lvl = useMemo(() => levelFromPoints(state.points), [state.points]);
  const mood = useMemo(() => computeMood(state), [state]);
  const items = tab === "food" ? [] : ACCESSORIES.filter((a) => a.slot === tab);

  const handleAction = (id: string) => {
    const acc = ACCESSORIES.find((a) => a.id === id)!;
    const isUnlocked = state.unlocked.includes(id);
    const isLocked = lvl.level < acc.unlockLevel;
    if (isLocked) {
      customToast.info(`Lås upp på nivå ${acc.unlockLevel}`);
      return;
    }
    if (!isUnlocked) {
      const next = unlockAccessory(state, id, acc.cost);
      if (!next) {
        customToast.error(`Du behöver ${acc.cost - state.points} poäng till!`);
        return;
      }
      setState(next);
      customToast.success(`${acc.emoji} ${acc.name} upplåst!`);
      return;
    }
    const slotIds = ACCESSORIES.filter((a) => a.slot === acc.slot).map(
      (a) => a.id,
    );
    const next = toggleEquip(state, id, acc.slot, slotIds);
    setState(next);
  };

  const handleFeed = (foodId: string) => {
    const food = FOODS.find((f) => f.id === foodId)!;
    const next = feedPet(state, food.cost);
    if (!next) {
      customToast.error(`Du behöver ${food.cost - state.points} poäng till!`);
      return;
    }
    setState(next);
    emitNudge(`${food.bite}`);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#FFD93D", "#FF6BCB", "#A78BFA", "#5EEAD4", "#34D399"],
    });
    customToast.success(`${state.petName} åt ${food.emoji} ${food.name}!`, {
      description: `-${food.cost} p · ${food.bite}!`,
    });
  };
  console.log("Shop: pet: ", state);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6 gap-5 max-w-md mx-auto">
      <div className="w-full bg-white p-4 mb-6">
        <header className="w-full flex items-center justify-between">
          <Button
            onClick={onBack}
            className="bg-card rounded-full p-2 shadow-sm active:scale-95 "
            aria-label="Tillbaka">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-extrabold text-2xl">Butik</h1>
          <div className="bg-card rounded-2xl px-3 py-1.5 font-extrabold text-sm bg-yellow-200">
            ⭐ {state.points}
          </div>
        </header>

        <div className="my-2">
          <Pet
            species={state.petSpecies || "dragon"}
            mood={mood}
            // nudging={nudging}
            equipped={state.equipped}
            stage={
              state.maxEvolutionStage === 2
                ? 2
                : state.maxEvolutionStage === 1
                  ? 1
                  : 0
            }
            size="lg"
          />
        </div>

        <div className="w-full flex gap-1 bg-card/60 backdrop-blur p-1 overflow-x-auto mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 min-w-fit px-3 py-2 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap",
                tab === t.id
                  ? "text-primary-foreground border border-green-500 border-2 bg-green-100"
                  : "text-foreground/60 hover:text-foreground border-none",
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "food" ? (
          <div className="w-full grid grid-cols-2 gap-3">
            {FOODS.map((f) => {
              const canAfford = state.points >= f.cost;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFeed(f.id)}
                  className={cn(
                    "rounded-2xl p-3 bg-card flex flex-col items-center gap-1 transition-all active:scale-95 py-2 border-none",
                    canAfford ? "" : "opacity-60",
                  )}>
                  <span className="text-5xl select-none">{f.emoji}</span>
                  <span className="font-extrabold text-sm">{f.name}</span>
                  <span className="text-xs font-bold text-primary-foreground px-2 rounded-full">
                    ⭐ {f.cost}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 gap-3">
            {items.map((a) => {
              const isUnlocked = state.unlocked.includes(a.id);
              const isLocked = lvl.level < a.unlockLevel;
              const isEquipped = state.equipped.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => handleAction(a.id)}
                  className={cn(
                    "rounded-2xl p-3 bg-card flex flex-col items-center gap-1 transition-all relative",
                    "active:scale-95 py-2",
                    isEquipped && "border-4 border-purple-500",
                    !isEquipped &&
                      !isLocked &&
                      "border-none hover:ring-primary",
                    isLocked && "opacity-50 border-none",
                  )}>
                  <span className="text-5xl select-none">{a.emoji}</span>
                  <span className="font-extrabold text-sm">{a.name}</span>
                  {isEquipped ? (
                    <span className="text-xs font-bold text-star">På 🌟</span>
                  ) : isLocked ? (
                    <span className="text-xs font-bold text-foreground/60">
                      🔒 Nivå {a.unlockLevel}
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-xs font-bold text-foreground/60">
                      Tryck för att ta på
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-primary-foreground px-2 py-0.5 rounded-full">
                      ⭐ {a.cost}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
