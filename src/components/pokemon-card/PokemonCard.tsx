"use client";

import Image from "next/image";
import { TYPE_COLORS, TYPE_EMOJI } from "@/lib/type-colors";
import { RARITY_CONFIG } from "@/lib/rarity";
import type { PokemonWithMoves, Rarity, PokemonType } from "@/lib/types";
import { StatsHexagon } from "./StatsHexagon";
import { TypeBadge } from "./TypeBadge";
import "./card.css";

interface PokemonCardProps {
  pokemon: PokemonWithMoves;
  showFull?: boolean;
  className?: string;
}

function RarityStars({ rarity }: { rarity: Rarity }) {
  const config = RARITY_CONFIG[rarity];
  if (config.starCount === 0) return null;
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: config.starCount }).map((_, i) => (
        <span key={i} style={{ color: config.glowColor === "rainbow" ? "#f472b6" : config.glowColor }}>★</span>
      ))}
    </span>
  );
}

function MoveBadge({ move }: { move: PokemonWithMoves["moves"][number] }) {
  const color = TYPE_COLORS[move.type as PokemonType];
  const emoji = TYPE_EMOJI[move.type as PokemonType];
  return (
    <div
      className="move-badge text-white"
      style={{ backgroundColor: `${color.hex}cc` }}
    >
      <span className="flex items-center gap-1 truncate">
        <span aria-hidden="true">{emoji}</span>
        <span className="truncate">{move.name}</span>
      </span>
      {move.power && (
        <span className="shrink-0 font-mono text-[9px] opacity-80">{move.power}</span>
      )}
    </div>
  );
}

export function PokemonCard({ pokemon: p, showFull = true, className = "" }: PokemonCardProps) {
  const type1Color = TYPE_COLORS[p.type1 as PokemonType];
  const rarityConfig = RARITY_CONFIG[p.rarity as Rarity];
  const statTotal = p.hp + p.attack + p.defense + p.spAtk + p.spDef + p.speed;

  const isHolo = ["HOLO_RARE", "FULL_ART", "SECRET_RARE"].includes(p.rarity);
  const isRainbow = p.rarity === "SECRET_RARE";
  const isRare = ["RARE", "HOLO_RARE", "FULL_ART", "SECRET_RARE"].includes(p.rarity);
  const isFullArt = p.rarity === "FULL_ART";

  return (
    <article
      className={`relative rounded-xl overflow-hidden select-none ${isHolo ? "card-holo" : ""} ${isRainbow ? "card-rainbow" : ""} ${isRare ? "card-rare-corners" : ""} ${className}`}
      style={{
        width: 350,
        minHeight: 490,
        background: isFullArt
          ? `linear-gradient(135deg, ${type1Color.hex}, ${type1Color.lightHex})`
          : `linear-gradient(135deg, ${type1Color.hex}cc, ${type1Color.lightHex}cc)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.20), 0 0 0 2px ${rarityConfig.glowColor === "rainbow" ? "#f472b6" : rarityConfig.glowColor}`,
        backdropFilter: "blur(8px)",
      }}
      aria-label={`${p.name} Pokémon card`}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-4 flex flex-col gap-2">
        {/* ── Header ── */}
        <header className="flex items-center justify-between h-10">
          <div className="flex items-center gap-1.5">
            {p.cardNumber && (
              <span className="font-mono text-[11px] opacity-60 text-white">
                #{String(p.cardNumber).padStart(4, "0")}
              </span>
            )}
            <RarityStars rarity={p.rarity as Rarity} />
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(138,43,226,0.8)", color: "white" }}
            >
              ✦ AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">HP {p.hp}</span>
            <span className="text-lg" aria-hidden="true">{TYPE_EMOJI[p.type1 as PokemonType]}</span>
          </div>
        </header>

        {/* ── Image ── */}
        <div
          className="relative mx-auto rounded-lg overflow-hidden bg-white/10"
          style={{ width: 180, height: 160 }}
        >
          <Image
            src={p.imageUrl}
            alt={`${p.type1.toLowerCase()}${p.type2 ? `/${p.type2.toLowerCase()}` : ""}-type Pokémon named ${p.name} from ${p.region.toLowerCase()}`}
            fill
            className="object-contain"
            sizes="180px"
          />
        </div>

        {/* ── Types + Ability ── */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            <TypeBadge type={p.type1 as PokemonType} size="sm" />
            {p.type2 && <TypeBadge type={p.type2 as PokemonType} size="sm" />}
          </div>
          <span className="text-white/80 text-[10px] truncate max-w-[120px]">
            {p.ability1Name}
          </span>
        </div>

        {/* ── Name + Pokédex entry ── */}
        <div>
          <h2 className="text-white font-black text-lg leading-tight uppercase tracking-wide">
            {p.name}
          </h2>
          <p className="text-white/75 text-[10px] italic leading-tight line-clamp-2 mt-0.5">
            {p.pokedexEntry}
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="flex items-center gap-2">
          <StatsHexagon
            stats={{ hp: p.hp, attack: p.attack, defense: p.defense, spAtk: p.spAtk, spDef: p.spDef, speed: p.speed }}
            color={type1Color.lightHex}
            size={80}
          />
          <div className="flex-1 grid grid-cols-3 gap-x-2 gap-y-0.5 text-[9px] text-white/80 font-mono">
            {[
              ["ATK", p.attack], ["DEF", p.defense], ["SPD", p.speed],
              ["SpA", p.spAtk], ["SpD", p.spDef], ["TOT", statTotal],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="opacity-70">{label}</span>
                <span className="font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Moves ── */}
        {p.moves && p.moves.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {p.moves.slice(0, 4).map((move) => (
              <MoveBadge key={move.id} move={move} />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="flex items-center justify-between text-white/60 text-[9px] font-mono border-t border-white/20 pt-1.5 mt-0.5">
          <span>{p.region} · {p.height}m {p.weight}kg</span>
          <span className="font-bold" style={{ color: rarityConfig.textColor }}>
            {rarityConfig.label}
          </span>
        </footer>
      </div>
    </article>
  );
}
