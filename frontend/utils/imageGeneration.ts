import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageGenerationOptions {
  style?: "manga";
  quality?: "standard" | "hd";
  size?: "1024x1024" | "1792x1024" | "1024x1792";
}

export function generateMangaPrompt(aiSummary: string): string {
  return `Create a single-panel manga/anime illustration depicting this scene:

${aiSummary}

Art style: Japanese manga/anime style, expressive eyes, clean linework, black and white with screen tones, dynamic composition, professional quality with short concise speech bubbles.`;
}

export async function generateMangaImage(
  aiSummary: string,
  options: ImageGenerationOptions = {}
): Promise<{
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
}> {
  const { quality = "standard", size = "1024x1024" } = options;
  const prompt = generateMangaPrompt(aiSummary);

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: size,
    quality: quality,
    response_format: "url",
  });

  if (!response.data || !response.data[0]) {
    throw new Error("No image data returned from DALL-E");
  }

  const imageUrl = response.data[0].url;
  const revisedPrompt = response.data[0].revised_prompt;

  if (!imageUrl) {
    throw new Error("No image URL returned from DALL-E");
  }

  return {
    imageUrl,
    prompt,
    revisedPrompt,
  };
}

export async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer;
}

export default {
  generateMangaPrompt,
  generateMangaImage,
  downloadImageAsBuffer,
};
