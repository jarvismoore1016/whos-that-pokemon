"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PokemonCard } from "./PokemonCard";
import { PokemonCardBack } from "./PokemonCardBack";
import type { PokemonWithMoves } from "@/lib/types";
import "./card.css";

interface PokemonCardFlipProps {
  pokemon: PokemonWithMoves;
  className?: string;
}

export function PokemonCardFlip({ pokemon, className = "" }: PokemonCardFlipProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`card-flip-container ${className}`}
      style={{ width: 350, height: 490, cursor: "pointer" }}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      tabIndex={0}
      role="button"
      aria-label={`${flipped ? "Front" : "Back"} of ${pokemon.name} card. Click to flip.`}
    >
      <motion.div
        className="card-flip-inner w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div className="card-face" style={{ backfaceVisibility: "hidden" }}>
          <PokemonCard pokemon={pokemon} />
        </div>

        {/* Back */}
        <div
          className="card-back"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <PokemonCardBack pokemon={pokemon} />
        </div>
      </motion.div>
    </div>
  );
}
