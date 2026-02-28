"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { TYPE_COLORS } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/types";

const PROGRESS_STEPS = [
  { label: "Naming your Pokémon...",      progress: 15,  duration: 2000 },
  { label: "Crafting stats...",            progress: 35,  duration: 3000 },
  { label: "Writing Pokédex entry...",     progress: 55,  duration: 2500 },
  { label: "Choosing moves & abilities...",progress: 70,  duration: 2500 },
  { label: "Generating artwork...",        progress: 88,  duration: 8000 },
  { label: "Saving to your collection...", progress: 97,  duration: 1500 },
];

interface GenerationProgressProps {
  type1?: PokemonType;
  isComplete?: boolean;
}

export function GenerationProgress({ type1, isComplete = false }: GenerationProgressProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(5);

  const typeColor = type1 ? TYPE_COLORS[type1].hex : "#6366f1";

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    let elapsed = 0;
    const timers: NodeJS.Timeout[] = [];

    PROGRESS_STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setStepIndex(i);
        setProgress(step.progress);
      }, elapsed);
      timers.push(timer);
      elapsed += step.duration;
    });

    return () => timers.forEach(clearTimeout);
  }, [isComplete]);

  const currentStep = PROGRESS_STEPS[stepIndex];

  return (
    <div className="w-full max-w-sm mx-auto space-y-6" aria-live="polite" aria-label="Generation progress">
      {/* Skeleton card */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: 280,
          height: 390,
          margin: "0 auto",
          background: `linear-gradient(135deg, ${typeColor}44, ${typeColor}22)`,
          border: `2px solid ${typeColor}55`,
        }}
        aria-hidden="true"
      >
        {/* Shimmer animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${typeColor}22, transparent)`,
              transform: "skewX(-20deg)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Pokéball spinner in image area */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 60 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-5xl"
            aria-hidden="true"
          >
            ⚪
          </motion.div>
        </div>

        {/* Skeleton lines */}
        <div className="absolute bottom-8 left-4 right-4 space-y-2">
          {[80, 60, 40, 90, 70].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full animate-pulse"
              style={{ width: `${w}%`, backgroundColor: `${typeColor}33` }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar + status */}
      <div className="space-y-2">
        <Progress
          value={progress}
          className="h-2"
          style={{ "--progress-indicator": typeColor } as React.CSSProperties}
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-center text-sm text-muted-foreground"
          >
            {isComplete ? "✅ Complete!" : currentStep?.label}
          </motion.p>
        </AnimatePresence>
        <p className="text-center text-xs text-muted-foreground opacity-60">
          ~12–20 seconds
        </p>
      </div>
    </div>
  );
}
