import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generatePokemonImage(prompt: string): Promise<string> {
  // Using FLUX schnell for fast anime-style generation
  const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 90,
        go_fast: false,
        megapixels: "1",
        num_inference_steps: 4,
      },
    }
  );

  const urls = output as unknown[];
  if (!urls || urls.length === 0) {
    throw new Error("Replicate returned no image URLs");
  }

  return String(urls[0]);
}
