"use client";

import Link from "next/link";
import { PokemonCardMini } from "@/components/pokemon-card/PokemonCardMini";
import type { Pokemon } from "@/lib/types";

interface ChainMember {
  id: string;
  stage: number;
  evolutionTrigger: string;
  triggerDetail: string | null;
  pokemon: Pokemon | null;
}

interface EvolutionTreeProps {
  members: ChainMember[];
  chainName: string;
}

const STAGE_LABEL = ["Basic", "Stage 1", "Stage 2"];

export function EvolutionTree({ members, chainName }: EvolutionTreeProps) {
  const stages = [0, 1, 2].map((stage) =>
    members.filter((m) => m.stage === stage)
  );

  return (
    <div className="space-y-4" aria-label={`Evolution chain: ${chainName}`}>
      <h2 className="text-lg font-bold">{chainName}</h2>
      <div className="flex flex-col md:flex-row items-center gap-4 overflow-x-auto pb-2">
        {stages.map((stageMembers, stageIndex) => {
          if (stageMembers.length === 0 && stageIndex === 0) return null;
          return (
            <div key={stageIndex} className="flex items-center gap-4">
              {/* Arrow (not for first stage) */}
              {stageIndex > 0 && stageMembers.length > 0 && (
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-2xl text-muted-foreground" aria-hidden="true">→</span>
                  {stageMembers[0]?.triggerDetail && (
                    <span className="text-[10px] text-muted-foreground max-w-16 text-center">
                      {stageMembers[0].triggerDetail}
                    </span>
                  )}
                </div>
              )}

              {/* Cards for this stage */}
              <div className="flex flex-col gap-3">
                {stageMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{STAGE_LABEL[member.stage]}</span>
                    {member.pokemon ? (
                      <PokemonCardMini
                        pokemon={member.pokemon}
                        href={`/pokemon/${member.pokemon.id}`}
                      />
                    ) : (
                      <div className="w-[200px] h-[280px] rounded-xl bg-muted/40 border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground text-sm">
                        ?
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
