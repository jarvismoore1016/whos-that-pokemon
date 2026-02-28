"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pokemon, moves, generationHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generatePokemonWithClaude, buildImagePrompt } from "@/lib/ai/generate-pokemon";
import { generatePokemonImage } from "@/lib/ai/generate-image";
import { storeImage } from "@/lib/ai/store-image";
import { assignRarity, getStatTotal } from "@/lib/rarity";
import { checkRateLimit, getPokemonRateLimit } from "@/lib/rate-limit";
import type { GeneratorFormInput } from "@/lib/types";
import { randomUUID } from "crypto";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface GenerationResult {
  success: boolean;
  pokemonId?: string;
  error?: string;
  rateLimited?: boolean;
}

export async function generatePokemon(input: GeneratorFormInput): Promise<GenerationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to generate Pokémon" };
  }

  const userId = session.user.id;

  // Rate limit check
  const rateResult = await checkRateLimit(getPokemonRateLimit, userId).catch(() => null);
  if (rateResult && !rateResult.success) {
    return {
      success: false,
      error: `Daily generation limit reached. Resets in ${Math.ceil((rateResult.reset - Date.now()) / 1000 / 60 / 60)} hours.`,
      rateLimited: true,
    };
  }

  const generationId = randomUUID();

  // Create history record
  await db.insert(generationHistory).values({
    id: generationId,
    userId,
    userInput: JSON.stringify(input),
    status: "PENDING",
  });

  try {
    // 1. Generate Pokémon data with Claude
    const claudeOutput = await generatePokemonWithClaude(input);

    // 2. Build image prompt
    const imagePrompt = buildImagePrompt(claudeOutput.name, input, claudeOutput);

    // 3. Generate image with Replicate
    const replicateUrl = await generatePokemonImage(imagePrompt);

    // 4. Store image permanently in Vercel Blob
    const blobUrl = await storeImage(replicateUrl, userId, generationId);

    // 5. Calculate rarity
    const statTotal = getStatTotal(claudeOutput.stats);
    const rarity = assignRarity({ statTotal, evolutionStage: input.evolutionStage });

    // 6. Generate unique slug
    const baseSlug = slugify(claudeOutput.name);
    const existingCount = await db.query.pokemon.findMany({
      where: (p, { and, eq, like }) =>
        and(eq(p.userId, userId), like(p.slug, `${baseSlug}%`)),
    });
    const slug = existingCount.length > 0 ? `${baseSlug}-${existingCount.length}` : baseSlug;

    // 7. Get next card number
    const userPokemon = await db.query.pokemon.findMany({
      where: (p, { eq }) => eq(p.userId, userId),
      columns: { cardNumber: true },
      orderBy: (p, { desc }) => [desc(p.cardNumber)],
      limit: 1,
    });
    const cardNumber = userPokemon[0]?.cardNumber ? userPokemon[0].cardNumber + 1 : 1;

    // 8. Save to database
    const pokemonId = randomUUID();

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

    // 9. Save moves
    await db.insert(moves).values(
      claudeOutput.moves.map((move, i) => ({
        id: randomUUID(),
        pokemonId,
        name: move.name,
        type: move.type,
        damageClass: move.damageClass,
        power: move.power ?? null,
        accuracy: move.accuracy ?? null,
        pp: move.pp,
        description: move.description,
        sortOrder: i + 1,
      }))
    );

    // 10. Update history record
    await db
      .update(generationHistory)
      .set({
        pokemonId,
        claudeResponse: JSON.stringify(claudeOutput),
        imagePrompt,
        replicateUrl,
        blobUrl,
        status: "SUCCESS",
      })
      .where(eq(generationHistory.id, generationId));

    // 11. Award XP to user
    await awardXP(userId, 100);

    return { success: true, pokemonId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await db
      .update(generationHistory)
      .set({ status: "FAILED", errorMessage })
      .where(eq(generationHistory.id, generationId));

    return { success: false, error: errorMessage };
  }
}

async function awardXP(userId: string, amount: number) {
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    columns: { xp: true, level: true },
  });

  if (!user) return;

  const newXp = user.xp + amount;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

  const { users } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(users).set({ xp: newXp, level: newLevel }).where(eq(users.id, userId));
}
