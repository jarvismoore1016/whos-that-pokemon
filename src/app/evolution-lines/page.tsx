import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserEvolutionChains } from "@/actions/evolution-chains";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EvolutionLinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const chains = await getUserEvolutionChains();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">Evolution Lines</h1>
            <p className="text-muted-foreground">Build and manage your Pokémon evolution chains</p>
          </div>
          <Button asChild>
            <Link href="/evolution-lines/new">+ New Chain</Link>
          </Button>
        </div>

        {chains.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4" aria-hidden="true">🧬</div>
            <h2 className="text-xl font-bold mb-2">No evolution lines yet</h2>
            <p className="text-muted-foreground mb-4">
              Create Pokémon at different stages, then link them into evolution chains.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/generate">Generate Pokémon</Link>
              </Button>
              <Button asChild>
                <Link href="/evolution-lines/new">Create Chain</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {chains.map((chain) => (
              <Link
                key={chain.id}
                href={`/evolution-lines/${chain.id}`}
                className="rounded-xl border p-6 hover:border-primary/50 transition-colors flex items-center gap-4"
              >
                <div className="text-3xl" aria-hidden="true">🧬</div>
                <div>
                  <h2 className="font-bold">{chain.name}</h2>
                  {chain.description && (
                    <p className="text-muted-foreground text-sm">{chain.description}</p>
                  )}
                </div>
                <div className="ml-auto text-muted-foreground text-sm">View →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
