import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";
import { generateMemoryForDate, Memory } from "@/utils/memoryGenerator";
// Lazy import for image generation to avoid OpenAI initialization
// import { generateImagesForMemory } from "@/utils/panelImageGeneration";

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

  console.log("✅ Connected to MongoDB for memories");
  return db;
}

// POST: Generate and store memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      date,
      datetime,
      timestamp,
      aiSummary,
      chatMessages = [],
      userId = "default",
      options = {},
      generateImages = false, // Add flag to control image generation
    } = body;

    // Validate required fields
    if (!sessionId || !date || !aiSummary) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sessionId, date, aiSummary",
        },
        { status: 400 }
      );
    }

    // Parse datetime
    const parsedDatetime = datetime ? new Date(datetime) : new Date();
    const parsedTimestamp =
      timestamp ||
      parsedDatetime.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    // Generate memory using the generator
    const memory = await generateMemoryForDate(
      date,
      parsedDatetime,
      parsedTimestamp,
      aiSummary,
      chatMessages,
      userId,
      options
    );

    // Store in MongoDB
    const db = await connectToDatabase();
    const collection = db.collection<Memory>("memories");

    // Check if memory already exists for this date
    const existingMemory = await collection.findOne({ date, userId });

    let result;
    if (existingMemory) {
      // Update existing memory
      result = await collection.updateOne(
        { date, userId },
        {
          $set: {
            ...memory,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`📝 Updated memory for ${date}`);
    } else {
      // Insert new memory
      result = await collection.insertOne(memory);
      console.log(`✨ Created new memory for ${date}`);
    }

    // Only generate panel images if explicitly requested
    if (generateImages) {
      try {
        console.log(`🎨 Auto-generating panel images for ${date}...`);

        // Dynamically import to avoid OpenAI initialization unless needed
        const { generateImagesForMemory } = await import("@/utils/panelImageGeneration");

        const panelResults = await generateImagesForMemory(
          date,
          memory.panels,
          memory.mood.primary,
          {
            quality: "standard",
            size: "1024x1024",
            saveLocally: true,
            localPath: "./public/generated-panels",
          }
        );

        // Update memory with generated image URLs
        const updatedPanels = memory.panels.map((panel, index) => {
          const result = panelResults.find((r) => r.panelId === panel.id);
          return {
            ...panel,
            imgUrl: result?.imageUrl || panel.imgUrl,
          };
        });

        // Update in database
        await collection.updateOne(
          { date, userId },
          {
            $set: {
              panels: updatedPanels,
              updatedAt: new Date(),
            },
          }
        );

        console.log(`✅ Panel images generated and stored for ${date}`);

        // Return updated memory with images
        return NextResponse.json({
          success: true,
          memory: {
            ...memory,
            panels: updatedPanels,
          },
          operation: existingMemory ? "updated" : "created",
          panelImagesGenerated: true,
          panelResults,
        });
      } catch (imageError: any) {
        console.error(
          `⚠️ Failed to generate panel images: ${imageError.message}`
        );
        // Return memory anyway, images can be generated later
        return NextResponse.json({
          success: true,
          memory,
          operation: existingMemory ? "updated" : "created",
          panelImagesGenerated: false,
          imageGenerationError: imageError.message,
        });
      }
    }

    // If image generation not requested, return memory immediately
    return NextResponse.json({
      success: true,
      memory,
      operation: existingMemory ? "updated" : "created",
      panelImagesGenerated: false,
    });
  } catch (error: any) {
    console.error("Error storing memory:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to store memory",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // YYYY-MM format
    const favorite = searchParams.get("favorite") === "true";
    const mood = searchParams.get("mood");
    const limit = parseInt(searchParams.get("limit") || "100");

    const db = await connectToDatabase();
    const collection = db.collection<Memory>("memories");

    // Build query
    const query: any = { userId };

    if (date) {
      // Get specific memory by date
      query.date = date;
    } else if (month) {
      // Get memories for specific month
      query.date = { $regex: `^${month}` };
    }

    if (favorite) {
      query.favorite = true;
    }

    if (mood) {
      query["mood.primary"] = mood;
    }

    // Debug: Log total memories in collection (no filter)
    const totalMemoriesInDb = await collection.countDocuments({});
    console.log(`🔍 Total memories in 'memories' collection: ${totalMemoriesInDb}`);
    
    // Debug: Log memories matching the userId filter
    const memoriesWithUserId = await collection.countDocuments({ userId });
    console.log(`🔍 Memories with userId="${userId}": ${memoriesWithUserId}`);
    console.log(`🔍 Query being used:`, JSON.stringify(query));

    // Execute query
    const memories = await collection
      .find(query)
      .sort({ datetime: -1 })
      .limit(limit)
      .toArray();

    // If requesting specific date, return single memory
    if (date) {
      const memory = memories[0] || null;
      if (!memory) {
        return NextResponse.json(
          { success: false, error: "Memory not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, memory });
    }

    // Use countDocuments for accurate count (respects the query filters)
    const totalCount = await collection.countDocuments(query);
    
    console.log(`📊 Returning ${memories.length} memories out of ${totalCount} total matching query`);

    return NextResponse.json({
      success: true,
      memories,
      count: totalCount, // Use actual count from database, not just array length
      totalInDatabase: totalMemoriesInDb, // Include total for debugging
    });
  } catch (error: any) {
    console.error("Error retrieving memories:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve memories" },
      { status: 500 }
    );
  }
}

// PUT: Update memory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, userId = "default", updates } = body;

    if (!date || !updates) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: date, updates" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection<Memory>("memories");

    const result = await collection.updateOne(
      { date, userId },
      {
        $set: {
          ...updates,
          status: "edited",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Memory not found" },
        { status: 404 }
      );
    }

    const updatedMemory = await collection.findOne({ date, userId });

    return NextResponse.json({
      success: true,
      memory: updatedMemory,
    });
  } catch (error: any) {
    console.error("Error updating memory:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update memory" },
      { status: 500 }
    );
  }
}

// DELETE: Delete memory
export async function DELETE(request: NextRequest) {
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

    const result = await collection.deleteOne({ date, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Memory not found" },
        { status: 404 }
      );
    }

    console.log(`🗑️ Deleted memory for ${date}`);

    return NextResponse.json({
      success: true,
      message: `Memory for ${date} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete memory" },
      { status: 500 }
    );
  }
}
