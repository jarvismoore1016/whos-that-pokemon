import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { TYPE_COLORS } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const p = await db.query.pokemon.findFirst({
    where: (poke, { eq }) => eq(poke.id, id),
  });

  if (!p) {
    return new Response("Not found", { status: 404 });
  }

  const typeColor = TYPE_COLORS[p.type1 as PokemonType];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${typeColor.hex}, ${typeColor.lightHex})`,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
          gap: 40,
          padding: 40,
        }}
      >
        {/* Card preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: 24,
            width: 300,
            gap: 12,
          }}
        >
          <img
            src={p.imageUrl}
            alt={p.name}
            style={{ width: "100%", height: 200, objectFit: "contain", borderRadius: 12 }}
          />
          <div style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{p.name}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontStyle: "italic" }}>
            {p.pokedexEntry.slice(0, 100)}...
          </div>
        </div>

        {/* Text side */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 48 }}>Who&apos;s That Pokémon?</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 20 }}>
            {p.type1}{p.type2 ? ` / ${p.type2}` : ""} · {p.region} · {p.rarity}
          </div>
          <div style={{ display: "flex", gap: 20, color: "white", fontSize: 16 }}>
            <span>ATK {p.attack}</span>
            <span>DEF {p.defense}</span>
            <span>SPD {p.speed}</span>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 12,
              padding: "8px 16px",
              color: "white",
              fontSize: 14,
              display: "inline-flex",
            }}
          >
            ✦ AI Generated Pokémon
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
