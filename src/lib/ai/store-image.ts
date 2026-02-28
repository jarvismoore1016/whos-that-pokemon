import { put } from "@vercel/blob";

export async function storeImage(
  replicateUrl: string,
  userId: string,
  generationId: string
): Promise<string> {
  // Download from Replicate (URL expires in 24-48h)
  const response = await fetch(replicateUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image from Replicate: ${response.status}`);
  }

  const blob = await response.blob();

  // Upload to Vercel Blob (permanent)
  const { url } = await put(
    `pokemon/${userId}/${generationId}.png`,
    blob,
    {
      access: "public",
      contentType: "image/png",
    }
  );

  return url;
}
