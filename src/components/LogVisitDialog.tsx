import { useState } from "react";
import type { VisitType, VisitTrigger, WipeMode } from "@/lib/storage";
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
  onConfirm: (type: VisitType, trigger: VisitTrigger, wipe: WipeMode) => void;
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
  const [trigger, setTrigger] = useState<VisitTrigger | null>(null);

  const needsWipe = type === "poop" || type === "both";

  const reset = () => {
    setType(null);
    setTrigger(null);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleTrigger = (t: VisitTrigger) => {
    if (!type) return;
    if (needsWipe) {
      setTrigger(t);
    } else {
      onConfirm(type, t, "na");
      reset();
    }
  };

  const handleWipe = (w: WipeMode) => {
    if (!type || !trigger) return;
    onConfirm(type, trigger, w);
    reset();
  };

  const step: "type" | "trigger" | "wipe" = !type
    ? "type"
    : !trigger
      ? "trigger"
      : "wipe";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl border-4 bg-card w-full p-6 gap-5 box-border">
        <DialogTitle className="font-display font-extrabold text-2xl text-center">
          {step === "type" && "Vad gjorde du?"}
          {step === "trigger" && "Hur gick det?"}
          {step === "wipe" && "Och torkningen?"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Logga ditt toabesök för att få poäng
        </DialogDescription>

        {step === "type" && (
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

        {step === "trigger" && type && (
          <div className="flex flex-col gap-3 animate-pop-in">
            <button
              onClick={() => handleTrigger("self")}
              className={cn(
                "rounded-2xl p-4 bg-yellow-100",
                "flex flex-col items-center gap-1 transition-all hover:scale-[1.02] active:scale-95 border border-2  border-yellow-500 ",
              )}>
              <span className="text-3xl">🌟</span>
              <span className="font-extrabold text-lg">Jag gick själv!</span>
              <span className="text-xs font-bold text-black">
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
              <span className="font-extrabold text-lg">
                Efter en påminnelse
              </span>
              <span className="text-xs font-bold text-black">
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

        {step === "wipe" && type && trigger && (
          <div className="flex flex-col gap-3 animate-pop-in">
            <button
              onClick={() => handleWipe("self")}
              className={cn(
                "rounded-2xl p-4 bg-yellow-100",
                "flex flex-col items-center gap-1 transition-all hover:scale-[1.02] active:scale-95 border border-2  border-yellow-500 ",
              )}>
              <span className="text-3xl">🧻✨</span>
              <span className="font-extrabold text-lg">Jag torkade själv!</span>
              <span className="text-xs font-bold text-black">
                +{pointsForVisit(type, trigger, "self")} poäng • +5 bonus
              </span>
            </button>

            <button
              onClick={() => handleWipe("help")}
              className={cn(
                "rounded-2xl p-4 bg-secondary",
                "flex flex-col items-center gap-1 transition-all hover:scale-[1.02] active:scale-95 border border-2 border-green-500",
              )}>
              <span className="text-2xl">🤝</span>
              <span className="font-extrabold text-lg">Jag fick hjälp</span>
              <span className="text-xs font-bold text-black">
                Helt okej — vi övar! +{pointsForVisit(type, trigger, "help")}{" "}
                poäng
              </span>
            </button>

            <Button
              onClick={() => setTrigger(null)}
              className="text-xs font-bold text-foreground/50 underline decoration-dotted underline-offset-4 mt-1 bg-transparent border-none hover:bg-transparent">
              Tillbaka
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
