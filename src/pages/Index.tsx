import { useEffect, useMemo, useState } from "react";
import {
  loadState,
  saveState,
  levelFromPoints,
  addVisit,
  addAccident,
  type AppState,
} from "@/lib/storage";
import type { VisitType, VisitTrigger, AccidentType } from "@/lib/storage";
import {
  computeMood,
  moodMessage,
  getStageInfo,
  // accidentFreeStreak,
} from "@/lib/pet";
import { PetPicker } from "@/components/PetPicker";
import { LogVisitDialog } from "@/components/LogVisitDialog";
import { AccidentDialog } from "@/components/AccidentDialog";
// import { useReminders } from "@/hooks/useReminders";
// import { onNudge } from "@/lib/nudge";
import confetti from "canvas-confetti";
import { customToast } from "@/components/ui/custom-toast";
import { Heart, Zap, Star, ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatBar } from "@/components/StatBar";
import { Pet } from "@/components/Pet";
import { ShopScreen } from "@/components/ShopScreen";
import { ParentSettings } from "@/components/ParentSettings";
import { PetDetailsScreen } from "@/components/PetDetailsScreen";
import { PinDialog } from "@/components/PinDialog";
import { StreakDialog } from "@/components/StreakDialog";

const SELF_PRAISE = [
  "Du är otrolig! ⭐",
  "Wow, helt på egen hand! 🚀",
  "Bästa kompisen i hela världen! 💖",
  "Megabra jobbat! 🎉",
];

const REMINDER_PRAISE = [
  "Bra jobbat! 👍",
  "Snyggt, du fixade det! 🌈",
  "Härligt, fortsätt så! 😊",
];

function fireConfetti(big: boolean) {
  const colors = ["#FFD93D", "#FF6BCB", "#A78BFA", "#5EEAD4", "#34D399"];
  if (big) {
    confetti({
      particleCount: 160,
      spread: 100,
      startVelocity: 55,
      origin: { y: 0.6 },
      colors,
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });
    }, 250);
  } else {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors });
  }
}

const Index = () => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [now, setNow] = useState(() => Date.now());
  const [logOpen, setLogOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [accidentOpen, setAccidentOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  // const [nudgeMsg, setNudgeMsg] = useState<string | null>(null);
  // const [nudging, setNudging] = useState(false);
  const [view, setView] = useState<"home" | "shop" | "parent" | "pet">("home");

  //   useReminders({
  //     state,
  //     onFired: () => setState((s) => ({ ...s, lastReminderTs: Date.now() })),
  //   });

  //   useEffect(() => {
  //     return onNudge((msg) => {
  //       setNudgeMsg(msg);
  //       setNudging(true);
  //       setTimeout(() => setNudging(false), 800);
  //       setTimeout(() => setNudgeMsg((m) => (m === msg ? null : m)), 4000);
  //     });
  //   }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const mood = useMemo(() => computeMood(state), [state]);
  const lvl = useMemo(() => levelFromPoints(state.points), [state.points]);
  const stageInfo = useMemo(
    () => getStageInfo(state.maxEvolutionStage),
    [state.maxEvolutionStage],
  );

  const stats = useMemo(() => {
    const last = state.visits[state.visits.length - 1];
    const hours = last ? (now - last.ts) / 36e5 : 24;
    const happiness = Math.max(0, 100 - hours * 12);
    const energy = Math.max(0, 100 - hours * 8);
    return { happiness, energy };
  }, [state.visits, now]);

  const handleLogVisit = (type: VisitType, trigger: VisitTrigger) => {
    const next = addVisit(state, type, trigger);
    const earned = next.points - state.points;
    setState(next);
    setLogOpen(false);

    const isSelf = trigger === "self";
    fireConfetti(isSelf);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1400);

    const pool = isSelf ? SELF_PRAISE : REMINDER_PRAISE;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    customToast.success(`${msg} +${earned} poäng`, {
      description: isSelf
        ? `${state.petName} hoppar av glädje!`
        : `${state.petName} ler stort!`,
    });
  };

  const stageName = stageInfo.name.toLowerCase();

  console.log("Pet:", state);

  const openParent = () => {
    if (state.parentPin.hash) setPinOpen(true);
    else setPinOpen(true); // also opens — PinDialog handles set vs verify by mode prop
  };

  if (!state.petSpecies) {
    return (
      <PetPicker
        onPick={(species, name) =>
          setState({ ...state, petSpecies: species, petName: name })
        }
      />
    );
  }

  if (view === "shop") {
    return (
      <ShopScreen
        state={state}
        setState={setState}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "parent") {
    return (
      <ParentSettings
        state={state}
        setState={setState}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "pet") {
    return <PetDetailsScreen state={state} onBack={() => setView("home")} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6 max-w-md mx-auto">
      <div className="w-full bg-white/90 p-4 mb-6">
        <header className="w-full flex items-center justify-between">
          <div
            onClick={() => setStreakOpen(true)}
            className=" rounded-3xl px-3 py-1.5 font-extrabold text-sm cursor-pointer border border-amber-200 border-solid border-3 bg-amber-50">
            🔥 {state.streakDays}
          </div>

          <div className="bg-card rounded-3xl px-3 py-1.5 font-extrabold text-sm border border-amber-200 border-solid border-3 bg-amber-50">
            ⭐ {state.points} p
          </div>
        </header>

        <div className="text-left">
          <h1 className="font-display font-extrabold text-2xl text-foreground">
            {state.petName}
          </h1>
          <p className="text-xs text-foreground text-opacity-60 mt-1">
            {state.petSpecies.toUpperCase()} ★ {stageName.toUpperCase()}
          </p>
          <p className="text-sm font-bold text-foreground text-opacity-60 mt-1">
            {moodMessage(mood, state.petName)}
          </p>
        </div>

        <div className="w-full my-2 ">
          {/* {nudgeMsg && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-bubble-in">
              <div className="bg-card rounded-2xl px-4 py-2 shadow-lg font-extrabold text-sm whitespace-nowrap relative">
                {nudgeMsg}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-card rotate-45" />
              </div>
            </div>
          )} */}
          <button
            onClick={() => setView("pet")}
            className="visualy-hidden-focus bg-transparent border-none w-full p-0 cursor-pointer"
            aria-label={`Visa info om ${state.petName}`}>
            <Pet
              species={state.petSpecies}
              mood={mood}
              celebrating={celebrating}
              // nudging={nudging}
              equipped={state.equipped}
              stage={stageInfo.stage}
              size="lg"
              appState={state}
            />
          </button>
        </div>

        <div className="w-full my-4 mb-6 rounded-xl p-4 space-y-3 bg-amber-50 border border-amber-200 border-solid border-4 box-border">
          <StatBar
            label="Glädje"
            value={stats.happiness}
            icon={
              <Heart className="w-4 h-4" fill="currentColor" stroke="none" />
            }
            //   color="bg-accent"
            backgroundColor="bg-gradient-to-r from-pink-400 to-pink-600"
            color="bg-pink-400"
            gradient="bg-gradient-to-r from-pink-400 to-pink-600"
          />
          <StatBar
            label="Energi"
            value={stats.energy}
            icon={<Zap className="w-4 h-4" fill="currentColor" stroke="none" />}
            //   color="bg-primary"
            backgroundColor="bg-gradient-to-r from-yellow-400 to-yellow-500"
            color="bg-amber-400"
            gradient="bg-gradient-to-r from-yellow-400 to-yellow-500"
          />
          <StatBar
            label={`Nivå ${lvl.level}`}
            value={(lvl.intoLevel / lvl.needed) * 100}
            icon={
              <Star className="w-4 h-4" fill="currentColor" stroke="none" />
            }
            //   color="bg-star"
            backgroundColor="bg-gradient-to-r from-purple-400 to-purple-600"
            color="bg-purple-400"
            gradient="bg-gradient-to-r from-purple-400 to-purple-600"
          />
        </div>

        <div className="w-full h-20 mb-6">
          <Button
            size="lg"
            onClick={() => setLogOpen(true)}
            className="w-full h-20 text-2xl font-extrabold rounded-xl active:translate-y-1 active:shadow-none bg-green-100  border border-green-500 border-solid border-4 active:scale-95 btn-pop-secondary cursor-pointer">
            🚽 Jag gick på toa!
          </Button>
        </div>
        <div className="w-full flex items-center justify-between mt-1 gap-2">
          <div className="parallelogram-wrapper">
            <div className="parallelogram-bg"></div>
            <Button
              onClick={() => setView("shop")}
              className="parallelogram-button text-sm rounded-xl active:translate-y-1 active:shadow-none px-4 cursor-pointer">
              <ShoppingBag className="w-4 h-4" /> Butik
            </Button>
          </div>

          <Button
            variant="link"
            size="sm"
            className="text-foreground/70"
            onClick={() => setAccidentOpen(true)}>
            Oj, det blev en olycka
          </Button>

          <Button
            variant="ghost"
            onClick={openParent}
            aria-label="Föräldrainställningar"
            className="cursor-pointer">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <LogVisitDialog
          open={logOpen}
          onOpenChange={setLogOpen}
          onConfirm={handleLogVisit}
        />

        <AccidentDialog
          open={accidentOpen}
          onOpenChange={setAccidentOpen}
          petName={state.petName}
          onConfirm={(type: AccidentType) => {
            setState(addAccident(state, type));
          }}
        />

        <StreakDialog
          open={streakOpen}
          onOpenChange={setStreakOpen}
          petName={state.petName}
          state={state}
        />

        <PinDialog
          open={pinOpen}
          onOpenChange={setPinOpen}
          mode={state.parentPin.hash ? "verify" : "set"}
          existingHash={state.parentPin.hash}
          onSuccess={(hash) => {
            if (!state.parentPin.hash) {
              setState((s) => ({ ...s, parentPin: { hash } }));
              customToast.success("Föräldrakod satt 🔒");
            }
            setPinOpen(false);
            setView("parent");
          }}
        />
      </div>
    </main>
  );
};

export default Index;
