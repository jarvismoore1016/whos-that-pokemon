import { getActiveChallenges } from "@/actions/challenges";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ChallengesPage() {
  const [session, activeChallenges] = await Promise.all([auth(), getActiveChallenges()]);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">Weekly Challenges</h1>
            <p className="text-muted-foreground">Create Pokémon themed around each week&apos;s prompt</p>
          </div>
          <Button asChild>
            <Link href="/generate">✨ Generate Entry</Link>
          </Button>
        </div>

        {activeChallenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4" aria-hidden="true">🏆</div>
            <h2 className="text-xl font-bold mb-2">No active challenges</h2>
            <p className="text-muted-foreground">Check back Friday for the next challenge!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="rounded-xl border p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{challenge.title}</h2>
                    <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                    {challenge.theme && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1">
                        🎨 Theme: {challenge.theme}
                      </span>
                    )}
                    {challenge.constraint && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 rounded-full px-3 py-1 ml-2">
                        ⚡ Constraint: {challenge.constraint}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {challenge.endsAt && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Ends {new Date(challenge.endsAt).toLocaleDateString()}
                      </p>
                    )}
                    {session?.user ? (
                      <Button asChild size="sm">
                        <Link href={`/generate?challenge=${challenge.id}`}>Enter Challenge</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/auth/signin">Sign In to Enter</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
