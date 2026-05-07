// Food catalog. Foods are consumable: spend points to feed the pet for a mood boost.

export interface Food {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  // How long the "full belly" effect lasts (hours)
  fullnessHours: number;
  // Playful bite line shown in pet speech bubble
  bite: string;
}

export const FOODS: Food[] = [
  {
    id: "apple",
    name: "Äpple",
    emoji: "🍎",
    cost: 10,
    fullnessHours: 1,
    bite: "Knaprigt! 🍎",
  },
  {
    id: "banana",
    name: "Banan",
    emoji: "🍌",
    cost: 12,
    fullnessHours: 1,
    bite: "Mums, banan! 🍌",
  },
  {
    id: "carrot",
    name: "Morot",
    emoji: "🥕",
    cost: 8,
    fullnessHours: 1,
    bite: "Krasch krasch! 🥕",
  },
  {
    id: "burger",
    name: "Hamburgare",
    emoji: "🍔",
    cost: 35,
    fullnessHours: 3,
    bite: "Mäktigt gott! 🍔",
  },
  {
    id: "pizza",
    name: "Pizza",
    emoji: "🍕",
    cost: 40,
    fullnessHours: 3,
    bite: "PIZZAAA! 🍕",
  },
  {
    id: "sushi",
    name: "Sushi",
    emoji: "🍣",
    cost: 50,
    fullnessHours: 4,
    bite: "Fancy fisk 🍣",
  },
  {
    id: "cake",
    name: "Tårta",
    emoji: "🍰",
    cost: 60,
    fullnessHours: 4,
    bite: "Sååå sött! 🍰",
  },
  {
    id: "icecream",
    name: "Glass",
    emoji: "🍦",
    cost: 25,
    fullnessHours: 2,
    bite: "Mmm, kallt! 🍦",
  },
  {
    id: "donut",
    name: "Munk",
    emoji: "🍩",
    cost: 30,
    fullnessHours: 2,
    bite: "Sockerrush! 🍩",
  },
  {
    id: "candy",
    name: "Godis",
    emoji: "🍬",
    cost: 15,
    fullnessHours: 1,
    bite: "Nam nam! 🍬",
  },
];

export function getFood(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id);
}
