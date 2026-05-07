import { useState } from "react";
import { PET_OPTIONS } from "@/lib/pet";
import type { PetSpecies } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PetPickerProps {
  onPick: (species: PetSpecies, name: string) => void;
}

export function PetPicker({ onPick }: PetPickerProps) {
  const [chosen, setChosen] = useState<PetSpecies | null>(null);
  const [name, setName] = useState("");

  const defaultName = chosen
    ? PET_OPTIONS.find((p) => p.id === chosen)!.name
    : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 animate-pop-in">
      <h1 className="text-4xl font-display font-extrabold text-center text-primary-foreground bg-primary px-6 py-3 rounded-3xl btn-pop">
        Vilken Toachi passar dig?
      </h1>
      <p className="text-center text-foreground/70 font-bold">
        Välj en kompis att ta hand om
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {PET_OPTIONS.map((p) => (
          <button
            key={p.id}
            onClick={() => setChosen(p.id)}
            className={cn(
              "rounded-3xl p-4 bg-card flex flex-col items-center gap-2 transition-all",
              "hover:scale-105 active:scale-95",
              chosen === p.id
                ? "border border-purple-500 border-2 scale-105"
                : "border border-border border-purple-200",
            )}
            style={{
              background: `radial-gradient(circle at 30% 30%, white, ${p.color} 140%)`,
            }}>
            <span className="text-6xl">{p.emoji}</span>
            <span className="font-bold">{p.name}</span>
          </button>
        ))}
      </div>

      {chosen && (
        <div className="w-full max-w-xs flex flex-col gap-3 animate-pop-in">
          <label className="font-bold text-sm text-foreground/70">
            Vill du ge din kompis ett namn?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 16))}
            placeholder={defaultName}
            className="px-4 py-3 rounded-2xl bg-card border-2 border-border font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/30"
          />
          <Button
            size="lg"
            className="h-14 text-lg font-extrabold rounded-2xl border-2 border-purple-500 active:translate-y-1 active:shadow-none"
            onClick={() => onPick(chosen, name.trim() || defaultName)}>
            Nu kör vi! 🚀
          </Button>
        </div>
      )}
    </div>
  );
}
