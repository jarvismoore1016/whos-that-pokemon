CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `challenge_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`challengeId` text NOT NULL,
	`userId` text NOT NULL,
	`pokemonId` text NOT NULL,
	`voteCount` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pokemonId`) REFERENCES `pokemon`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_challenge_entries_unique` ON `challenge_entries` (`challengeId`,`userId`);--> statement-breakpoint
CREATE INDEX `idx_challenge_entries_challengeId` ON `challenge_entries` (`challengeId`);--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`theme` text,
	`constraint` text,
	`startsAt` integer,
	`endsAt` integer
);
--> statement-breakpoint
CREATE TABLE `evolution_chain_members` (
	`id` text PRIMARY KEY NOT NULL,
	`chainId` text NOT NULL,
	`pokemonId` text NOT NULL,
	`stage` integer NOT NULL,
	`evolutionTrigger` text NOT NULL,
	`triggerDetail` text,
	`sortOrder` integer NOT NULL,
	FOREIGN KEY (`chainId`) REFERENCES `evolution_chains`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pokemonId`) REFERENCES `pokemon`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_chain_pokemon_unique` ON `evolution_chain_members` (`chainId`,`pokemonId`);--> statement-breakpoint
CREATE INDEX `idx_chain_members_chainId` ON `evolution_chain_members` (`chainId`);--> statement-breakpoint
CREATE TABLE `evolution_chains` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `generation_history` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`pokemonId` text,
	`userInput` text NOT NULL,
	`claudeResponse` text,
	`imagePrompt` text,
	`replicateUrl` text,
	`blobUrl` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`errorMessage` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_gen_history_userId` ON `generation_history` (`userId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `moves` (
	`id` text PRIMARY KEY NOT NULL,
	`pokemonId` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`damageClass` text NOT NULL,
	`power` integer,
	`accuracy` integer,
	`pp` integer NOT NULL,
	`description` text NOT NULL,
	`sortOrder` integer NOT NULL,
	FOREIGN KEY (`pokemonId`) REFERENCES `pokemon`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_moves_pokemonId` ON `moves` (`pokemonId`);--> statement-breakpoint
CREATE TABLE `pokemon` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`userDescription` text NOT NULL,
	`pokedexEntry` text NOT NULL,
	`type1` text NOT NULL,
	`type2` text,
	`region` text NOT NULL,
	`habitat` text NOT NULL,
	`evolutionStage` text NOT NULL,
	`hp` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`spAtk` integer NOT NULL,
	`spDef` integer NOT NULL,
	`speed` integer NOT NULL,
	`height` real NOT NULL,
	`weight` real NOT NULL,
	`ability1Name` text NOT NULL,
	`ability1Desc` text NOT NULL,
	`ability2Name` text,
	`ability2Desc` text,
	`hiddenAbilityName` text NOT NULL,
	`hiddenAbilityDesc` text NOT NULL,
	`catchRate` integer DEFAULT 45 NOT NULL,
	`genderRatio` text DEFAULT '50M_50F' NOT NULL,
	`eggGroup1` text DEFAULT 'MONSTER' NOT NULL,
	`eggGroup2` text,
	`experienceCurve` text DEFAULT 'MEDIUM_SLOW' NOT NULL,
	`baseFriendship` integer DEFAULT 50 NOT NULL,
	`colorCategory` text NOT NULL,
	`imageUrl` text NOT NULL,
	`imagePrompt` text NOT NULL,
	`rarity` text DEFAULT 'COMMON' NOT NULL,
	`cardNumber` integer,
	`favoriteCount` integer DEFAULT 0 NOT NULL,
	`isPublic` integer DEFAULT true NOT NULL,
	`evolutionChainId` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`evolutionChainId`) REFERENCES `evolution_chains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_pokemon_userId_slug` ON `pokemon` (`userId`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_userId` ON `pokemon` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_type1` ON `pokemon` (`type1`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_region` ON `pokemon` (`region`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_rarity` ON `pokemon` (`rarity`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_createdAt` ON `pokemon` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_favoriteCount` ON `pokemon` (`favoriteCount`);--> statement-breakpoint
CREATE INDEX `idx_pokemon_evolutionChainId` ON `pokemon` (`evolutionChainId`);--> statement-breakpoint
CREATE TABLE `pokemon_favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`pokemonId` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pokemonId`) REFERENCES `pokemon`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_favorites_unique` ON `pokemon_favorites` (`userId`,`pokemonId`);--> statement-breakpoint
CREATE INDEX `idx_favorites_userId` ON `pokemon_favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_favorites_pokemonId` ON `pokemon_favorites` (`pokemonId`);--> statement-breakpoint
CREATE TABLE `pokemon_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`basePokemonId` text NOT NULL,
	`userId` text NOT NULL,
	`formType` text NOT NULL,
	`formName` text NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text NOT NULL,
	`imagePrompt` text NOT NULL,
	`hp` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`spAtk` integer NOT NULL,
	`spDef` integer NOT NULL,
	`speed` integer NOT NULL,
	`abilityName` text NOT NULL,
	`abilityDesc` text NOT NULL,
	`gMaxMoveName` text,
	`gMaxMoveDesc` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`basePokemonId`) REFERENCES `pokemon`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_forms_basePokemonId` ON `pokemon_forms` (`basePokemonId`);--> statement-breakpoint
CREATE INDEX `idx_forms_userId` ON `pokemon_forms` (`userId`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_sessionToken_unique` ON `sessions` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`image` text,
	`emailVerified` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`username` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verificationTokens_token_unique` ON `verificationTokens` (`token`);