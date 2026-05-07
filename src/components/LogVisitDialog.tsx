import { useState } from "react";
import type { VisitType, VisitTrigger } from "@/lib/storage";
import { pointsForVisit } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface LogVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (type: VisitType, trigger: VisitTrigger) => void;
}

const TYPE_OPTIONS: {
  id: VisitType;
  label: string;
  emoji: string;
  backgroundColor: string;
  borderColor: string;
}[] = [
  {
    id: "pee",
    label: "Kissade",
    emoji: "💧",
    backgroundColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  {
    id: "poop",
    label: "Bajsade",
    emoji: "💩",
    backgroundColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  {
    id: "both",
    label: "Båda!",
    emoji: "💧💩",
    backgroundColor: "bg-purple-100",
    borderColor: "border-purple-200",
  },
];

export function LogVisitDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogVisitDialogProps) {
  const [type, setType] = useState<VisitType | null>(null);

  const reset = () => setType(null);

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleTrigger = (trigger: VisitTrigger) => {
    if (!type) return;
    onConfirm(type, trigger);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl border-4 bg-card w-full p-6 gap-5 box-border">
        <DialogTitle className="font-display font-extrabold text-2xl text-center">
          {type ? "Hur gick det?" : "Vad gjorde du?"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Logga ditt toabesök för att få poäng
        </DialogDescription>

        {!type && (
          <div className="grid grid-cols-1 gap-3 animate-pop-in">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setType(o.id)}
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
        )}

        {type && (
          <div className="flex flex-col gap-3 animate-pop-in">
            <button
              onClick={() => handleTrigger("self")}
              className={cn(
                "rounded-2xl p-4 bg-yellow-100",
                "flex flex-col items-center gap-1 transition-all hover:scale-[1.02] active:scale-95 border border-2  border-yellow-500 ",
              )}>
              <span className="text-3xl">🌟</span>
              <span className="font-extrabold text-xl">Jag gick själv!</span>
              <span className="text-xs font-bold opacity-80">
                +{pointsForVisit(type, "self")} poäng • 3× bonus
              </span>
            </button>
            <button
              onClick={() => handleTrigger("reminder")}
              className={cn(
                "rounded-2xl p-4 bg-secondary",
                "flex flex-col items-center gap-1 transition-all hover:scale-[1.02] active:scale-95 border border-2 border-green-500",
              )}>
              <span className="text-2xl">👍</span>
              <span className="font-extrabold text-lg ">
                Efter en påminnelse
              </span>
              <span className="text-xs font-bold text-foreground text-opacity-60">
                +{pointsForVisit(type, "reminder")} poäng
              </span>
            </button>
            <Button
              onClick={() => setType(null)}
              className="text-xs font-bold text-foreground/50 underline decoration-dotted underline-offset-4 mt-1 bg-transparent border-none hover:bg-transparent">
              Tillbaka
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
