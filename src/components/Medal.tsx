import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MedalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress: number; // 0-1
  current: number;
  target: number;
}

export function Medal({
  open,
  onOpenChange,

  name,
  description,
  emoji,
  unlocked,
  progress,
  current,
  target,
}: MedalProps) {
  const handleClose = (o: boolean) => {
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl border-4 bg-card w-full p-6 gap-5 box-border">
        {unlocked ? (
          <DialogTitle className="font-display font-extrabold text-2xl text-center">
            {name} {emoji}
          </DialogTitle>
        ) : (
          <DialogTitle className="font-display font-extrabold text-2xl text-center">
            Kämpa på! Du klarar det! ✨
          </DialogTitle>
        )}
        <DialogDescription className="sr-only">Prestationer</DialogDescription>

        <div className="flex flex-col items-center gap-3 ">
          {unlocked ? (
            <div>
              <p>Grattis! 🥳 Du har klarat:</p>
              <p>{description}</p>
            </div>
          ) : (
            <div>
              <p>Uppdrag: {description}</p>
              <p>
                Status: {current} / {target}
              </p>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-purple-400 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
