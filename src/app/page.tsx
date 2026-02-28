import Link from "next/link";
import { db } from "@/lib/db";
import { count } from "drizzle-orm";
import { pokemon, users } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";

async function getStats() {
  try {
    const [pokemonCount] = await db.select({ count: count() }).from(pokemon);
    const [userCount] = await db.select({ count: count() }).from(users);
    return { pokemon: pokemonCount.count, users: userCount.count };
  } catch {
    return { pokemon: 0, users: 0 };
  }
}

const EXAMPLE_POKEMON = [
  { name: "Pyrodrake", type: "Fire/Dragon", gradient: "from-orange-500 to-red-600", emoji: "🔥🐉" },
  { name: "Abyssquill", type: "Water/Ghost", gradient: "from-blue-600 to-purple-700", emoji: "💧👻" },
  { name: "Volthorn", type: "Electric/Steel", gradient: "from-yellow-400 to-slate-500", emoji: "⚡⚙️" },
];

const FEATURES = [
  { icon: "🤖", title: "AI Generation", description: "Claude AI crafts authentic Pokémon with stats, moves, abilities, and lore that feel genuinely official." },
  { icon: "🎨", title: "Anime Artwork", description: "FLUX AI generates beautiful anime-style artwork for every Pokémon you create, stored permanently." },
  { icon: "🧬", title: "Evolution Lines", description: "Link your Pokémon into full evolution chains with triggers, visual trees, and Mega/Gigantamax forms." },
  { icon: "🃏", title: "TCG-Style Cards", description: "Each Pokémon becomes a collectible card with holographic effects, rarity tiers, and stat hexagons." },
  { icon: "📦", title: "Booster Packs", description: "Open daily booster packs with 5 random Pokémon. Rare pulls trigger special animations." },
  { icon: "🌍", title: "Community Pokédex", description: "Browse thousands of community-created Pokémon. Favorite, share, and enter weekly challenges." },
];

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <main className="flex flex-col min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed44 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1d4ed844 0%, transparent 50%)` }} aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Who&apos;s That Pokémon?
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Describe any creature you can imagine. AI generates it as a fully-realized Pokémon with stats, moves, artwork, and Pokédex entry.
          </p>
          {stats.pokemon > 0 && (
            <p className="text-white/50 text-sm mb-8 font-mono">
              {stats.users.toLocaleString()} creators have made {stats.pokemon.toLocaleString()} Pokémon
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg px-8 h-14 hover:from-yellow-300 hover:to-orange-400">
              <Link href="/generate">✨ Create Your Pokémon</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14">
              <Link href="/explore">🌍 Explore Community</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {EXAMPLE_POKEMON.map((ex) => (
              <div key={ex.name} className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${ex.gradient} p-4 w-48 h-56 flex flex-col items-center justify-center gap-2 shadow-xl`} aria-hidden="true">
                <div className="text-4xl">{ex.emoji}</div>
                <div className="text-white font-black text-lg">{ex.name}</div>
                <div className="text-white/70 text-xs">{ex.type}</div>
                <div className="absolute top-2 right-2 text-[9px] text-white/60 font-mono">✦ AI</div>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-4">Made in ~12 seconds · Create yours →</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-background" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl font-black text-center mb-12">Everything a Pokémon Needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border p-6 hover:border-primary/50 transition-colors">
                <div className="text-3xl mb-3" aria-hidden="true">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900 to-blue-900 text-white text-center">
        <h2 className="text-3xl font-black mb-4">Ready to be a Pokémon creator?</h2>
        <p className="text-white/70 mb-8">5 free generations per day. No credit card required.</p>
        <Button asChild size="lg" className="bg-white text-black font-bold text-lg px-8 h-12 hover:bg-white/90">
          <Link href="/generate">Start Creating →</Link>
        </Button>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 px-4 border-t text-center text-sm text-muted-foreground">
        <p>
          Built with Claude AI + Next.js · Not affiliated with Nintendo or Game Freak ·{" "}
          <Link href="/explore" className="underline hover:text-foreground">Explore</Link>
          {" · "}
          <Link href="/challenges" className="underline hover:text-foreground">Challenges</Link>
        </p>
      </footer>
    </main>
  );
}
