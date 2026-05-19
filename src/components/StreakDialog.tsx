import type { AppState } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface StreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petName: string;
  state: AppState;
}

export function StreakDialog({
  open,
  onOpenChange,
  petName,
  state,
}: StreakDialogProps) {
  const handleClose = (o: boolean) => {
    onOpenChange(o);
  };

  const streakMessages = [
    "Du klarade första dagen! Drako gör en glad dans!",
    "Wow, vilken streak! Du är en riktig mästare! 🏆",
    "Wow! 3 dagar i rad! Du är superduktig! ⭐",
    "Otroligt jobbat! Din streak är som en superkraft! 💪",
    "Du är en riktig streak-hjälte! 5 dagar i rad! 🎉",
    "Fantastiskt! Din streak är som en sol som aldrig går ner! ☀️",
    "En hel vecka! Fantastiskt jobbat! 🌈",
    "Wow, vilken otrolig streak! Du är en riktig stjärna! ✨",
    `Wow, vilken streak! ${petName} skickar en mega high five! ✋✨`,
    "Du är en streak-mästare! 10 dagar i rad! 🏅",
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl border-4 bg-card w-full p-6 gap-5 box-border">
        <DialogTitle className="font-display font-extrabold text-2xl text-center">
          {"Din streak 🔥"}
        </DialogTitle>
        <DialogDescription className="sr-only">Din streak.</DialogDescription>

        <div className="flex flex-col items-center gap-3 animate-pop-in py-2">
          <span className="text-6xl">{state.streakDays} dagar</span>
          <p className="text-center font-extrabold text-lg">
            {streakMessages[8] ||
              "Vilken otrolig streak! Du är en riktig stjärna! ✨"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
