import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pokemon as pokemonTable, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PokemonCardMini } from "@/components/pokemon-card/PokemonCardMini";
import type { Pokemon } from "@/lib/types";

interface Props {
  params: Promise<{ username: string }>;
}

const LEVEL_UNLOCKS: Record<number, string> = {
  10: "Evolution Lines",
  20: "Mega Forms",
  30: "Gigantamax",
  40: "Master Creator",
};

function getLevelProgress(xp: number): { level: number; progressPct: number; nextLevelXp: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progressPct = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return { level, progressPct: Math.min(100, progressPct), nextLevelXp };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });
  if (!user) notFound();

  const userPokemon = await db.query.pokemon.findMany({
    where: (p, { and, eq }) => and(eq(p.userId, user.id), eq(p.isPublic, true)),
    orderBy: [desc(pokemonTable.createdAt)],
    limit: 30,
    with: { moves: true },
  });

  const { level, progressPct } = getLevelProgress(user.xp ?? 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="flex items-start gap-6 mb-10">
          {user.image && (
            // eslint-disable-next-line @next/next-optimized-images
            <img
              src={user.image}
              alt={`${user.name ?? username}'s avatar`}
              className="w-20 h-20 rounded-full border-4 border-primary/30"
            />
          )}
          <div>
            <h1 className="text-3xl font-black">{user.name ?? username}</h1>
            <p className="text-muted-foreground">@{username}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-bold">Level {level}</span>
              <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                  aria-label={`${progressPct.toFixed(0)}% to level ${level + 1}`}
                />
              </div>
            </div>
            {/* Unlocks */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(LEVEL_UNLOCKS)
                .filter(([reqLevel]) => level >= Number(reqLevel))
                .map(([, unlock]) => (
                  <span key={unlock} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                    ✓ {unlock}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            ["Pokémon Created", userPokemon.length],
            ["XP", user.xp?.toLocaleString() ?? 0],
            ["Level", level],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-black">{value}</div>
              <div className="text-muted-foreground text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Pokémon collection */}
        <h2 className="text-xl font-bold mb-4">Pokémon Collection</h2>
        {userPokemon.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No public Pokémon yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userPokemon.map((p) => (
              <PokemonCardMini key={p.id} pokemon={p as unknown as Pokemon} href={`/pokemon/${p.id}`} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
