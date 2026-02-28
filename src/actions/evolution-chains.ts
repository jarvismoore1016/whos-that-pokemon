"use server";

import { auth } from "@/auth";
import { db, evolutionChains, evolutionChainMembers, pokemon } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function createEvolutionChain(name: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    columns: { level: true },
  });

  if (!user || user.level < 10) {
    throw new Error("Evolution Line builder unlocks at Level 10");
  }

  const id = randomUUID();
  await db.insert(evolutionChains).values({ id, userId, name, description });
  return { id };
}

export async function addToEvolutionChain(
  chainId: string,
  pokemonId: string,
  stage: number,
  evolutionTrigger: string,
  triggerDetail?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Verify chain belongs to user
  const chain = await db.query.evolutionChains.findFirst({
    where: (c, { and, eq }) =>
      and(eq(c.id, chainId), eq(c.userId, session.user!.id!)),
  });
  if (!chain) throw new Error("Evolution chain not found");

  // Verify pokemon belongs to user
  const poke = await db.query.pokemon.findFirst({
    where: (p, { and, eq }) =>
      and(eq(p.id, pokemonId), eq(p.userId, session.user!.id!)),
  });
  if (!poke) throw new Error("Pokémon not found");

  const existing = await db.query.evolutionChainMembers.findMany({
    where: (m, { eq }) => eq(m.chainId, chainId),
  });

  await db.insert(evolutionChainMembers).values({
    id: randomUUID(),
    chainId,
    pokemonId,
    stage,
    evolutionTrigger,
    triggerDetail: triggerDetail ?? null,
    sortOrder: existing.length,
  });

  // Update pokemon's evolutionChainId
  await db
    .update(pokemon)
    .set({ evolutionChainId: chainId })
    .where(eq(pokemon.id, pokemonId));
}

export async function getEvolutionChain(chainId: string) {
  const chain = await db.query.evolutionChains.findFirst({
    where: (c, { eq }) => eq(c.id, chainId),
  });
  if (!chain) return null;

  const members = await db.query.evolutionChainMembers.findMany({
    where: (m, { eq }) => eq(m.chainId, chainId),
    orderBy: (m, { asc }) => [asc(m.sortOrder)],
  });

  const pokemonData = await Promise.all(
    members.map((m) =>
      db.query.pokemon.findFirst({
        where: (p, { eq }) => eq(p.id, m.pokemonId),
        with: { moves: true },
      })
    )
  );

  return {
    chain,
    members: members.map((m, i) => ({
      ...m,
      pokemon: pokemonData[i] ?? null,
    })),
  };
}

export async function getUserEvolutionChains(userId?: string) {
  const session = await auth();
  const targetId = userId ?? session?.user?.id;
  if (!targetId) return [];

  return db.query.evolutionChains.findMany({
    where: (c, { eq }) => eq(c.userId, targetId),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}
