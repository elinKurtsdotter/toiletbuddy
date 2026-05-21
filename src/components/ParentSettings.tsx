import { useMemo, useState } from "react";
import type { AppState, ReminderSettings } from "@/lib/storage";
import { deletePet, clearHistory } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Plus, X, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  fireReminderNotification,
  requestNotificationPermission,
} from "@/hooks/use-reminders";
import { emitNudge } from "@/lib/nudge";
import { PetPicker } from "@/components/PetPicker";
import {
  // evolutionStage,
  accidentFreeStreak,
  EVOLUTION_LABEL,
  EVOLUTION_EMOJI,
} from "@/lib/pet";
import { cn } from "@/lib/utils";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onBack: () => void;
}

const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const fmtDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString("sv-SE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dayLabel = (key: string) => {
  const d = new Date(key + "T00:00:00");
  const today = new Date();
  const todayK = dayKey(today.getTime());
  const yest = new Date(today.getTime() - 86400000);
  if (key === todayK) return "Idag";
  if (key === dayKey(yest.getTime())) return "Igår";
  return d.toLocaleDateString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export function ParentSettings({ state, setState, onBack }: Props) {
  const [pickingPet, setPickingPet] = useState(false);
  const [activeTab, setActiveTab] = useState("reminders");

  if (pickingPet) {
    return (
      <PetPicker
        onPick={(species, name) => {
          setState((s) => ({
            ...s,
            petSpecies: species,
            petName: name,
            equipped: [],
          }));
          setPickingPet(false);
        }}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6 gap-5 max-w-md mx-auto">
      <div className="w-full bg-amber-50 px-4 py-6 mb-6">
        <header className="flex items-center justify-between">
          <Button
            onClick={onBack}
            className="flex items-center gap-1 bg-card rounded-2xl px-3 py-2 font-extrabold text-sm  active:scale-95">
            <ArrowLeft className="w-4 h-4" /> Klar
          </Button>
          <h1 className="font-display font-extrabold text-xl">Förälder</h1>
          <div className="w-16" />
        </header>

        <div className="w-full">
          <div className="w-full flex gap-1 bg-card/60 backdrop-blur p-1 overflow-x-auto mb-4">
            {[
              { id: "reminders", label: "Påminn" },
              { id: "pet", label: "Kompis" },
              { id: "history", label: "Historik" },
              { id: "nudge", label: "Knuff" },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 min-w-fit px-3 py-2 rounded-xl font-extrabold text-sm transition-all whitespace-nowrap border-none",
                  activeTab === tab.id
                    ? "inline-flex items-center gap-1 bg-secondary rounded-xl p-2 font-extrabold text-sm "
                    : "text-foreground/60 hover:text-foreground bg-gray-100 border border-gray-300 border-2 hover:scale-95 hover:bg-purple-400",
                )}>
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === "reminders" && (
            <div className="mt-4">
              <RemindersTab state={state} setState={setState} />
            </div>
          )}
          {activeTab === "pet" && (
            <div className="mt-4">
              <PetTab
                state={state}
                setState={setState}
                onChangePet={() => setPickingPet(true)}
              />
            </div>
          )}
          {activeTab === "history" && (
            <div className="mt-4">
              <HistoryTab state={state} setState={setState} />
            </div>
          )}
          {activeTab === "nudge" && (
            <div className="mt-4">
              <NudgeTab petName={state.petName} onBack={onBack} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function RemindersTab({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const r = state.reminders;
  const [newTime, setNewTime] = useState("");

  const update = (patch: Partial<ReminderSettings>) =>
    setState((s) => ({ ...s, reminders: { ...s.reminders, ...patch } }));

  const handleEnable = async (checked: boolean) => {
    if (!checked) {
      update({ enabled: false });
      return;
    }
    const perm = await requestNotificationPermission();
    update({ enabled: perm === "granted", permission: perm });
    if (perm === "denied") toast.error("Notiser blockerade i webbläsaren");
    else if (perm === "unsupported")
      toast.error("Den här webbläsaren stöder inte notiser");
    else if (perm === "granted") toast.success("Påminnelser aktiverade 🔔");
  };

  const addTime = () => {
    if (!isValidTime(newTime)) return toast.error("Använd HH:MM (t.ex. 08:30)");
    if (r.times.includes(newTime)) return setNewTime("");
    update({ times: [...r.times, newTime].sort() });
    setNewTime("");
  };

  const testPing = () => {
    const ok = fireReminderNotification(state.petName || "Din kompis");
    if (!ok) toast.error("Aktivera påminnelser först");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-sm">
        <div>
          <p className="font-extrabold flex items-center gap-2">
            <Bell className="w-4 h-4" /> Skicka notiser
          </p>
          <p className="text-xs font-bold text-foreground/60 mt-0.5">
            {r.permission === "denied"
              ? "Blockerade i webbläsaren"
              : r.enabled
                ? "På"
                : "Av"}
          </p>
        </div>
        <Switch checked={r.enabled} onCheckedChange={handleEnable} />
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold text-sm">Tider på dygnet</p>
        <div className="flex flex-wrap gap-2">
          {r.times.length === 0 && (
            <span className="text-xs font-bold text-foreground/50">
              Inga tider tillagda
            </span>
          )}
          {r.times.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 bg-secondary rounded-xl p-2 font-extrabold text-sm ">
              {t}
              <button
                onClick={() =>
                  update({ times: r.times.filter((x) => x !== t) })
                }
                className="rounded-xl hover:bg-background/50 p-1 border-none text-primary-foreground border border-green-500 border-2 bg-green-100"
                aria-label={`Ta bort ${t}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-xl font-extrabold "
          />
          <Button
            onClick={addTime}
            size="icon"
            className="rounded-xl shrink-0 text-primary-foreground border border-green-500 border-2 bg-green-100 active:bg-green-200 active:scale-95"
            aria-label="Lägg till">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-2">
        <Label htmlFor="fb" className="font-extrabold text-sm">
          Extra påminnelse efter {r.fallbackHours}h utan toa-besök
        </Label>
        <input
          id="fb"
          type="range"
          min={1}
          max={6}
          step={1}
          value={r.fallbackHours}
          onChange={(e) => update({ fallbackHours: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <Button
        variant="secondary"
        onClick={testPing}
        className="w-full h-14 text-lg rounded-2xl font-extrabold btn-pop-secondary active:translate-y-1 active:shadow-none">
        🔔 Testa en notis
      </Button>
    </div>
  );
}

function PetTab({
  state,
  setState,
  onChangePet,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onChangePet: () => void;
}) {
  const [name, setName] = useState(state.petName);
  // const stage = evolutionStage(state);
  const streak = accidentFreeStreak(state);
  const threshold = state.evolutionThresholdDays;
  const species = state.petSpecies ?? "blob";
  const stages = EVOLUTION_EMOJI[species];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <Label htmlFor="petname" className="font-extrabold text-sm">
          Namn
        </Label>
        <div className="flex gap-2">
          <Input
            id="petname"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 16))}
            className="rounded-xl font-extrabold"
          />
          <Button
            onClick={() => {
              const trimmed = name.trim();
              if (!trimmed) return toast.error("Namnet kan inte vara tomt");
              setState((s) => ({ ...s, petName: trimmed }));
              toast.success("Namn sparat");
            }}
            className="rounded-xl bg-green-100 border-green-500 avtive:bg-green-200 active:scale-95">
            Spara
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold text-sm">Utvecklingsstadier</p>
        <div className="flex items-center justify-between gap-2">
          {stages.map((emoji, i) => (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2 ${
                streak === i
                  ? "bg-primary/15 ring-2 ring-primary"
                  : "bg-secondary/40"
              }`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-[10px] font-extrabold text-foreground/70">
                {EVOLUTION_LABEL[i]}
              </span>
              <span className="text-[10px] font-bold text-foreground/50">
                {i === 0
                  ? "0 d"
                  : i === 1
                    ? `${threshold} d`
                    : `${threshold * 2} d`}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs font-bold text-foreground/60 text-center">
          Just nu: <span className="text-foreground">{streak}</span> dag
          {streak === 1 ? "" : "ar"} utan olycka
        </p>
        <Label htmlFor="evo" className="font-extrabold text-sm block pt-2">
          Dagar utan olycka för att utvecklas: {threshold}
        </Label>
        <input
          id="evo"
          type="range"
          min={1}
          max={14}
          step={1}
          value={threshold}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              evolutionThresholdDays: Number(e.target.value),
            }))
          }
          className="w-full accent-primary"
        />
        <p className="text-[11px] font-bold text-foreground/50">
          Vuxen-stadiet nås vid {threshold * 2} olycksfria dagar. När en nivå
          väl uppnåtts behålls den även om en olycka sker.
        </p>
        {(state.maxEvolutionStage ?? 0) > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              if (
                !confirm(
                  "Återställ utvecklingen till Bebis? Kompisen utvecklas igen efterhand som olycksfria dagar samlas.",
                )
              )
                return;
              setState((s) => ({ ...s, maxEvolutionStage: 0 }));
              toast("Utveckling återställd");
            }}
            className="w-full rounded-2xl font-extrabold h-11 mt-2">
            <Sparkles className="w-4 h-4 mr-2" /> Återställ utvecklingsstadier
          </Button>
        )}
      </div>

      <Button
        variant="secondary"
        onClick={onChangePet}
        className="w-full text-lg rounded-2xl font-extrabold h-8 mb-4 btn-pop-secondary h-14">
        Byt kompis
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          if (
            !confirm(
              "Ta bort din kompis och börja om? Poäng och historik behålls.",
            )
          )
            return;
          setState((s) => deletePet(s));
          toast("Kompis återställd");
        }}
        className="w-full rounded-2xl font-extrabold h-8 ">
        <Trash2 className="w-4 h-4 mr-2" /> Återställ kompis
      </Button>
    </div>
  );
}

function HistoryTab({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const summary = useMemo(() => {
    const days: {
      key: string;
      label: string;
      visits: number;
      accidents: number;
    }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = dayKey(d.getTime());
      days.push({ key, label: dayLabel(key), visits: 0, accidents: 0 });
    }
    const map = new Map(days.map((d) => [d.key, d]));
    state.visits.forEach((v) => {
      const d = map.get(dayKey(v.ts));
      if (d) d.visits++;
    });
    state.accidents.forEach((a) => {
      const d = map.get(dayKey(a.ts));
      if (d) d.accidents++;
    });
    const max = Math.max(1, ...days.map((d) => d.visits));
    return { days, max };
  }, [state.visits, state.accidents]);

  const [filter, setFilter] = useState<"all" | "visits" | "accidents">("all");

  const events = useMemo(() => {
    const v = state.visits.map((x) => ({ ...x, kind: "visit" as const }));
    const a = state.accidents.map((x) => ({ ...x, kind: "accident" as const }));
    const all = [...v, ...a].sort((x, y) => y.ts - x.ts);
    if (filter === "visits") return all.filter((e) => e.kind === "visit");
    if (filter === "accidents") return all.filter((e) => e.kind === "accident");
    return all;
  }, [state.visits, state.accidents, filter]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <p className="font-extrabold text-sm mb-3">Senaste 7 dagarna</p>
        <div className="flex items-end justify-between gap-1.5 h-24">
          {summary.days.map((d) => (
            <div
              key={d.key}
              className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-primary rounded-t-md min-h-[2px]"
                  style={{ height: `${(d.visits / summary.max) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-foreground/60">
                {d.label.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 mt-2 text-[10px] font-extrabold text-center">
          {summary.days.map((d) => (
            <div key={d.key} className="flex flex-col">
              <span>{d.visits}🚽</span>
              {d.accidents > 0 && (
                <span className="text-destructive">{d.accidents}💧</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-extrabold text-sm">Hela loggen</p>
          {events.length > 0 && (
            <button
              onClick={() => {
                if (!confirm("Rensa all historik? Poäng behålls.")) return;
                setState((s) => clearHistory(s));
                toast("Historik rensad");
              }}
              className="text-xs bg-red-100 border-none py-1.5  rounded-xl font-extrabold text-black active:scale-95">
              Rensa
            </button>
          )}
        </div>
        <div className="flex gap-1.5 mb-3">
          {(
            [
              ["all", "Allt"],
              ["visits", "Toabesök"],
              ["accidents", "Olyckor"],
            ] as const
          ).map(([val, label]) => (
            <Button
              key={val}
              onClick={() => setFilter(val)}
              className={`flex-1 rounded-xl  py-1.5 text-xs font-extrabold transition-colors border-none ${
                filter === val
                  ? "text-primary-foreground border-green-500 border-2 bg-secondary"
                  : "text-foreground/60 hover:text-foreground bg-gray-100 hover:scale-95"
              }`}>
              {label}
            </Button>
          ))}
        </div>
        {events.length === 0 ? (
          <p className="text-xs font-bold text-foreground/50 py-4 text-center">
            Inga händelser ännu
          </p>
        ) : (
          <ScrollArea className="h-72 pr-2">
            <ul className="space-y-1.5">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between bg-secondary/40 rounded-xl px-3 py-2 text-sm font-bold">
                  <span className="flex items-center gap-2">
                    {e.kind === "visit" ? (
                      <>
                        <span>🚽</span>
                        <span>
                          {e.type === "both"
                            ? "Kiss + bajs"
                            : e.type === "poop"
                              ? "Bajs"
                              : "Kiss"}
                        </span>
                        {e.trigger === "self" && (
                          <span className="text-[10px] font-extrabold bg-star text-star-foreground rounded-full px-2 py-0.5">
                            själv
                          </span>
                        )}
                        {e.wipe === "self" && (
                          <span className="text-[10px] font-extrabold bg-primary/15 text-primary rounded-full px-2 py-0.5">
                            torkade själv 🧻
                          </span>
                        )}
                        {e.wipe === "help" && (
                          <span className="text-[10px] font-extrabold bg-secondary text-foreground/70 rounded-full px-2 py-0.5">
                            hjälp 🤝
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span>💧</span>
                        <span className="text-foreground/70">
                          Olycka ({e.type === "poop" ? "bajs" : "kiss"})
                        </span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {fmtDate(e.ts)}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function NudgeTab({
  petName,
  onBack,
}: {
  petName: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3 text-center">
        <Sparkles className="w-8 h-8 mx-auto text-primary" />
        <p className="font-extrabold">Knuffa {petName} på skärmen</p>
        <p className="text-xs font-bold text-foreground/60">
          Inga notiser — bara en mjuk på-skärm-påminnelse med pratbubbla.
        </p>
      </div>
      <Button
        variant={"secondary"}
        onClick={() => {
          emitNudge();
          onBack();
          toast.success(`${petName} viftar! 👋`);
        }}
        className="w-full h-14 text-lg rounded-2xl font-extrabold btn-pop-secondary active:translate-y-1 active:shadow-none">
        ✨ Skicka knuff nu
      </Button>
    </div>
  );
}
