import type { Rarity, EvolutionStage } from "./types";

interface RarityInput {
  statTotal: number;
  evolutionStage: EvolutionStage;
}

const RARITY_WEIGHTS: { rarity: Rarity; baseWeight: number }[] = [
  { rarity: "COMMON", baseWeight: 55 },
  { rarity: "UNCOMMON", baseWeight: 25 },
  { rarity: "RARE", baseWeight: 12 },
  { rarity: "HOLO_RARE", baseWeight: 5 },
  { rarity: "FULL_ART", baseWeight: 2.5 },
  { rarity: "SECRET_RARE", baseWeight: 0.5 },
];

export function assignRarity({ statTotal, evolutionStage }: RarityInput): Rarity {
  // Calculate adjusted weights
  let weights = RARITY_WEIGHTS.map(({ rarity, baseWeight }) => {
    let adjusted = baseWeight;
    // Bonus for high stat totals
    if (statTotal > 500) adjusted *= 1.5;
    else if (statTotal > 450) adjusted *= 1.2;
    // Legendary stage bonus
    if (evolutionStage === "STAGE2" && statTotal >= 580) adjusted *= 2;
    return { rarity, weight: adjusted };
  });

  // Normalize weights
  const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);
  const normalized = weights.map(({ rarity, weight }) => ({
    rarity,
    probability: weight / totalWeight,
  }));

  // Weighted random selection
  const roll = Math.random();
  let cumulative = 0;
  for (const { rarity, probability } of normalized) {
    cumulative += probability;
    if (roll <= cumulative) return rarity;
  }
  return "COMMON";
}

export function assignPackRarity(packIndex: number): Rarity {
  // Pack of 5: last card (index 4) is guaranteed Rare+
  if (packIndex === 4) {
    const guaranteedWeights: { rarity: Rarity; weight: number }[] = [
      { rarity: "RARE", weight: 70 },
      { rarity: "HOLO_RARE", weight: 20 },
      { rarity: "FULL_ART", weight: 7 },
      { rarity: "SECRET_RARE", weight: 3 },
    ];
    const total = guaranteedWeights.reduce((s, { weight }) => s + weight, 0);
    const roll = Math.random() * total;
    let cum = 0;
    for (const { rarity, weight } of guaranteedWeights) {
      cum += weight;
      if (roll <= cum) return rarity;
    }
    return "RARE";
  }

  // Other cards use standard weights
  return assignRarity({ statTotal: 400, evolutionStage: "STAGE1" });
}

export const RARITY_CONFIG: Record<
  Rarity,
  {
    label: string;
    starCount: number;
    glowColor: string;
    textColor: string;
    bgClass: string;
    borderClass: string;
    shimmer: boolean;
    rainbow: boolean;
  }
> = {
  COMMON: {
    label: "Common",
    starCount: 0,
    glowColor: "transparent",
    textColor: "#6b7280",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    borderClass: "border-gray-300 dark:border-gray-600",
    shimmer: false,
    rainbow: false,
  },
  UNCOMMON: {
    label: "Uncommon",
    starCount: 1,
    glowColor: "#10b981",
    textColor: "#10b981",
    bgClass: "bg-emerald-50 dark:bg-emerald-950",
    borderClass: "border-emerald-400",
    shimmer: false,
    rainbow: false,
  },
  RARE: {
    label: "Rare",
    starCount: 2,
    glowColor: "#f59e0b",
    textColor: "#f59e0b",
    bgClass: "bg-amber-50 dark:bg-amber-950",
    borderClass: "border-amber-400",
    shimmer: false,
    rainbow: false,
  },
  HOLO_RARE: {
    label: "Holo Rare",
    starCount: 3,
    glowColor: "#a855f7",
    textColor: "#a855f7",
    bgClass: "bg-purple-50 dark:bg-purple-950",
    borderClass: "border-purple-400",
    shimmer: true,
    rainbow: false,
  },
  FULL_ART: {
    label: "Full Art",
    starCount: 4,
    glowColor: "#3b82f6",
    textColor: "#3b82f6",
    bgClass: "bg-blue-50 dark:bg-blue-950",
    borderClass: "border-blue-400",
    shimmer: true,
    rainbow: false,
  },
  SECRET_RARE: {
    label: "Secret Rare",
    starCount: 5,
    glowColor: "rainbow",
    textColor: "#ec4899",
    bgClass: "bg-pink-50 dark:bg-pink-950",
    borderClass: "border-transparent",
    shimmer: true,
    rainbow: true,
  },
};

export function getStatTotal(stats: {
  hp: number; attack: number; defense: number;
  spAtk: number; spDef: number; speed: number;
}): number {
  return stats.hp + stats.attack + stats.defense + stats.spAtk + stats.spDef + stats.speed;
}
