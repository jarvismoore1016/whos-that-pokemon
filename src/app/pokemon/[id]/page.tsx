import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PokemonCardFlip } from "@/components/pokemon-card/PokemonCardFlip";
import { FavoriteButton } from "@/components/social/FavoriteButton";
import { ShareButton } from "@/components/social/ShareButton";
import { isFavorited } from "@/actions/favorites";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PokemonWithMoves } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const p = await db.query.pokemon.findFirst({
    where: (poke, { eq }) => eq(poke.id, id),
    with: { moves: { orderBy: (m, { asc }) => [asc(m.sortOrder)] } },
  });

  if (!p) notFound();

  // Only show private pokemon to their owner
  if (!p.isPublic && p.userId !== session?.user?.id) notFound();

  const favorited = session?.user?.id ? await isFavorited(id) : false;
  const isOwner = session?.user?.id === p.userId;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/pokemon">← My Collection</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/explore">🌍 Explore</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Card flip */}
          <div className="flex justify-center">
            <PokemonCardFlip pokemon={p as unknown as PokemonWithMoves} />
          </div>

          {/* Details panel */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-black mb-1">{p.name}</h1>
              <p className="text-white/60 italic">&quot;{p.pokedexEntry}&quot;</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {session?.user?.id && (
                <FavoriteButton pokemonId={p.id} initialFavorited={favorited} initialCount={p.favoriteCount} />
              )}
              <ShareButton pokemonId={p.id} pokemonName={p.name} />
              {isOwner && (
                <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Link href={`/pokemon/${p.id}/add-form`}>+ Add Form</Link>
                </Button>
              )}
            </div>

            {/* Moves */}
            {p.moves && p.moves.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Moves</h2>
                <div className="space-y-2">
                  {p.moves.map((move) => (
                    <div key={move.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-sm">{move.name}</span>
                        <p className="text-white/50 text-xs mt-0.5">{move.description}</p>
                      </div>
                      <div className="text-right shrink-0 text-xs text-white/60 font-mono">
                        {move.power ? <div>PWR {move.power}</div> : <div>—</div>}
                        {move.accuracy && <div>ACC {move.accuracy}%</div>}
                        <div>PP {move.pp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info grid */}
            <div>
              <h2 className="text-lg font-bold mb-3">Pokédex Data</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Region", p.region],
                  ["Habitat", p.habitat],
                  ["Stage", p.evolutionStage.replace("STAGE", "Stage ")],
                  ["Height", `${p.height}m`],
                  ["Weight", `${p.weight}kg`],
                  ["Catch Rate", p.catchRate],
                  ["Gender", p.genderRatio.replace("_", "/")],
                  ["Egg Group", p.eggGroup1],
                  ["Exp Curve", p.experienceCurve.replace(/_/g, " ")],
                  ["Friendship", p.baseFriendship],
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-white/5 rounded px-3 py-2">
                    <span className="text-white/40 text-xs">{label}: </span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
