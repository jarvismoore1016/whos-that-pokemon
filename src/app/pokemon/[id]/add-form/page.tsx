import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AddFormPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const p = await db.query.pokemon.findFirst({
    where: (poke, { and, eq }) =>
      and(eq(poke.id, id), eq(poke.userId, session.user!.id!)),
    columns: { id: true, name: true, evolutionStage: true },
  });

  if (!p) notFound();

  // Check level requirement
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.user!.id!),
    columns: { level: true },
  });

  const canMega = (user?.level ?? 0) >= 20;
  const canGigantamax = (user?.level ?? 0) >= 30;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href={`/pokemon/${id}`}>← Back</Link>
          </Button>
          <h1 className="text-2xl font-black">Add Form — {p.name}</h1>
        </div>

        <div className="grid gap-4">
          {/* Dynamax — always available */}
          <div className="rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-1">Dynamax Form</h2>
            <p className="text-muted-foreground text-sm mb-3">Available to all Pokémon. Gigantic battle form with boosted HP.</p>
            <Button>Generate Dynamax Form</Button>
          </div>

          {/* Mega — Level 20+ */}
          <div className={`rounded-xl border p-6 ${!canMega ? "opacity-50" : ""}`}>
            <h2 className="font-bold text-lg mb-1">Mega Evolution</h2>
            <p className="text-muted-foreground text-sm mb-3">
              {canMega
                ? "Create a Mega form with boosted stats and a unique ability."
                : "Unlocks at Level 20"}
            </p>
            <Button disabled={!canMega}>Generate Mega Form</Button>
          </div>

          {/* Gigantamax — Level 30+ */}
          <div className={`rounded-xl border p-6 ${!canGigantamax ? "opacity-50" : ""}`}>
            <h2 className="font-bold text-lg mb-1">Gigantamax Form</h2>
            <p className="text-muted-foreground text-sm mb-3">
              {canGigantamax
                ? "Create a Gigantamax form with a unique G-Max move."
                : "Unlocks at Level 30"}
            </p>
            <Button disabled={!canGigantamax}>Generate Gigantamax Form</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
