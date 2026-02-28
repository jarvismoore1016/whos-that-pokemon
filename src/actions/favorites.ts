"use server";

import { auth } from "@/auth";
import { db, pokemonFavorites, pokemon } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function toggleFavorite(pokemonId: string): Promise<{ favorited: boolean; count: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const existing = await db.query.pokemonFavorites.findFirst({
    where: (f, { and, eq }) => and(eq(f.userId, userId), eq(f.pokemonId, pokemonId)),
  });

  if (existing) {
    // Unfavorite
    await db.delete(pokemonFavorites).where(
      and(eq(pokemonFavorites.userId, userId), eq(pokemonFavorites.pokemonId, pokemonId))
    );
    await db
      .update(pokemon)
      .set({ favoriteCount: sql`${pokemon.favoriteCount} - 1` })
      .where(eq(pokemon.id, pokemonId));

    const updated = await db.query.pokemon.findFirst({
      where: (p, { eq }) => eq(p.id, pokemonId),
      columns: { favoriteCount: true },
    });
    return { favorited: false, count: updated?.favoriteCount ?? 0 };
  } else {
    // Favorite
    await db.insert(pokemonFavorites).values({
      id: randomUUID(),
      userId,
      pokemonId,
    });
    await db
      .update(pokemon)
      .set({ favoriteCount: sql`${pokemon.favoriteCount} + 1` })
      .where(eq(pokemon.id, pokemonId));

    const updated = await db.query.pokemon.findFirst({
      where: (p, { eq }) => eq(p.id, pokemonId),
      columns: { favoriteCount: true },
    });
    return { favorited: true, count: updated?.favoriteCount ?? 0 };
  }
}

export async function isFavorited(pokemonId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const existing = await db.query.pokemonFavorites.findFirst({
    where: (f, { and, eq }) =>
      and(eq(f.userId, session.user!.id!), eq(f.pokemonId, pokemonId)),
  });

  return !!existing;
}
