import { sql, relations } from "drizzle-orm";
import {
  text,
  integer,
  real,
  sqliteTable,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// ─── Users (NextAuth managed) ───────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  // Creator progression
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  username: text("username").unique(),
});

// NextAuth required tables
export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable("verificationTokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

// ─── Evolution Chains ────────────────────────────────────────────────────────
export const evolutionChains = sqliteTable("evolution_chains", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// ─── Pokémon ─────────────────────────────────────────────────────────────────
export const pokemon = sqliteTable(
  "pokemon",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    userDescription: text("userDescription").notNull(),
    pokedexEntry: text("pokedexEntry").notNull(),
    type1: text("type1").notNull(),
    type2: text("type2"),
    region: text("region").notNull(),
    habitat: text("habitat").notNull(),
    evolutionStage: text("evolutionStage").notNull(),

    // Base Stats
    hp: integer("hp").notNull(),
    attack: integer("attack").notNull(),
    defense: integer("defense").notNull(),
    spAtk: integer("spAtk").notNull(),
    spDef: integer("spDef").notNull(),
    speed: integer("speed").notNull(),

    // Physical
    height: real("height").notNull(),
    weight: real("weight").notNull(),

    // Abilities
    ability1Name: text("ability1Name").notNull(),
    ability1Desc: text("ability1Desc").notNull(),
    ability2Name: text("ability2Name"),
    ability2Desc: text("ability2Desc"),
    hiddenAbilityName: text("hiddenAbilityName").notNull(),
    hiddenAbilityDesc: text("hiddenAbilityDesc").notNull(),

    // Pokédex fields
    catchRate: integer("catchRate").notNull().default(45),
    genderRatio: text("genderRatio").notNull().default("50M_50F"),
    eggGroup1: text("eggGroup1").notNull().default("MONSTER"),
    eggGroup2: text("eggGroup2"),
    experienceCurve: text("experienceCurve").notNull().default("MEDIUM_SLOW"),
    baseFriendship: integer("baseFriendship").notNull().default(50),
    colorCategory: text("colorCategory").notNull(),

    // Image
    imageUrl: text("imageUrl").notNull(),
    imagePrompt: text("imagePrompt").notNull(),

    // Rarity
    rarity: text("rarity").notNull().default("COMMON"),
    cardNumber: integer("cardNumber"),

    // Social
    favoriteCount: integer("favoriteCount").notNull().default(0),
    isPublic: integer("isPublic", { mode: "boolean" }).notNull().default(true),

    // Evolution
    evolutionChainId: text("evolutionChainId").references(() => evolutionChains.id),

    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex("idx_pokemon_userId_slug").on(table.userId, table.slug),
    index("idx_pokemon_userId").on(table.userId),
    index("idx_pokemon_type1").on(table.type1),
    index("idx_pokemon_region").on(table.region),
    index("idx_pokemon_rarity").on(table.rarity),
    index("idx_pokemon_createdAt").on(table.createdAt),
    index("idx_pokemon_favoriteCount").on(table.favoriteCount),
    index("idx_pokemon_evolutionChainId").on(table.evolutionChainId),
  ]
);

// ─── Moves ───────────────────────────────────────────────────────────────────
export const moves = sqliteTable(
  "moves",
  {
    id: text("id").primaryKey(),
    pokemonId: text("pokemonId").notNull().references(() => pokemon.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    damageClass: text("damageClass").notNull(),
    power: integer("power"),
    accuracy: integer("accuracy"),
    pp: integer("pp").notNull(),
    description: text("description").notNull(),
    sortOrder: integer("sortOrder").notNull(),
  },
  (table) => [index("idx_moves_pokemonId").on(table.pokemonId)]
);

// ─── Pokémon Forms ───────────────────────────────────────────────────────────
export const pokemonForms = sqliteTable(
  "pokemon_forms",
  {
    id: text("id").primaryKey(),
    basePokemonId: text("basePokemonId").notNull().references(() => pokemon.id, { onDelete: "cascade" }),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    formType: text("formType").notNull(),
    formName: text("formName").notNull(),
    description: text("description").notNull(),
    imageUrl: text("imageUrl").notNull(),
    imagePrompt: text("imagePrompt").notNull(),
    hp: integer("hp").notNull(),
    attack: integer("attack").notNull(),
    defense: integer("defense").notNull(),
    spAtk: integer("spAtk").notNull(),
    spDef: integer("spDef").notNull(),
    speed: integer("speed").notNull(),
    abilityName: text("abilityName").notNull(),
    abilityDesc: text("abilityDesc").notNull(),
    gMaxMoveName: text("gMaxMoveName"),
    gMaxMoveDesc: text("gMaxMoveDesc"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index("idx_forms_basePokemonId").on(table.basePokemonId),
    index("idx_forms_userId").on(table.userId),
  ]
);

// ─── Evolution Chain Members ─────────────────────────────────────────────────
export const evolutionChainMembers = sqliteTable(
  "evolution_chain_members",
  {
    id: text("id").primaryKey(),
    chainId: text("chainId").notNull().references(() => evolutionChains.id, { onDelete: "cascade" }),
    pokemonId: text("pokemonId").notNull().references(() => pokemon.id, { onDelete: "cascade" }),
    stage: integer("stage").notNull(),
    evolutionTrigger: text("evolutionTrigger").notNull(),
    triggerDetail: text("triggerDetail"),
    sortOrder: integer("sortOrder").notNull(),
  },
  (table) => [
    uniqueIndex("idx_chain_pokemon_unique").on(table.chainId, table.pokemonId),
    index("idx_chain_members_chainId").on(table.chainId),
  ]
);

// ─── Generation History ──────────────────────────────────────────────────────
export const generationHistory = sqliteTable(
  "generation_history",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => users.id),
    pokemonId: text("pokemonId"),
    userInput: text("userInput").notNull(),
    claudeResponse: text("claudeResponse"),
    imagePrompt: text("imagePrompt"),
    replicateUrl: text("replicateUrl"),
    blobUrl: text("blobUrl"),
    status: text("status").notNull().default("PENDING"),
    errorMessage: text("errorMessage"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [index("idx_gen_history_userId").on(table.userId, table.createdAt)]
);

// ─── Pokémon Favorites ───────────────────────────────────────────────────────
export const pokemonFavorites = sqliteTable(
  "pokemon_favorites",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    pokemonId: text("pokemonId").notNull().references(() => pokemon.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex("idx_favorites_unique").on(table.userId, table.pokemonId),
    index("idx_favorites_userId").on(table.userId),
    index("idx_favorites_pokemonId").on(table.pokemonId),
  ]
);

// ─── Challenges ──────────────────────────────────────────────────────────────
export const challenges = sqliteTable("challenges", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme"),
  constraint: text("constraint"),
  startsAt: integer("startsAt", { mode: "timestamp" }),
  endsAt: integer("endsAt", { mode: "timestamp" }),
});

// ─── Challenge Entries ───────────────────────────────────────────────────────
export const challengeEntries = sqliteTable(
  "challenge_entries",
  {
    id: text("id").primaryKey(),
    challengeId: text("challengeId").notNull().references(() => challenges.id),
    userId: text("userId").notNull().references(() => users.id),
    pokemonId: text("pokemonId").notNull().references(() => pokemon.id),
    voteCount: integer("voteCount").notNull().default(0),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex("idx_challenge_entries_unique").on(table.challengeId, table.userId),
    index("idx_challenge_entries_challengeId").on(table.challengeId),
  ]
);

// ─── Relations ───────────────────────────────────────────────────────────────
export const pokemonRelations = relations(pokemon, ({ many, one }) => ({
  moves: many(moves),
  forms: many(pokemonForms),
  favorites: many(pokemonFavorites),
  evolutionChain: one(evolutionChains, {
    fields: [pokemon.evolutionChainId],
    references: [evolutionChains.id],
  }),
  user: one(users, {
    fields: [pokemon.userId],
    references: [users.id],
  }),
}));

export const movesRelations = relations(moves, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [moves.pokemonId],
    references: [pokemon.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  pokemon: many(pokemon),
  favorites: many(pokemonFavorites),
  evolutionChains: many(evolutionChains),
}));

export const pokemonFavoritesRelations = relations(pokemonFavorites, ({ one }) => ({
  user: one(users, { fields: [pokemonFavorites.userId], references: [users.id] }),
  pokemon: one(pokemon, { fields: [pokemonFavorites.pokemonId], references: [pokemon.id] }),
}));

export const pokemonFormsRelations = relations(pokemonForms, ({ one }) => ({
  basePokemon: one(pokemon, { fields: [pokemonForms.basePokemonId], references: [pokemon.id] }),
}));

export const evolutionChainsRelations = relations(evolutionChains, ({ many, one }) => ({
  members: many(evolutionChainMembers),
  user: one(users, { fields: [evolutionChains.userId], references: [users.id] }),
}));

export const evolutionChainMembersRelations = relations(evolutionChainMembers, ({ one }) => ({
  chain: one(evolutionChains, { fields: [evolutionChainMembers.chainId], references: [evolutionChains.id] }),
  pokemon: one(pokemon, { fields: [evolutionChainMembers.pokemonId], references: [pokemon.id] }),
}));

export const challengeEntriesRelations = relations(challengeEntries, ({ one }) => ({
  challenge: one(challenges, { fields: [challengeEntries.challengeId], references: [challenges.id] }),
  user: one(users, { fields: [challengeEntries.userId], references: [users.id] }),
  pokemon: one(pokemon, { fields: [challengeEntries.pokemonId], references: [pokemon.id] }),
}));

// ─── Type exports for InferSelect ────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Pokemon = typeof pokemon.$inferSelect;
export type NewPokemon = typeof pokemon.$inferInsert;
export type Move = typeof moves.$inferSelect;
export type NewMove = typeof moves.$inferInsert;
export type PokemonForm = typeof pokemonForms.$inferSelect;
export type EvolutionChain = typeof evolutionChains.$inferSelect;
export type EvolutionChainMember = typeof evolutionChainMembers.$inferSelect;
export type GenerationHistory = typeof generationHistory.$inferSelect;
export type PokemonFavorite = typeof pokemonFavorites.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;
