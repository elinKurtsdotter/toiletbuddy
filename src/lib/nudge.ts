// Tiny event bus for triggering an on-screen pet nudge from anywhere.
const TARGET = typeof window !== "undefined" ? new EventTarget() : null;
const EVT = "pet-nudge";

export const NUDGE_MESSAGES = [
  "Psst! Behöver du gå på toa? 💧",
  "Liten paus? Toaletten väntar! 🚽",
  "Glöm inte mig — och toan! ✨",
  "Vi tar en snabbis till toa? 🌟",
  "Jag tror det är dags... 😊",
];

export function emitNudge(message?: string) {
  if (!TARGET) return;
  const msg =
    message ??
    NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
  TARGET.dispatchEvent(new CustomEvent(EVT, { detail: msg }));
}

export function onNudge(cb: (message: string) => void): () => void {
  if (!TARGET) return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<string>).detail);
  TARGET.addEventListener(EVT, handler);
  return () => TARGET.removeEventListener(EVT, handler);
}
