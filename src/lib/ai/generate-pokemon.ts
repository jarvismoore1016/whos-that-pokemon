import Anthropic from "@anthropic-ai/sdk";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { z } from "zod";
import type { GeneratorFormInput, ClaudePokemonOutput, EvolutionStage } from "../types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a Pokédex AI assistant generating canonical-feeling custom Pokémon.

STAT TOTAL RULES (enforce strictly):
- Basic stage: 290–330 total
- Stage 1: 340–420 total
- Stage 2: 430–600 total (600+ only for pseudo-legendary)

STAT DISTRIBUTION BY TYPE:
- Electric: High Speed (95+) + High SpAtk (95+)
- Fire: High SpAtk or Atk (100+), moderate Speed (75-95)
- Water: Balanced; if defensive — high SpDef (100+)
- Fighting: High Atk (100+), moderate Speed (70-90)
- Psychic: High SpAtk (110+) + High Speed (100+)
- Steel: High Defense (120+), lower Speed (40-70)
- Dragon: Balanced high offenses (100+), respectable Speed (80+)
- Ghost: High SpAtk (90+), moderate Speed (80+)
- Dark: Mixed offenses, good Speed (90+)
- Fairy: High SpDef (100+), good SpAtk (90+)
- Ground: High Atk (110+), high Defense (90+), low Speed
- Rock: High Defense (100+), high Atk (90+), low Speed
- Ice: High SpAtk (95+), mediocre bulk
- Bug: Varies widely, often mixed
- Poison: Moderate bulk, mixed offenses
- Flying: High Speed (90+), mixed offenses
- Normal: Balanced or single stat extreme
- Grass: High SpAtk (90+), moderate bulk

MOVESET RULES:
- Include 2-3 STAB moves matching the Pokémon's type(s)
- Include 1 coverage move hitting a key weakness
- Power scaling by stage: Basic 40-65, Stage 1 60-85, Stage 2 75-130
- Accuracy: 100% standard, 90% risky, 85% niche, 75% extreme power
- PP: Status moves 20-40, damaging moves 10-25

AUTHENTICITY RULES:
- Name phonetics: blend concept words with pronounceability (Char+Lizard=Charizard)
- Pokédex entry: 2-3 sentences, behavior + habitat + quirk. 100-160 characters.
- Height/weight must feel proportional to design
- Abilities must reinforce the Pokémon's concept

REGIONAL FLAVOR:
- Kanto: Iconic, simple designs, balanced stats
- Johto: Mythological, refined versions
- Hoenn: Tropical, water-heavy, higher special stats
- Sinnoh: Powerful, mixed attackers, highest stat totals
- Unova: Modern, geometric, contemporary
- Kalos: Elegant, Fairy-type emphasis
- Alola: Island/tropical, variant aesthetic
- Galar: British-inspired, Dynamax lore
- Paldea: Open-world, culinary/Spanish aesthetic, power creep

EGG GROUPS (assign 1-2):
MONSTER | WATER1 | WATER2 | WATER3 | BUG | FLYING | FIELD | FAIRY | GRASS | HUMAN_LIKE | MINERAL | AMORPHOUS | DRAGON | UNDISCOVERED

GENDER: 50M_50F | 87M_13F | 100M | 100F | GENDERLESS (Legendaries = GENDERLESS)
CATCH RATE: Basic=255, Stage1=120, Stage2=45 (lower for pseudo-legendaries)
EXPERIENCE CURVE: SLOW | MEDIUM_SLOW | MEDIUM_FAST | FAST

Generate a creative, authentic-feeling Pokémon that matches the user's description while following all official Pokémon conventions.`;

const generatePokemonTool: Tool = {
  name: "generate_pokemon",
  description: "Generate a complete, canonical-feeling custom Pokémon",
  input_schema: {
    type: "object" as const,
    required: [
      "name", "pokedexEntry", "stats", "moves", "abilities",
      "height", "weight", "catchRate", "genderRatio",
      "eggGroup1", "experienceCurve", "baseFriendship", "colorCategory",
    ],
    properties: {
      name: { type: "string", description: "Creative Pokémon name (blend concept words)" },
      pokedexEntry: { type: "string", description: "100-160 char Pokédex flavor text" },
      stats: {
        type: "object",
        required: ["hp", "attack", "defense", "spAtk", "spDef", "speed"],
        properties: {
          hp:      { type: "integer", minimum: 20, maximum: 255 },
          attack:  { type: "integer", minimum: 5,  maximum: 250 },
          defense: { type: "integer", minimum: 5,  maximum: 250 },
          spAtk:   { type: "integer", minimum: 5,  maximum: 250 },
          spDef:   { type: "integer", minimum: 5,  maximum: 250 },
          speed:   { type: "integer", minimum: 5,  maximum: 250 },
        },
      },
      moves: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          required: ["name", "type", "damageClass", "pp", "description"],
          properties: {
            name:        { type: "string" },
            type:        { type: "string", enum: ["FIRE","WATER","GRASS","ELECTRIC","ICE","FIGHTING","POISON","GROUND","FLYING","PSYCHIC","BUG","ROCK","GHOST","DRAGON","DARK","STEEL","FAIRY","NORMAL"] },
            damageClass: { type: "string", enum: ["PHYSICAL","SPECIAL","STATUS"] },
            power:       { type: "integer", minimum: 10, maximum: 250 },
            accuracy:    { type: "integer", minimum: 50, maximum: 100 },
            pp:          { type: "integer", minimum: 5, maximum: 40 },
            description: { type: "string" },
          },
        },
      },
      abilities: {
        type: "object",
        required: ["primary", "hidden"],
        properties: {
          primary:   { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name", "description"] },
          secondary: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } },
          hidden:    { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name", "description"] },
        },
      },
      height:          { type: "number", description: "Height in meters" },
      weight:          { type: "number", description: "Weight in kg" },
      catchRate:       { type: "integer", minimum: 3, maximum: 255 },
      genderRatio:     { type: "string", enum: ["50M_50F","87M_13F","100M","100F","GENDERLESS"] },
      eggGroup1:       { type: "string", enum: ["MONSTER","WATER1","WATER2","WATER3","BUG","FLYING","FIELD","FAIRY","GRASS","HUMAN_LIKE","MINERAL","AMORPHOUS","DRAGON","UNDISCOVERED"] },
      eggGroup2:       { type: "string" },
      experienceCurve: { type: "string", enum: ["SLOW","MEDIUM_SLOW","MEDIUM_FAST","FAST","ERRATIC","FLUCTUATING"] },
      baseFriendship:  { type: "integer", minimum: 0, maximum: 255 },
      colorCategory:   { type: "string", enum: ["RED","BLUE","YELLOW","GREEN","BLACK","BROWN","PURPLE","GRAY","WHITE","PINK"] },
    },
  },
};

const statsSchema = z.object({
  hp:      z.number().int().min(20).max(255),
  attack:  z.number().int().min(5).max(250),
  defense: z.number().int().min(5).max(250),
  spAtk:   z.number().int().min(5).max(250),
  spDef:   z.number().int().min(5).max(250),
  speed:   z.number().int().min(5).max(250),
});

const moveSchema = z.object({
  name:        z.string().min(1),
  type:        z.enum(["FIRE","WATER","GRASS","ELECTRIC","ICE","FIGHTING","POISON","GROUND","FLYING","PSYCHIC","BUG","ROCK","GHOST","DRAGON","DARK","STEEL","FAIRY","NORMAL"]),
  damageClass: z.enum(["PHYSICAL","SPECIAL","STATUS"]),
  power:       z.number().int().min(10).max(250).nullable().optional(),
  accuracy:    z.number().int().min(50).max(100).nullable().optional(),
  pp:          z.number().int().min(5).max(40),
  description: z.string().min(1),
});

const abilitySchema = z.object({
  name:        z.string().min(1),
  description: z.string().min(1),
});

const claudeOutputSchema = z.object({
  name:            z.string().min(1),
  pokedexEntry:    z.string().min(50).max(300),
  stats:           statsSchema,
  moves:           z.array(moveSchema).length(4),
  abilities: z.object({
    primary:   abilitySchema,
    secondary: abilitySchema.optional().nullable(),
    hidden:    abilitySchema,
  }),
  height:          z.number().positive(),
  weight:          z.number().positive(),
  catchRate:       z.number().int().min(3).max(255),
  genderRatio:     z.enum(["50M_50F","87M_13F","100M","100F","GENDERLESS"]),
  eggGroup1:       z.enum(["MONSTER","WATER1","WATER2","WATER3","BUG","FLYING","FIELD","FAIRY","GRASS","HUMAN_LIKE","MINERAL","AMORPHOUS","DRAGON","UNDISCOVERED"]),
  eggGroup2:       z.enum(["MONSTER","WATER1","WATER2","WATER3","BUG","FLYING","FIELD","FAIRY","GRASS","HUMAN_LIKE","MINERAL","AMORPHOUS","DRAGON","UNDISCOVERED"]).optional().nullable(),
  experienceCurve: z.enum(["SLOW","MEDIUM_SLOW","MEDIUM_FAST","FAST","ERRATIC","FLUCTUATING"]),
  baseFriendship:  z.number().int().min(0).max(255),
  colorCategory:   z.enum(["RED","BLUE","YELLOW","GREEN","BLACK","BROWN","PURPLE","GRAY","WHITE","PINK"]),
});

const STAGE_STAT_LIMITS: Record<EvolutionStage, [number, number]> = {
  BASIC:  [290, 330],
  STAGE1: [340, 420],
  STAGE2: [430, 610],
};

export class StatTotalError extends Error {
  constructor(total: number, stage: EvolutionStage, min: number, max: number) {
    super(`Stat total ${total} out of range [${min}, ${max}] for ${stage}`);
    this.name = "StatTotalError";
  }
}

export async function generatePokemonWithClaude(
  input: GeneratorFormInput
): Promise<ClaudePokemonOutput> {
  const userPrompt = `Generate a custom Pokémon with these characteristics:
- Description: ${input.description}
- Primary Type: ${input.type1}${input.type2 ? `\n- Secondary Type: ${input.type2}` : ""}
- Region: ${input.region}
- Habitat: ${input.habitat}
- Evolution Stage: ${input.evolutionStage}

Use the generate_pokemon tool to create this Pokémon.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [generatePokemonTool],
    tool_choice: { type: "any" },
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract tool use block
  const toolUse = response.content.find((block: Anthropic.ContentBlock) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not call the generate_pokemon tool");
  }

  // Validate with Zod
  const parsed = claudeOutputSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Invalid Claude output: ${parsed.error.message}`);
  }

  const output = parsed.data as ClaudePokemonOutput;

  // Stat total validation
  const total = Object.values(output.stats).reduce((a, b) => a + b, 0);
  const [min, max] = STAGE_STAT_LIMITS[input.evolutionStage];
  if (total < min || total > max) {
    throw new StatTotalError(total, input.evolutionStage, min, max);
  }

  return output;
}

export function buildImagePrompt(
  pokemonName: string,
  input: GeneratorFormInput,
  output: ClaudePokemonOutput
): string {
  const typeStr = input.type2
    ? `${input.type1.toLowerCase()}/${input.type2.toLowerCase()}`
    : input.type1.toLowerCase();

  return `Anime-style Pokémon creature, official Pokémon art style, ${pokemonName}, ${typeStr} type, ${input.description}, ${output.colorCategory.toLowerCase()} color palette, ${input.habitat.toLowerCase()} habitat, clean white background, full body view, detailed digital illustration, Ken Sugimori art style, game sprite quality`;
}
