"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { TYPE_COLORS, TYPE_EMOJI } from "@/lib/type-colors";
import { POKEMON_TYPES, REGIONS, HABITATS, EVOLUTION_STAGES } from "@/lib/types";
import type { PokemonType, Region, Habitat, EvolutionStage, GeneratorFormInput } from "@/lib/types";

const formSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  type1: z.enum(["FIRE","WATER","GRASS","ELECTRIC","ICE","FIGHTING","POISON","GROUND","FLYING","PSYCHIC","BUG","ROCK","GHOST","DRAGON","DARK","STEEL","FAIRY","NORMAL"] as const),
  type2: z.enum(["FIRE","WATER","GRASS","ELECTRIC","ICE","FIGHTING","POISON","GROUND","FLYING","PSYCHIC","BUG","ROCK","GHOST","DRAGON","DARK","STEEL","FAIRY","NORMAL"] as const).optional().nullable(),
  region: z.enum(["KANTO","JOHTO","HOENN","SINNOH","UNOVA","KALOS","ALOLA","GALAR","PALDEA","CUSTOM"] as const),
  habitat: z.enum(["LAND","SEA","SKY"] as const),
  evolutionStage: z.enum(["BASIC","STAGE1","STAGE2"] as const),
});

type FormData = z.infer<typeof formSchema>;

const HABITAT_INFO: Record<Habitat, { label: string; icon: string; desc: string }> = {
  LAND:  { label: "Land",  icon: "🌿", desc: "Forests, caves, mountains" },
  SEA:   { label: "Sea",   icon: "🌊", desc: "Oceans, rivers, lakes" },
  SKY:   { label: "Sky",   icon: "☁️", desc: "Clouds, high altitude" },
};

const STAGE_INFO: Record<EvolutionStage, { label: string; desc: string; statRange: string }> = {
  BASIC:  { label: "Basic",   desc: "Unevolved starter form",   statRange: "290–330 total" },
  STAGE1: { label: "Stage 1", desc: "First evolution",          statRange: "340–420 total" },
  STAGE2: { label: "Stage 2", desc: "Final evolution",          statRange: "430–600 total" },
};

const SURPRISE_DESCRIPTIONS = [
  "A crystalline dragon that feeds on starlight",
  "A volcanic fox made of living magma",
  "A deep-sea lanternfish that hypnotizes prey",
  "An ancient golem built from shattered swords",
  "A mushroom spirit that spreads healing spores",
  "A thundercloud cat that rides storm fronts",
  "A coral reef guardian with healing aura",
  "A sand dune serpent that moves like wind",
];

interface GeneratorFormProps {
  onSubmit: (data: GeneratorFormInput) => void;
  isLoading?: boolean;
}

export function GeneratorForm({ onSubmit, isLoading = false }: GeneratorFormProps) {
  const [step, setStep] = useState(1);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evolutionStage: "STAGE1",
      region: "KANTO",
      habitat: "LAND",
    },
  });

  const selectedType1 = watch("type1");
  const selectedType2 = watch("type2");
  const selectedRegion = watch("region");
  const selectedHabitat = watch("habitat");
  const selectedStage = watch("evolutionStage");

  function handleSurpriseMe() {
    const desc = SURPRISE_DESCRIPTIONS[Math.floor(Math.random() * SURPRISE_DESCRIPTIONS.length)];
    const type1 = POKEMON_TYPES[Math.floor(Math.random() * POKEMON_TYPES.length)];
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    const habitat = HABITATS[Math.floor(Math.random() * HABITATS.length)];
    const stage = EVOLUTION_STAGES[Math.floor(Math.random() * EVOLUTION_STAGES.length)];
    setValue("description", desc);
    setValue("type1", type1);
    setValue("region", region);
    setValue("habitat", habitat);
    setValue("evolutionStage", stage);
    handleSubmit(onSubmit)();
  }

  const progressPct = (step / 3) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Pokémon generator form">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step} of 3</span>
          <span>{["Describe", "Region & Habitat", "Evolution"][step - 1]}</span>
        </div>
        <Progress value={progressPct} className="h-2" aria-label={`Step ${step} of 3`} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Describe your Pokémon <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="A volcanic fox with a tail made of living magma..."
                className="min-h-[100px] resize-none"
                aria-describedby={errors.description ? "desc-error" : undefined}
              />
              {errors.description && (
                <p id="desc-error" className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Primary Type <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Select primary type">
                {POKEMON_TYPES.map((type) => {
                  const color = TYPE_COLORS[type];
                  const isSelected = selectedType1 === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setValue("type1", type)}
                      className="flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-xs font-bold min-h-[44px]"
                      style={{
                        backgroundColor: isSelected ? `${color.hex}33` : "transparent",
                        borderColor: isSelected ? color.hex : "transparent",
                        color: isSelected ? color.hex : "inherit",
                      }}
                      aria-pressed={isSelected}
                      aria-label={type.toLowerCase()}
                    >
                      <span className="text-base" aria-hidden="true">{TYPE_EMOJI[type]}</span>
                      <span className="text-[9px] leading-none">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Secondary Type <span className="text-muted-foreground text-xs">(optional)</span></p>
              <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Select secondary type">
                {POKEMON_TYPES.filter((t) => t !== selectedType1).map((type) => {
                  const color = TYPE_COLORS[type];
                  const isSelected = selectedType2 === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setValue("type2", isSelected ? null : type)}
                      className="flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-xs font-bold min-h-[44px]"
                      style={{
                        backgroundColor: isSelected ? `${color.hex}33` : "transparent",
                        borderColor: isSelected ? color.hex : "transparent",
                        color: isSelected ? color.hex : "inherit",
                      }}
                      aria-pressed={isSelected}
                      aria-label={type.toLowerCase()}
                    >
                      <span className="text-base" aria-hidden="true">{TYPE_EMOJI[type]}</span>
                      <span className="text-[9px] leading-none">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">Region</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select region">
                {REGIONS.map((region) => (
                  <button
                    type="button"
                    key={region}
                    onClick={() => setValue("region", region)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all min-h-[44px] ${
                      selectedRegion === region
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-pressed={selectedRegion === region}
                  >
                    {region.charAt(0) + region.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Habitat</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select habitat">
                {HABITATS.map((habitat) => {
                  const info = HABITAT_INFO[habitat];
                  return (
                    <button
                      type="button"
                      key={habitat}
                      onClick={() => setValue("habitat", habitat)}
                      className={`p-3 rounded-lg border-2 text-center transition-all min-h-[44px] ${
                        selectedHabitat === habitat
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      aria-pressed={selectedHabitat === habitat}
                    >
                      <div className="text-2xl mb-1" aria-hidden="true">{info.icon}</div>
                      <div className="text-xs font-bold">{info.label}</div>
                      <div className="text-[10px] text-muted-foreground">{info.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">Evolution Stage</p>
              <div className="grid grid-cols-3 gap-3" role="group" aria-label="Select evolution stage">
                {EVOLUTION_STAGES.map((stage) => {
                  const info = STAGE_INFO[stage];
                  return (
                    <button
                      type="button"
                      key={stage}
                      onClick={() => setValue("evolutionStage", stage)}
                      className={`p-4 rounded-lg border-2 text-center transition-all min-h-[80px] ${
                        selectedStage === stage
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      aria-pressed={selectedStage === stage}
                    >
                      <div className="font-bold text-sm">{info.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{info.desc}</div>
                      <div className="text-[10px] text-primary font-mono mt-1">{info.statRange}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <Button
              type="submit"
              disabled={isLoading || !selectedType1}
              className="w-full h-12 text-base font-bold"
              style={selectedType1 ? {
                background: `linear-gradient(135deg, ${TYPE_COLORS[selectedType1 as PokemonType]?.hex ?? "#6366f1"}, ${TYPE_COLORS[selectedType1 as PokemonType]?.lightHex ?? "#818cf8"})`,
              } : {}}
              aria-describedby="gen-time-hint"
            >
              {isLoading ? "Generating..." : "✨ Generate Pokémon"}
            </Button>
            <p id="gen-time-hint" className="text-center text-xs text-muted-foreground">
              Takes ~12–20 seconds · 5 free generations per day
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="min-h-[44px]"
          >
            ← Back
          </Button>
        )}

        {step < 3 && (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !selectedType1}
            className="ml-auto min-h-[44px]"
          >
            Next →
          </Button>
        )}

        {step === 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSurpriseMe}
            disabled={isLoading}
            className="ml-2 min-h-[44px]"
          >
            🎲 Surprise Me!
          </Button>
        )}
      </div>
    </form>
  );
}
