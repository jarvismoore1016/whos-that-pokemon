"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  pokemonId: string;
  pokemonName: string;
}

export function ShareButton({ pokemonId, pokemonName }: ShareButtonProps) {
  async function handleShare() {
    const url = `${window.location.origin}/pokemon/${pokemonId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${pokemonName} — Who's That Pokémon?`,
          text: `Check out ${pokemonName}, a custom AI-generated Pokémon!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!", { description: url });
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      aria-label={`Share ${pokemonName}`}
    >
      🔗 Share
    </Button>
  );
}
