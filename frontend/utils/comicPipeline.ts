import {
  generateMangaImage,
  downloadImageAsBuffer,
  ImageGenerationOptions,
} from "./imageGeneration";
import { uploadImageBuffer } from "./cloudinaryUpload";
import mangaBookStorage from "./mangaBookStorage";

export interface MangaPipelineResult {
  success: boolean;
  mangaImageUrl?: string;
  cloudinaryUrl?: string;
  error?: string;
}

export async function generateAndStoreMangaImage(
  date: string,
  aiSummary: string,
  userId: string = "default",
  options: ImageGenerationOptions = {}
): Promise<MangaPipelineResult> {
  try {
    const { imageUrl: dalleImageUrl } = await generateMangaImage(
      aiSummary,
      options
    );

    const imageBuffer = await downloadImageAsBuffer(dalleImageUrl);

    const yearMonth = date.substring(0, 7);
    const cloudinaryUrl = await uploadImageBuffer(imageBuffer, {
      folder: `manga-books/${yearMonth}`,
      publicId: `${userId}_${date}_${Date.now()}`,
    });

    await mangaBookStorage.addOrUpdateDailyEntry(
      date,
      {
        mangaImageUrl: cloudinaryUrl,
        aiSummary: aiSummary,
      },
      userId
    );

    await mangaBookStorage.updateBookStats(yearMonth, userId);

    return {
      success: true,
      mangaImageUrl: dalleImageUrl,
      cloudinaryUrl: cloudinaryUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

export async function generateMangaForExistingEntry(
  date: string,
  userId: string = "default",
  options: ImageGenerationOptions = {}
): Promise<MangaPipelineResult> {
  try {
    const entry = await mangaBookStorage.getDailyEntry(date, userId);

    if (!entry || !entry.aiSummary) {
      throw new Error(`No entry or AI summary found for date: ${date}`);
    }

    return await generateAndStoreMangaImage(
      date,
      entry.aiSummary,
      userId,
      options
    );
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  generateAndStoreMangaImage,
  generateMangaForExistingEntry,
};
