"use client";

import { TYPE_COLORS } from "@/lib/type-colors";
import { RARITY_CONFIG } from "@/lib/rarity";
import { StatsHexagon } from "./StatsHexagon";
import type { PokemonWithMoves, Rarity, PokemonType } from "@/lib/types";

interface PokemonCardBackProps {
  pokemon: PokemonWithMoves;
  className?: string;
}

export function PokemonCardBack({ pokemon: p, className = "" }: PokemonCardBackProps) {
  const type1Color = TYPE_COLORS[p.type1 as PokemonType];
  const rarityConfig = RARITY_CONFIG[p.rarity as Rarity];

  const stats = [
    { label: "HP",      value: p.hp,      max: 255 },
    { label: "Attack",  value: p.attack,   max: 250 },
    { label: "Defense", value: p.defense,  max: 250 },
    { label: "Sp. Atk", value: p.spAtk,    max: 250 },
    { label: "Sp. Def", value: p.spDef,    max: 250 },
    { label: "Speed",   value: p.speed,    max: 250 },
  ];

  return (
    <article
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        width: 350,
        minHeight: 490,
        background: `linear-gradient(135deg, ${type1Color.hex}dd, ${type1Color.lightHex}dd)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.20)`,
      }}
      aria-label={`${p.name} Pokémon card details`}
    >
      <div className="p-4 flex flex-col gap-3 h-full">
        {/* Header */}
        <div className="text-center border-b border-white/20 pb-2">
          <h2 className="text-white font-black text-xl uppercase">{p.name}</h2>
          <p className="text-white/70 text-xs italic">{p.pokedexEntry}</p>
        </div>

        {/* Stats + Hexagon */}
        <div className="flex gap-3 items-start">
          <StatsHexagon
            stats={{ hp: p.hp, attack: p.attack, defense: p.defense, spAtk: p.spAtk, spDef: p.spDef, speed: p.speed }}
            color={type1Color.lightHex}
            size={110}
          />
          <div className="flex-1 space-y-1">
            {stats.map(({ label, value, max }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-white/70 text-[10px] w-14 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(value / max) * 100}%`,
                      backgroundColor: type1Color.lightHex,
                    }}
                  />
                </div>
                <span className="text-white font-bold text-[10px] w-6 text-right font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abilities */}
        <div className="bg-black/20 rounded-lg p-2.5 space-y-2">
          <h3 className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Abilities</h3>
          <div className="space-y-1.5">
            <div>
              <span className="text-white font-bold text-xs">{p.ability1Name}</span>
              <p className="text-white/60 text-[10px] leading-tight">{p.ability1Desc}</p>
            </div>
            {p.ability2Name && (
              <div>
                <span className="text-white font-bold text-xs">{p.ability2Name}</span>
                <p className="text-white/60 text-[10px] leading-tight">{p.ability2Desc}</p>
              </div>
            )}
            <div>
              <span className="text-white/70 font-bold text-xs">{p.hiddenAbilityName} <span className="text-[9px] opacity-60">(Hidden)</span></span>
              <p className="text-white/60 text-[10px] leading-tight">{p.hiddenAbilityDesc}</p>
            </div>
          </div>
        </div>

        {/* Pokédex data */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {[
            ["Region", p.region],
            ["Habitat", p.habitat],
            ["Height", `${p.height}m`],
            ["Weight", `${p.weight}kg`],
            ["Catch Rate", p.catchRate],
            ["Gender", p.genderRatio.replace("_", "/")],
            ["Egg Group", p.eggGroup1],
            ["Exp Curve", p.experienceCurve.replace("_", " ")],
          ].map(([label, value]) => (
            <div key={label} className="bg-black/15 rounded px-2 py-1">
              <span className="text-white/50">{label}: </span>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="text-center text-[9px] font-bold mt-auto pt-1 border-t border-white/20"
          style={{ color: rarityConfig.textColor }}
        >
          {rarityConfig.label} · {p.evolutionStage.replace("STAGE", "Stage ")}
        </div>
      </div>
    </article>
  );
}
