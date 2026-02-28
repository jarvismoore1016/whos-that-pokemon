"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PokemonCard } from "@/components/pokemon-card/PokemonCard";
import { Button } from "@/components/ui/button";
import type { PokemonWithMoves } from "@/lib/types";
import { RARITY_CONFIG } from "@/lib/rarity";
import type { Rarity } from "@/lib/types";

interface PackOpeningProps {
  pokemon: PokemonWithMoves[];
  onDone: () => void;
}

export function PackOpening({ pokemon, onDone }: PackOpeningProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [packOpen, setPackOpen] = useState(false);

  const currentCard = pokemon[revealedCount - 1];
  const isHolo = currentCard && ["HOLO_RARE", "FULL_ART", "SECRET_RARE"].includes(currentCard.rarity);

  function handleOpenPack() {
    setPackOpen(true);
    setTimeout(() => revealNext(), 500);
  }

  function revealNext() {
    setRevealedCount((c) => c + 1);
  }

  const isDone = revealedCount >= pokemon.length;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <AnimatePresence mode="wait">
        {!packOpen ? (
          <motion.div
            key="pack"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, rotate: 5 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="w-48 h-72 rounded-2xl flex items-center justify-center text-6xl shadow-2xl cursor-pointer select-none"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #1d4ed8, #7c3aed)",
                backgroundSize: "300% 300%",
                animation: "rainbow-border 3s linear infinite",
                border: "3px solid rgba(255,255,255,0.3)",
              }}
              onClick={handleOpenPack}
              onKeyDown={(e) => e.key === "Enter" && handleOpenPack()}
              tabIndex={0}
              role="button"
              aria-label="Open booster pack"
            >
              ⚡
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">Booster Pack</p>
              <p className="text-muted-foreground text-sm">5 cards · 1 guaranteed Rare+</p>
            </div>
            <Button size="lg" onClick={handleOpenPack} className="px-8">
              🎁 Open Pack
            </Button>
          </motion.div>
        ) : !isDone ? (
          <motion.div
            key={`reveal-${revealedCount}`}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            {currentCard && (
              <>
                {/* Special animation for Holo Rare+ */}
                {isHolo && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8 }}
                    className="absolute text-6xl pointer-events-none"
                    aria-hidden="true"
                  >
                    ✨
                  </motion.div>
                )}
                <PokemonCard pokemon={currentCard} />
                <div className="text-center">
                  <p className="font-bold">{currentCard.name}</p>
                  <p
                    className="text-sm font-bold"
                    style={{ color: RARITY_CONFIG[currentCard.rarity as Rarity]?.textColor }}
                  >
                    {RARITY_CONFIG[currentCard.rarity as Rarity]?.label}
                  </p>
                </div>
              </>
            )}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {revealedCount} / {pokemon.length}
              </span>
              {revealedCount < pokemon.length ? (
                <Button onClick={revealNext} size="lg">
                  Next Card →
                </Button>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-2xl font-black">Pack Complete!</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {pokemon.map((p) => (
                <div key={p.id} className="text-center">
                  <div
                    className="w-20 h-28 rounded-lg overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, #3b82f655, #6366f155)`,
                      border: `1px solid ${RARITY_CONFIG[p.rarity as Rarity]?.glowColor === "rainbow" ? "#f472b6" : RARITY_CONFIG[p.rarity as Rarity]?.glowColor}`,
                    }}
                  />
                  <p className="text-xs font-bold mt-1 w-20 truncate">{p.name}</p>
                  <p
                    className="text-[10px]"
                    style={{ color: RARITY_CONFIG[p.rarity as Rarity]?.textColor }}
                  >
                    {RARITY_CONFIG[p.rarity as Rarity]?.label}
                  </p>
                </div>
              ))}
            </div>
            <Button size="lg" onClick={onDone}>
              View Collection →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
