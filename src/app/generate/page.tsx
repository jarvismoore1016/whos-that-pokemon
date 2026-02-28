"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GeneratorForm } from "@/components/generator/GeneratorForm";
import { GenerationProgress } from "@/components/generator/GenerationProgress";
import { generatePokemon } from "@/actions/generate-pokemon";
import type { GeneratorFormInput, PokemonType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PageState = "form" | "generating" | "done" | "error";

export default function GeneratePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("form");
  const [selectedType, setSelectedType] = useState<PokemonType | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [pokemonId, setPokemonId] = useState<string>("");

  async function handleGenerate(data: GeneratorFormInput) {
    setSelectedType(data.type1);
    setState("generating");

    const result = await generatePokemon(data);

    if (result.success && result.pokemonId) {
      setPokemonId(result.pokemonId);
      setState("done");
      toast.success("Your Pokémon was created!", { description: "Redirecting to your card..." });
      setTimeout(() => router.push(`/pokemon/${result.pokemonId}`), 1500);
    } else {
      setErrorMsg(result.error ?? "Generation failed");
      setState("error");
      toast.error("Generation failed", { description: result.error });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            Create Your Pokémon
          </h1>
          <p className="text-white/60">Describe it, pick its type and region, and AI does the rest.</p>
        </div>

        {/* Demo example */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 flex items-center gap-4">
          <div className="text-4xl" aria-hidden="true">🔥🐉</div>
          <div>
            <p className="font-bold text-sm">Pyrodrake — Fire/Dragon type from Hoenn</p>
            <p className="text-white/50 text-xs italic">&quot;Swoops from volcanic peaks, leaving trails of fire in the night sky.&quot;</p>
            <p className="text-white/40 text-xs mt-1">Made in 14 seconds · Create yours ↓</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <GeneratorForm onSubmit={handleGenerate} isLoading={false} />
            </motion.div>
          )}

          {state === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <GenerationProgress type1={selectedType} isComplete={false} />
            </motion.div>
          )}

          {state === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4" aria-hidden="true">✅</div>
              <h2 className="text-xl font-bold mb-2">Pokémon Created!</h2>
              <p className="text-white/60 text-sm mb-4">Redirecting to your card...</p>
              <Button asChild variant="outline" className="border-white/30 text-white">
                <a href={`/pokemon/${pokemonId}`}>View Now →</a>
              </Button>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-950/50 border border-red-500/30 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4" aria-hidden="true">❌</div>
              <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
              <p className="text-red-300 text-sm mb-6">{errorMsg}</p>
              <Button
                onClick={() => setState("form")}
                variant="outline"
                className="border-red-400/50 text-red-300 hover:bg-red-950/50"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
