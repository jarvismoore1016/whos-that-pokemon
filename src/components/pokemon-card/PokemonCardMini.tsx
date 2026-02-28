"use client";

import Image from "next/image";
import Link from "next/link";
import { TYPE_COLORS, TYPE_EMOJI } from "@/lib/type-colors";
import { RARITY_CONFIG } from "@/lib/rarity";
import type { Pokemon, Rarity, PokemonType } from "@/lib/types";
import "./card.css";

interface PokemonCardMiniProps {
  pokemon: Pokemon;
  href?: string;
  className?: string;
  showLink?: boolean;
}

export function PokemonCardMini({ pokemon: p, href, className = "", showLink = true }: PokemonCardMiniProps) {
  const type1Color = TYPE_COLORS[p.type1 as PokemonType];
  const rarityConfig = RARITY_CONFIG[p.rarity as Rarity];
  const isHolo = ["HOLO_RARE", "FULL_ART", "SECRET_RARE"].includes(p.rarity);
  const isRainbow = p.rarity === "SECRET_RARE";

  const card = (
    <article
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl ${isHolo ? "card-holo" : ""} ${isRainbow ? "card-rainbow" : ""} ${className}`}
      style={{
        width: 200,
        height: 280,
        background: `linear-gradient(135deg, ${type1Color.hex}cc, ${type1Color.lightHex}cc)`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.15), 0 0 0 1.5px ${rarityConfig.glowColor === "rainbow" ? "#f472b6" : rarityConfig.glowColor === "transparent" ? "rgba(255,255,255,0.1)" : rarityConfig.glowColor}`,
      }}
      aria-label={`${p.name} - ${rarityConfig.label}`}
    >
      <div className="p-2 flex flex-col gap-1 h-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-white/60 font-mono text-[9px]">
            {p.cardNumber ? `#${String(p.cardNumber).padStart(3, "0")}` : ""}
          </span>
          <span className="text-white font-bold text-[10px]">HP {p.hp}</span>
        </div>

        {/* Image */}
        <div className="relative flex-1 rounded overflow-hidden bg-white/10 mx-auto w-full max-w-[160px]">
          <Image
            src={p.imageUrl}
            alt={`${p.name} - ${p.type1.toLowerCase()} type Pokémon`}
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>

        {/* Name */}
        <h3 className="text-white font-black text-xs uppercase leading-tight truncate">
          {p.name}
        </h3>

        {/* Type badges */}
        <div className="flex gap-1 flex-wrap">
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white uppercase"
            style={{ backgroundColor: type1Color.hex }}
          >
            {TYPE_EMOJI[p.type1 as PokemonType]} {p.type1}
          </span>
          {p.type2 && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white uppercase"
              style={{ backgroundColor: TYPE_COLORS[p.type2 as PokemonType].hex }}
            >
              {TYPE_EMOJI[p.type2 as PokemonType]} {p.type2}
            </span>
          )}
        </div>

        {/* Rarity */}
        <div className="flex justify-between items-center text-[8px] border-t border-white/20 pt-1">
          <span className="text-white/60">{p.region}</span>
          <span style={{ color: rarityConfig.textColor }} className="font-bold">
            {rarityConfig.label}
          </span>
        </div>
      </div>
    </article>
  );

  if (showLink && href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}
