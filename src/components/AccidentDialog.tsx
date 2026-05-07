import { useState } from "react";
import type { AccidentType } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AccidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (type: AccidentType) => void;
  petName: string;
}

const OPTIONS: {
  id: AccidentType;
  label: string;
  emoji: string;
  backgroundColor: string;
  borderColor: string;
}[] = [
  {
    id: "pee",
    label: "Lite kiss",
    emoji: "💧",
    backgroundColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  {
    id: "poop",
    label: "Lite bajs",
    emoji: "💩",
    backgroundColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
];

export function AccidentDialog({
  open,
  onOpenChange,
  onConfirm,
  petName,
}: AccidentDialogProps) {
  const [picked, setPicked] = useState<AccidentType | null>(null);

  const reset = () => setPicked(null);

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handlePick = (id: AccidentType) => {
    setPicked(id);
    onConfirm(id);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl border-4 bg-card w-full p-6 gap-5 box-border">
        <DialogTitle className="font-display font-extrabold text-2xl text-center">
          {picked ? "Det är helt okej 💖" : "Ingen fara — vad hände?"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Logga en olycka. Inga poäng försvinner.
        </DialogDescription>

        {!picked && (
          <>
            <p className="text-center text-sm font-bold text-foreground/70 -mt-2">
              Olyckor händer alla. Du förlorar inga poäng. {petName} älskar dig
              ändå! 🤗
            </p>
            <div className="grid grid-cols-1 gap-3 animate-pop-in">
              {OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => handlePick(o.id)}
                  className={cn(
                    "rounded-2xl p-4 border-2 hover:bg-secondary",
                    "flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95",
                    o.backgroundColor,
                    o.borderColor,
                  )}>
                  <span className="text-4xl">{o.emoji}</span>
                  <span className="font-extrabold text-xl">{o.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {picked && (
          <div className="flex flex-col items-center gap-3 animate-pop-in py-2">
            <span className="text-6xl">🤗</span>
            <p className="text-center font-extrabold text-lg">
              {petName} ger dig en stor kram!
            </p>
            <p className="text-center text-sm font-bold text-foreground/70">
              Nästa gång kanske vi hinner till toa. Du är bäst! ⭐
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
