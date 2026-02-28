"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvolutionChain } from "@/actions/evolution-chains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

export default function NewEvolutionLinePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);

    try {
      const { id } = await createEvolutionChain(name, description || undefined);
      toast.success("Evolution chain created!");
      router.push(`/evolution-lines/${id}`);
    } catch (error) {
      toast.error("Failed to create chain", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/evolution-lines">← Back</Link>
          </Button>
          <h1 className="text-2xl font-black">New Evolution Chain</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="chain-name">
              Chain Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="chain-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pyrodrake Line"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="chain-desc">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <Textarea
              id="chain-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A volcanic dragon line found in Hoenn..."
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={isLoading || !name.trim()} className="w-full">
            {isLoading ? "Creating..." : "Create Chain"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          After creating, you&apos;ll be able to add Pokémon from your collection to this chain.
        </p>
      </div>
    </main>
  );
}
