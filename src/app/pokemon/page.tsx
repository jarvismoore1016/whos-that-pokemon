import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pokemon } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { PokemonCardMini } from "@/components/pokemon-card/PokemonCardMini";
import { Button } from "@/components/ui/button";
import type { Pokemon } from "@/lib/types";

export default async function CollectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userPokemon = await db.query.pokemon.findMany({
    where: eq(pokemon.userId, session.user.id),
    orderBy: [desc(pokemon.createdAt)],
    with: { moves: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">My Collection</h1>
            <p className="text-muted-foreground">{userPokemon.length} Pokémon created</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/packs">📦 Open Pack</Link>
            </Button>
            <Button asChild>
              <Link href="/generate">✨ Generate New</Link>
            </Button>
          </div>
        </div>

        {userPokemon.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {userPokemon.map((p) => (
              <PokemonCardMini
                key={p.id}
                pokemon={p as unknown as Pokemon}
                href={`/pokemon/${p.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="flex justify-center gap-4 mb-8 opacity-40" aria-hidden="true">
        {["🔥🐉", "💧👻", "⚡⚙️"].map((emoji) => (
          <div
            key={emoji}
            className="w-48 h-64 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-4xl blur-sm"
          >
            {emoji}
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-2">Your collection is empty</h2>
      <p className="text-muted-foreground mb-6">Generate your first Pokémon to start your collection.</p>
      <Button asChild size="lg">
        <Link href="/generate">✨ Generate Your First Pokémon →</Link>
      </Button>
    </div>
  );
}
