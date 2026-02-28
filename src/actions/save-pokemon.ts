"use server";

import { auth } from "@/auth";
import { db, pokemon } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function togglePokemonVisibility(pokemonId: string): Promise<{ isPublic: boolean }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const p = await db.query.pokemon.findFirst({
    where: (poke, { and, eq }) =>
      and(eq(poke.id, pokemonId), eq(poke.userId, session.user!.id!)),
    columns: { isPublic: true },
  });

  if (!p) throw new Error("Pokémon not found");

  const newIsPublic = !p.isPublic;
  await db.update(pokemon).set({ isPublic: newIsPublic }).where(eq(pokemon.id, pokemonId));
  return { isPublic: newIsPublic };
}

export async function getUserPokemonCount(userId: string): Promise<number> {
  const result = await db.query.pokemon.findMany({
    where: (p, { eq }) => eq(p.userId, userId),
    columns: { id: true },
  });
  return result.length;
}
