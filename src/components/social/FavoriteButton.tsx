"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/actions/favorites";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FavoriteButtonProps {
  pokemonId: string;
  initialFavorited: boolean;
  initialCount: number;
}

export function FavoriteButton({ pokemonId, initialFavorited, initialCount }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    // Optimistic update
    const newFavorited = !favorited;
    setFavorited(newFavorited);
    setCount((c) => c + (newFavorited ? 1 : -1));

    startTransition(async () => {
      try {
        const result = await toggleFavorite(pokemonId);
        setFavorited(result.favorited);
        setCount(result.count);
      } catch {
        // Revert
        setFavorited(favorited);
        setCount(count);
        toast.error("Failed to update favorite");
      }
    });
  }

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className="gap-1.5"
    >
      <span aria-hidden="true">{favorited ? "❤️" : "🤍"}</span>
      {count > 0 && <span>{count}</span>}
    </Button>
  );
}
