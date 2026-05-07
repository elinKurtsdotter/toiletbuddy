import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatBarProps {
  label: string;
  value: number; // 0-100
  icon: string | ReactNode;
  color: string; // tailwind bg class e.g. "bg-happy"
  backgroundColor?: string;
  gradient?: string; // gradient classes e.g. "bg-gradient-to-r from-pink-400 to-pink-600"
}

export function StatBar({
  label,
  value,
  icon,
  color,
  backgroundColor,
  gradient,
}: StatBarProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-end justify-center",
          backgroundColor || "bg-muted",
        )}>
        <span className="text-white text-xs font-bold " aria-hidden>
          {typeof icon === "string" ? icon : icon}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs font-bold text-foreground text-opacity-70 mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              gradient || color || "bg-primary",
            )}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
