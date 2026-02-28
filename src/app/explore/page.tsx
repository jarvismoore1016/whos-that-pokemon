import { db } from "@/lib/db";
import { pokemon } from "@/lib/db/schema";
import { eq, and, desc, like } from "drizzle-orm";
import { PokemonCardMini } from "@/components/pokemon-card/PokemonCardMini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Pokemon } from "@/lib/types";

interface Props {
  searchParams: Promise<{ type?: string; region?: string; search?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const publicPokemon = await db.query.pokemon.findMany({
    where: (p, { eq, and, like }) => {
      const conditions = [eq(p.isPublic, true)];
      if (params.type) conditions.push(eq(p.type1, params.type.toUpperCase()));
      if (params.search) conditions.push(like(p.name, `%${params.search}%`));
      return and(...conditions);
    },
    orderBy: [desc(pokemon.favoriteCount), desc(pokemon.createdAt)],
    limit: PAGE_SIZE,
    offset,
    with: { moves: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Community Pokédex</h1>
            <p className="text-muted-foreground">Explore AI-generated Pokémon from all creators</p>
          </div>
          <Button asChild>
            <Link href="/generate">✨ Create Yours</Link>
          </Button>
        </div>

        {/* Search form */}
        <form className="flex gap-2 mb-8" method="get">
          <Input
            name="search"
            defaultValue={params.search}
            placeholder="Search by name..."
            className="max-w-xs"
            aria-label="Search Pokémon by name"
          />
          <Button type="submit" variant="outline">Search</Button>
          {(params.search || params.type) && (
            <Button asChild variant="ghost">
              <Link href="/explore">Clear</Link>
            </Button>
          )}
        </form>

        {publicPokemon.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
            <h2 className="text-xl font-bold mb-2">No Pokémon found</h2>
            <p className="text-muted-foreground mb-4">
              {params.search ? `No results for "${params.search}"` : "Be the first to create one!"}
            </p>
            <Button asChild>
              <Link href="/generate">Generate First →</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {publicPokemon.map((p) => (
              <PokemonCardMini
                key={p.id}
                pokemon={p as unknown as Pokemon}
                href={`/pokemon/${p.id}`}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {publicPokemon.length === PAGE_SIZE && (
          <div className="flex justify-center gap-3 mt-10">
            {page > 1 && (
              <Button asChild variant="outline">
                <Link href={`/explore?page=${page - 1}${params.search ? `&search=${params.search}` : ""}`}>← Previous</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/explore?page=${page + 1}${params.search ? `&search=${params.search}` : ""}`}>Next →</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
