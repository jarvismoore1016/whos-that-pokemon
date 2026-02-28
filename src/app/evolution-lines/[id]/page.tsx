import { notFound } from "next/navigation";
import { getEvolutionChain } from "@/actions/evolution-chains";
import { EvolutionTree } from "@/components/evolution/EvolutionTree";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Pokemon } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EvolutionLineDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getEvolutionChain(id);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/evolution-lines">← Back</Link>
          </Button>
          <h1 className="text-2xl font-black">{data.chain.name}</h1>
        </div>

        {data.chain.description && (
          <p className="text-muted-foreground mb-6">{data.chain.description}</p>
        )}

        <EvolutionTree
          members={data.members.map((m) => ({
            ...m,
            pokemon: m.pokemon as unknown as Pokemon | null,
          }))}
          chainName={data.chain.name}
        />
      </div>
    </main>
  );
}
