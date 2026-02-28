import { TYPE_COLORS, TYPE_EMOJI } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/types";

interface TypeBadgeProps {
  type: PokemonType;
  size?: "sm" | "md";
}

export function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const color = TYPE_COLORS[type];
  const emoji = TYPE_EMOJI[type];

  const sizeClasses = size === "sm" ? "text-[9px] px-1.5 py-0.5 gap-0.5" : "text-[10px] px-2 py-1 gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide text-white ${sizeClasses}`}
      style={{ backgroundColor: color.hex, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
      aria-label={type.toLowerCase()}
    >
      <span aria-hidden="true">{emoji}</span>
      {type}
    </span>
  );
}
