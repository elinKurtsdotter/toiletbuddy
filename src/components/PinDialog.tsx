import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { hashPin } from "@/lib/storage";
import { Lock, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "set" | "verify";
  existingHash?: string | null;
  onSuccess: (hash: string) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export function PinDialog({
  open,
  onOpenChange,
  mode,
  existingHash,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<"first" | "confirm">("first");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const submitting = useRef(false);

  // Reset state when dialog opens - use setTimeout to batch updates
  useEffect(() => {
    if (open) {
      // Use setTimeout to batch state updates and avoid cascading renders
      setTimeout(() => {
        setStep("first");
        setPin("");
        setFirstPin("");
        setError(null);
        submitting.current = false;
      }, 0);
    }
  }, [open]);

  const trigger = async (full: string) => {
    if (submitting.current) return;
    submitting.current = true;
    if (mode === "set") {
      if (step === "first") {
        setFirstPin(full);
        setPin("");
        setStep("confirm");
        setError(null);
        submitting.current = false;
      } else {
        if (full !== firstPin) {
          setError("Koderna stämmer inte. Försök igen.");
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setPin("");
          setStep("first");
          setFirstPin("");
          submitting.current = false;
          return;
        }
        const hash = await hashPin(full);
        onSuccess(hash);
      }
    } else {
      const hash = await hashPin(full);
      if (hash === existingHash) {
        onSuccess(hash);
      } else {
        setError("Fel kod");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setPin("");
        submitting.current = false;
      }
    }
  };

  const press = (k: string) => {
    setError(null);
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!k) return;
    setPin((p) => {
      if (p.length >= 4) return p;
      const next = p + k;
      if (next.length === 4) {
        setTimeout(() => trigger(next), 120);
      }
      return next;
    });
  };

  const title =
    mode === "verify"
      ? "Föräldrakod"
      : step === "first"
        ? "Välj en 4-siffrig kod"
        : "Bekräfta koden";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl w-48 border-0 bg-card max-w-xs p-6 gap-5 bg-amber-50 border border-amber-200 border-solid border-3">
        <DialogTitle className="font-display font-extrabold text-xl text-center flex items-center justify-center gap-2 py-2 my-4">
          <Lock className="w-5 h-5" /> {title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Ange din 4-siffriga föräldrakod.
        </DialogDescription>

        <div
          className={cn(
            "flex justify-center gap-3 mb-4",
            shake && "animate-shake",
          )}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-colors",
                pin.length > i
                  ? "bg-green-100 border-green-500"
                  : "border-foreground/30",
              )}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm font-bold text-destructive">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k, i) =>
            k === "" ? (
              <div key={i} />
            ) : (
              <Button
                key={i}
                type="button"
                variant={k === "del" ? "secondary" : "outline"}
                onClick={() => press(k)}
                className="h-14 text-xl font-extrabold rounded-2xl active:scale-95 active:bg-purple-200 hover:bg-purple-200">
                {k === "del" ? <Delete className="w-5 h-5" /> : k}
              </Button>
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
