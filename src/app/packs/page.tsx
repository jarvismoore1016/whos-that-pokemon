"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PackOpening } from "@/components/packs/PackOpening";
import { Button } from "@/components/ui/button";
import type { PokemonWithMoves } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

async function openPackAction(): Promise<{ success: boolean; pokemon?: PokemonWithMoves[]; error?: string }> {
  const response = await fetch("/api/packs/open", { method: "POST" });
  return response.json();
}

export default function PacksPage() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "opening">("idle");
  const [packPokemon, setPackPokemon] = useState<PokemonWithMoves[]>([]);

  async function handleOpenPack() {
    setState("loading");
    const result = await openPackAction();

    if (result.success && result.pokemon) {
      setPackPokemon(result.pokemon);
      setState("opening");
    } else {
      toast.error("Could not open pack", { description: result.error });
      setState("idle");
    }
  }

  if (state === "opening" && packPokemon.length > 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <PackOpening
            pokemon={packPokemon}
            onDone={() => router.push("/pokemon")}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-black mb-2">Booster Packs</h1>
            <p className="text-white/60">Open a pack to get 5 new AI-generated Pokémon</p>
          </div>

          {/* Pack art */}
          <div
            className="w-48 h-72 mx-auto rounded-2xl flex items-center justify-center text-6xl shadow-2xl cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #1d4ed8)",
              border: "3px solid rgba(255,255,255,0.3)",
            }}
            aria-hidden="true"
          >
            ⚡
          </div>

          <div className="space-y-2 text-white/60 text-sm">
            <p>📦 5 Pokémon per pack</p>
            <p>⭐ 1 guaranteed Rare or better</p>
            <p>🎁 1 free pack per day</p>
          </div>

          <Button
            size="lg"
            onClick={handleOpenPack}
            disabled={state === "loading"}
            className="px-12 h-14 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400"
          >
            {state === "loading" ? "Generating..." : "🎁 Open Pack"}
          </Button>

          <p className="text-white/30 text-xs">
            Or{" "}
            <Link href="/generate" className="underline">
              generate individual Pokémon
            </Link>{" "}
            (5 per day)
          </p>
        </motion.div>
      </div>
    </main>
  );
}
