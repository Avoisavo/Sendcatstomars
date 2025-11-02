// Panel image generation utility
// Reads panels from MongoDB memories and generates images for each panel

import OpenAI from "openai";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Panel } from "./memoryGenerator";

// Lazy initialization to avoid crashes when API key is not set
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Image generation requires an OpenAI API key."
      );
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface PanelImageOptions {
  style?: "bw" | "halftone" | "colorAccent";
  quality?: "standard" | "hd";
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  saveLocally?: boolean;
  localPath?: string;
}

export interface PanelImageResult {
  panelId: string;
  imageUrl: string;
  localPath?: string;
  revisedPrompt?: string;
}

/**
 * Generate a manga-style prompt for a panel
 */
export function generatePanelPrompt(
  panel: Panel,
  mood: string = "calm"
): string {
  const styleDescriptions = {
    bw: "black and white manga style with screen tones and hatching",
    halftone: "manga style with halftone dots and dynamic shading",
    colorAccent: "mostly black and white manga with selective color accents",
  };

  const styleDesc = styleDescriptions[panel.style || "bw"];

  return `Create a single manga panel illustration:

Scene: ${panel.caption}

Art style: ${styleDesc}, Japanese manga/anime aesthetic, expressive character emotions showing ${mood} mood, clean linework, professional manga artist quality, dynamic composition, detailed backgrounds.

Note: This is a therapeutic reflection panel, keep tone respectful and emotionally supportive.`;
}

/**
 * Generate image for a single panel
 */
export async function generatePanelImage(
  panel: Panel,
  mood: string = "calm",
  options: PanelImageOptions = {}
): Promise<PanelImageResult> {
  const { quality = "standard", size = "1024x1024" } = options;

  const prompt = generatePanelPrompt(panel, mood);

  console.log(`🎨 Generating image for ${panel.id}...`);

  const client = getOpenAI(); // Lazy initialization
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: size,
    quality: quality,
    response_format: "url",
  });

  if (!response.data || !response.data[0] || !response.data[0].url) {
    throw new Error(`Failed to generate image for panel ${panel.id}`);
  }

  const imageUrl = response.data[0].url;
  const revisedPrompt = response.data[0].revised_prompt;

  console.log(`✅ Generated image for ${panel.id}`);

  return {
    panelId: panel.id,
    imageUrl,
    revisedPrompt,
  };
}

/**
 * Download image from URL and save as buffer
 */
export async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Ensure directory exists, create if not
 */
export async function ensureDirectoryExists(directory: string): Promise<void> {
  const fullPath = path.join(process.cwd(), directory);
  try {
    await mkdir(fullPath, { recursive: true });
  } catch (error: any) {
    // Ignore error if directory already exists
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Save image buffer to local file system
 */
export async function saveImageLocally(
  imageBuffer: Buffer,
  filename: string,
  directory: string = "./public/generated-panels"
): Promise<string> {
  // Ensure directory exists
  await ensureDirectoryExists(directory);

  const fullPath = path.join(process.cwd(), directory, filename);

  await writeFile(fullPath, imageBuffer);
  console.log(`💾 Saved image to ${fullPath}`);

  return fullPath;
}

/**
 * Convert date string to YYMMDD format
 * Example: "2025-11-01" -> "251101"
 */
export function formatDateToYYMMDD(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Generate images for all panels in a memory
 */
export async function generateImagesForMemory(
  memoryDate: string,
  panels: Panel[],
  mood: string = "calm",
  options: PanelImageOptions = {}
): Promise<PanelImageResult[]> {
  const results: PanelImageResult[] = [];
  const dateCode = formatDateToYYMMDD(memoryDate);

  console.log(`🚀 Starting image generation for ${panels.length} panels...`);

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];

    try {
      // Generate image
      const result = await generatePanelImage(panel, mood, options);

      // If saveLocally is true, download and save
      if (options.saveLocally !== false) {
        const imageBuffer = await downloadImageAsBuffer(result.imageUrl);

        // Create filename: YYMMDD_panel-1.png
        const filename = `${dateCode}_${panel.id}.png`;

        const localPath = await saveImageLocally(
          imageBuffer,
          filename,
          options.localPath
        );

        result.localPath = localPath;
      }

      results.push(result);

      // Add delay to avoid rate limiting (DALL-E has rate limits)
      if (i < panels.length - 1) {
        console.log("⏳ Waiting 2 seconds before next generation...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(`❌ Failed to generate image for ${panel.id}:`, error);
      // Continue with other panels even if one fails
      results.push({
        panelId: panel.id,
        imageUrl: "",
        localPath: undefined,
      });
    }
  }

  console.log(
    `✨ Completed image generation. Success: ${
      results.filter((r) => r.imageUrl).length
    }/${panels.length}`
  );

  return results;
}

export default {
  generatePanelPrompt,
  generatePanelImage,
  generateImagesForMemory,
  downloadImageAsBuffer,
  saveImageLocally,
  formatDateToYYMMDD,
};
