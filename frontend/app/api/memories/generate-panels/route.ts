import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";
import { Memory } from "@/utils/memoryGenerator";
import {
  generateImagesForMemory,
  PanelImageOptions,
  PanelImageResult,
} from "@/utils/panelImageGeneration";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(process.env.MONGODB_DB_NAME || "curemebaby");

  cachedClient = client;
  cachedDb = db;

  return db;
}

/**
 * POST: Generate images for all panels in a memory
 *
 * Request body:
 * {
 *   date: string;          // YYYY-MM-DD format
 *   userId?: string;       // Defaults to "default"
 *   options?: {
 *     quality?: "standard" | "hd";
 *     size?: "1024x1024" | "1792x1024" | "1024x1792";
 *     saveLocally?: boolean;  // Default true
 *     localPath?: string;     // Default "./public/generated-panels"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, userId = "default", options = {} } = body;

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Missing required field: date" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectToDatabase();
    const collection = db.collection<Memory>("memories");

    // Retrieve the memory
    const memory = await collection.findOne({ date, userId });

    if (!memory) {
      return NextResponse.json(
        { success: false, error: `Memory not found for date: ${date}` },
        { status: 404 }
      );
    }

    if (!memory.panels || memory.panels.length === 0) {
      return NextResponse.json(
        { success: false, error: "No panels found in this memory" },
        { status: 400 }
      );
    }

    console.log(
      `📸 Generating images for ${memory.panels.length} panels (date: ${date})...`
    );

    // Generate images for all panels
    const panelOptions: PanelImageOptions = {
      quality: options.quality || "standard",
      size: options.size || "1024x1024",
      saveLocally: options.saveLocally !== false, // Default to true
      localPath: options.localPath || "./public/generated-panels",
    };

    const results = await generateImagesForMemory(
      date,
      memory.panels,
      memory.mood.primary,
      panelOptions
    );

    // Update memory with image URLs
    const updatedPanels = memory.panels.map((panel, index) => {
      const result = results.find((r) => r.panelId === panel.id);
      return {
        ...panel,
        imgUrl: result?.imageUrl || panel.imgUrl,
      };
    });

    // Update the memory in MongoDB
    await collection.updateOne(
      { date, userId },
      {
        $set: {
          panels: updatedPanels,
          status: "generated",
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `✅ Successfully generated and stored panel images for ${date}`
    );

    return NextResponse.json({
      success: true,
      date,
      panelCount: results.length,
      results,
      memory: {
        ...memory,
        panels: updatedPanels,
      },
    });
  } catch (error: any) {
    console.error("Error generating panel images:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate panel images",
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Check status of panel image generation for a memory
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const userId = searchParams.get("userId") || "default";

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: date" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection<Memory>("memories");

    const memory = await collection.findOne({ date, userId });

    if (!memory) {
      return NextResponse.json(
        { success: false, error: "Memory not found" },
        { status: 404 }
      );
    }

    const panelsWithImages = memory.panels.filter(
      (panel) => panel.imgUrl && panel.imgUrl.length > 0
    );

    return NextResponse.json({
      success: true,
      date,
      totalPanels: memory.panels.length,
      panelsWithImages: panelsWithImages.length,
      isComplete: panelsWithImages.length === memory.panels.length,
      panels: memory.panels.map((panel) => ({
        id: panel.id,
        hasImage: !!panel.imgUrl,
        imgUrl: panel.imgUrl,
      })),
    });
  } catch (error: any) {
    console.error("Error checking panel status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
