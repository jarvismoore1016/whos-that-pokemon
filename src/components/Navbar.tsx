import Link from "next/link";
import { signIn, signOut } from "@/auth";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-black text-lg hover:opacity-80 transition-opacity">
          <span className="text-yellow-500" aria-hidden="true">⚡ </span>
          WTP?
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/generate" className="px-3 py-2 rounded-md hover:bg-accent transition-colors">Generate</Link>
          <Link href="/explore" className="px-3 py-2 rounded-md hover:bg-accent transition-colors">Explore</Link>
          {session?.user && (
            <>
              <Link href="/pokemon" className="px-3 py-2 rounded-md hover:bg-accent transition-colors">Collection</Link>
              <Link href="/packs" className="px-3 py-2 rounded-md hover:bg-accent transition-colors">Packs</Link>
              <Link href="/evolution-lines" className="px-3 py-2 rounded-md hover:bg-accent transition-colors">Evolution</Link>
            </>
          )}
          <Link href="/challenges" className="px-3 py-2 rounded-md hover:bg-accent transition-colors">Challenges</Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User avatar"}
                  className="w-8 h-8 rounded-full border"
                />
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">Sign Out</Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
