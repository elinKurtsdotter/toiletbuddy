// Accessory catalog. Each item lives in a "slot" which controls where it renders on the pet.

export type AccessorySlot = "hat" | "face" | "neck" | "side";

export interface Accessory {
  id: string;
  name: string;
  emoji: string;
  slot: AccessorySlot;
  cost: number;
  unlockLevel: number;
}

export const ACCESSORIES: Accessory[] = [
  // Hats
  {
    id: "crown",
    name: "Krona",
    emoji: "👑",
    slot: "hat",
    cost: 30,
    unlockLevel: 1,
  },
  {
    id: "cap",
    name: "Keps",
    emoji: "🧢",
    slot: "hat",
    cost: 50,
    unlockLevel: 2,
  },
  {
    id: "tophat",
    name: "Hög hatt",
    emoji: "🎩",
    slot: "hat",
    cost: 80,
    unlockLevel: 3,
  },
  {
    id: "party",
    name: "Partyhatt",
    emoji: "🥳",
    slot: "hat",
    cost: 120,
    unlockLevel: 4,
  },
  {
    id: "wizard",
    name: "Trollkarlshatt",
    emoji: "🧙",
    slot: "hat",
    cost: 200,
    unlockLevel: 6,
  },

  // Face
  {
    id: "shades",
    name: "Solglasögon",
    emoji: "🕶️",
    slot: "face",
    cost: 40,
    unlockLevel: 1,
  },
  {
    id: "glasses",
    name: "Glasögon",
    emoji: "👓",
    slot: "face",
    cost: 60,
    unlockLevel: 2,
  },
  {
    id: "monocle",
    name: "Monokel",
    emoji: "🧐",
    slot: "face",
    cost: 150,
    unlockLevel: 5,
  },

  // Neck
  {
    id: "bowtie",
    name: "Fluga",
    emoji: "🎀",
    slot: "neck",
    cost: 35,
    unlockLevel: 1,
  },
  {
    id: "scarf",
    name: "Halsduk",
    emoji: "🧣",
    slot: "neck",
    cost: 70,
    unlockLevel: 3,
  },
  {
    id: "medal",
    name: "Guldmedalj",
    emoji: "🥇",
    slot: "neck",
    cost: 180,
    unlockLevel: 5,
  },

  // Side
  {
    id: "balloon",
    name: "Ballong",
    emoji: "🎈",
    slot: "side",
    cost: 25,
    unlockLevel: 1,
  },
  {
    id: "star",
    name: "Stjärna",
    emoji: "⭐",
    slot: "side",
    cost: 90,
    unlockLevel: 4,
  },
  {
    id: "rocket",
    name: "Raket",
    emoji: "🚀",
    slot: "side",
    cost: 250,
    unlockLevel: 7,
  },
];

export function getAccessory(id: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.id === id);
}

export const SLOT_LABEL: Record<AccessorySlot, string> = {
  hat: "Hatt",
  face: "Ansikte",
  neck: "Hals",
  side: "Tillbehör",
};
