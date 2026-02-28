export type PokemonType =
  | "FIRE" | "WATER" | "GRASS" | "ELECTRIC" | "ICE" | "FIGHTING"
  | "POISON" | "GROUND" | "FLYING" | "PSYCHIC" | "BUG" | "ROCK"
  | "GHOST" | "DRAGON" | "DARK" | "STEEL" | "FAIRY" | "NORMAL";

export type Region =
  | "KANTO" | "JOHTO" | "HOENN" | "SINNOH" | "UNOVA"
  | "KALOS" | "ALOLA" | "GALAR" | "PALDEA" | "CUSTOM";

export type Habitat = "LAND" | "SEA" | "SKY";

export type EvolutionStage = "BASIC" | "STAGE1" | "STAGE2";

export type Rarity =
  | "COMMON" | "UNCOMMON" | "RARE" | "HOLO_RARE" | "FULL_ART" | "SECRET_RARE";

export type DamageClass = "PHYSICAL" | "SPECIAL" | "STATUS";

export type GenderRatio = "50M_50F" | "87M_13F" | "100M" | "100F" | "GENDERLESS";

export type EggGroup =
  | "MONSTER" | "WATER1" | "WATER2" | "WATER3" | "BUG" | "FLYING"
  | "FIELD" | "FAIRY" | "GRASS" | "HUMAN_LIKE" | "MINERAL"
  | "AMORPHOUS" | "DRAGON" | "UNDISCOVERED";

export type ExperienceCurve =
  | "SLOW" | "MEDIUM_SLOW" | "MEDIUM_FAST" | "FAST" | "ERRATIC" | "FLUCTUATING";

export type ColorCategory =
  | "RED" | "BLUE" | "YELLOW" | "GREEN" | "BLACK"
  | "BROWN" | "PURPLE" | "GRAY" | "WHITE" | "PINK";

export type FormType = "MEGA" | "MEGA_X" | "MEGA_Y" | "DYNAMAX" | "GIGANTAMAX";

export type EvolutionTrigger =
  | "LEVEL_UP" | "LEVEL_UP_WITH_MOVE" | "LEVEL_UP_IN_AREA" | "STONE"
  | "STONE_WITH_GENDER" | "TRADE" | "TRADE_WITH_ITEM" | "FRIENDSHIP"
  | "FRIENDSHIP_WITH_TIME" | "ITEM_IN_INVENTORY" | "OTHER";

export type GenerationStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface Move {
  name: string;
  type: PokemonType;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number;
  description: string;
}

export interface Ability {
  name: string;
  description: string;
}

export interface PokemonAbilities {
  primary: Ability;
  secondary?: Ability | null;
  hidden: Ability;
}

export interface GeneratorFormInput {
  description: string;
  type1: PokemonType;
  type2?: PokemonType | null;
  region: Region;
  habitat: Habitat;
  evolutionStage: EvolutionStage;
}

export interface ClaudePokemonOutput {
  name: string;
  pokedexEntry: string;
  stats: PokemonStats;
  moves: Move[];
  abilities: PokemonAbilities;
  height: number;
  weight: number;
  catchRate: number;
  genderRatio: GenderRatio;
  eggGroup1: EggGroup;
  eggGroup2?: EggGroup | null;
  experienceCurve: ExperienceCurve;
  baseFriendship: number;
  colorCategory: ColorCategory;
}

export interface Pokemon {
  id: string;
  userId: string;
  name: string;
  slug: string;
  userDescription: string;
  pokedexEntry: string;
  type1: PokemonType;
  type2: PokemonType | null;
  region: Region;
  habitat: Habitat;
  evolutionStage: EvolutionStage;
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  height: number;
  weight: number;
  ability1Name: string;
  ability1Desc: string;
  ability2Name: string | null;
  ability2Desc: string | null;
  hiddenAbilityName: string;
  hiddenAbilityDesc: string;
  catchRate: number;
  genderRatio: GenderRatio;
  eggGroup1: EggGroup;
  eggGroup2: EggGroup | null;
  experienceCurve: ExperienceCurve;
  baseFriendship: number;
  colorCategory: ColorCategory;
  imageUrl: string;
  imagePrompt: string;
  rarity: Rarity;
  cardNumber: number | null;
  favoriteCount: number;
  isPublic: boolean;
  evolutionChainId: string | null;
  createdAt: Date;
  moves?: PokemonMove[];
}

export interface PokemonMove {
  id: string;
  pokemonId: string;
  name: string;
  type: PokemonType;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number;
  description: string;
  sortOrder: number;
}

export interface PokemonWithMoves extends Pokemon {
  moves: PokemonMove[];
}

export interface CardVariant {
  size: "full" | "mini";
  showFlip?: boolean;
}

export const POKEMON_TYPES: PokemonType[] = [
  "FIRE", "WATER", "GRASS", "ELECTRIC", "ICE", "FIGHTING",
  "POISON", "GROUND", "FLYING", "PSYCHIC", "BUG", "ROCK",
  "GHOST", "DRAGON", "DARK", "STEEL", "FAIRY", "NORMAL",
];

export const REGIONS: Region[] = [
  "KANTO", "JOHTO", "HOENN", "SINNOH", "UNOVA",
  "KALOS", "ALOLA", "GALAR", "PALDEA", "CUSTOM",
];

export const HABITATS: Habitat[] = ["LAND", "SEA", "SKY"];

export const EVOLUTION_STAGES: EvolutionStage[] = ["BASIC", "STAGE1", "STAGE2"];

export const RARITY_LABELS: Record<Rarity, string> = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  HOLO_RARE: "Holo Rare",
  FULL_ART: "Full Art",
  SECRET_RARE: "Secret Rare",
};
