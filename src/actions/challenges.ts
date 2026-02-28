"use server";

import { auth } from "@/auth";
import { db, challenges, challengeEntries } from "@/lib/db";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function getActiveChallenges() {
  const now = new Date();
  return db.query.challenges.findMany({
    where: (c, { and, lte, gte, or, isNull }) =>
      or(
        isNull(c.endsAt),
        gte(c.endsAt, now)
      ),
    orderBy: [desc(challenges.startsAt)],
    limit: 5,
  });
}

export async function enterChallenge(challengeId: string, pokemonId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  // Check already entered
  const existing = await db.query.challengeEntries.findFirst({
    where: (e, { and, eq }) =>
      and(eq(e.challengeId, challengeId), eq(e.userId, userId)),
  });
  if (existing) throw new Error("Already entered this challenge");

  await db.insert(challengeEntries).values({
    id: randomUUID(),
    challengeId,
    userId,
    pokemonId,
  });
}

export async function getChallengeEntries(challengeId: string) {
  return db.query.challengeEntries.findMany({
    where: (e, { eq }) => eq(e.challengeId, challengeId),
    orderBy: (e, { desc }) => [desc(e.voteCount)],
    limit: 50,
  });
}
