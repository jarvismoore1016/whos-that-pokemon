import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/pokemon");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-sm w-full text-white text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🎮</div>
        <h1 className="text-2xl font-black mb-2">Sign In</h1>
        <p className="text-white/60 text-sm mb-8">Create and collect AI-generated Pokémon</p>

        <div className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/pokemon" });
            }}
          >
            <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white border border-white/20 gap-2">
              <span aria-hidden="true">🐙</span> Continue with GitHub
            </Button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/pokemon" });
            }}
          >
            <Button type="submit" className="w-full h-12 bg-white hover:bg-gray-100 text-black gap-2">
              <span aria-hidden="true">🔵</span> Continue with Google
            </Button>
          </form>
        </div>

        <p className="text-white/30 text-xs mt-6">
          By signing in, you agree to our terms. Not affiliated with Nintendo or Game Freak.
        </p>
      </div>
    </main>
  );
}
