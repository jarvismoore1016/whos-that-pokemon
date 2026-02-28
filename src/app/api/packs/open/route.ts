import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePokemonWithClaude, buildImagePrompt } from "@/lib/ai/generate-pokemon";
import { generatePokemonImage } from "@/lib/ai/generate-image";
import { storeImage } from "@/lib/ai/store-image";
import { assignPackRarity, getStatTotal } from "@/lib/rarity";
import { checkRateLimit, getPackOpenLimit } from "@/lib/rate-limit";
import { db, pokemon, moves } from "@/lib/db";
import { randomUUID } from "crypto";
import type { GeneratorFormInput, PokemonType, Region, Habitat, EvolutionStage } from "@/lib/types";

const RANDOM_DESCRIPTIONS = [
  "A mystical forest guardian with glowing markings",
  "A mechanical insect with crystalline wings",
  "An ancient sea creature from the depths",
  "A storm cloud that has gained consciousness",
  "A desert mirage that can solidify",
  "A mountain spirit made of obsidian",
  "A bioluminescent cave dweller",
  "A spectral samurai bound to a sword",
];

const TYPES: PokemonType[] = ["FIRE","WATER","GRASS","ELECTRIC","ICE","FIGHTING","POISON","GROUND","FLYING","PSYCHIC","BUG","ROCK","GHOST","DRAGON","DARK","STEEL","FAIRY","NORMAL"];
const REGIONS: Region[] = ["KANTO","JOHTO","HOENN","SINNOH","UNOVA","KALOS","ALOLA","GALAR","PALDEA"];
const HABITATS: Habitat[] = ["LAND","SEA","SKY"];
const STAGES: EvolutionStage[] = ["BASIC","BASIC","STAGE1","STAGE1","STAGE2"];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  // Rate limit
  const rateResult = await checkRateLimit(getPackOpenLimit, userId).catch(() => null);
  if (rateResult && !rateResult.success) {
    const hours = Math.ceil((rateResult.reset - Date.now()) / 1000 / 60 / 60);
    return NextResponse.json(
      { success: false, error: `Daily pack limit reached. Resets in ${hours} hours.` },
      { status: 429 }
    );
  }

  const packPokemon = [];

  for (let i = 0; i < 5; i++) {
    try {
      const input: GeneratorFormInput = {
        description: randomPick(RANDOM_DESCRIPTIONS),
        type1: randomPick(TYPES),
        type2: Math.random() > 0.5 ? randomPick(TYPES) : null,
        region: randomPick(REGIONS),
        habitat: randomPick(HABITATS),
        evolutionStage: randomPick(STAGES),
      };

      const claudeOutput = await generatePokemonWithClaude(input);
      const imagePrompt = buildImagePrompt(claudeOutput.name, input, claudeOutput);
      const replicateUrl = await generatePokemonImage(imagePrompt);
      const generationId = randomUUID();
      const blobUrl = await storeImage(replicateUrl, userId, generationId);

      const rarity = assignPackRarity(i);
      const statTotal = getStatTotal(claudeOutput.stats);

      const pokemonId = randomUUID();
      const slug = claudeOutput.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now()}`;

      const userPokemon = await db.query.pokemon.findMany({
        where: (p, { eq }) => eq(p.userId, userId),
        columns: { cardNumber: true },
        orderBy: (p, { desc }) => [desc(p.cardNumber)],
        limit: 1,
      });
      const cardNumber = userPokemon[0]?.cardNumber ? userPokemon[0].cardNumber + 1 : 1;

      await db.insert(pokemon).values({
        id: pokemonId,
        userId,
        name: claudeOutput.name,
        slug,
        userDescription: input.description,
        pokedexEntry: claudeOutput.pokedexEntry,
        type1: input.type1,
        type2: input.type2 ?? null,
        region: input.region,
        habitat: input.habitat,
        evolutionStage: input.evolutionStage,
        hp: claudeOutput.stats.hp,
        attack: claudeOutput.stats.attack,
        defense: claudeOutput.stats.defense,
        spAtk: claudeOutput.stats.spAtk,
        spDef: claudeOutput.stats.spDef,
        speed: claudeOutput.stats.speed,
        height: claudeOutput.height,
        weight: claudeOutput.weight,
        ability1Name: claudeOutput.abilities.primary.name,
        ability1Desc: claudeOutput.abilities.primary.description,
        ability2Name: claudeOutput.abilities.secondary?.name ?? null,
        ability2Desc: claudeOutput.abilities.secondary?.description ?? null,
        hiddenAbilityName: claudeOutput.abilities.hidden.name,
        hiddenAbilityDesc: claudeOutput.abilities.hidden.description,
        catchRate: claudeOutput.catchRate,
        genderRatio: claudeOutput.genderRatio,
        eggGroup1: claudeOutput.eggGroup1,
        eggGroup2: claudeOutput.eggGroup2 ?? null,
        experienceCurve: claudeOutput.experienceCurve,
        baseFriendship: claudeOutput.baseFriendship,
        colorCategory: claudeOutput.colorCategory,
        imageUrl: blobUrl,
        imagePrompt,
        rarity,
        cardNumber,
        isPublic: true,
      });

      await db.insert(moves).values(
        claudeOutput.moves.map((move, idx) => ({
          id: randomUUID(),
          pokemonId,
          name: move.name,
          type: move.type,
          damageClass: move.damageClass,
          power: move.power ?? null,
          accuracy: move.accuracy ?? null,
          pp: move.pp,
          description: move.description,
          sortOrder: idx + 1,
        }))
      );

      const savedPokemon = await db.query.pokemon.findFirst({
        where: (p, { eq }) => eq(p.id, pokemonId),
        with: { moves: true },
      });

      if (savedPokemon) packPokemon.push(savedPokemon);
    } catch (error) {
      console.error(`Failed to generate pack card ${i + 1}:`, error);
    }
  }

  return NextResponse.json({ success: true, pokemon: packPokemon });
}
