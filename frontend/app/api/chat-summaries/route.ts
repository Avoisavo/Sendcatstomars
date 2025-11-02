import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";

interface ChatSummary {
  sessionId: string;
  date: string;
  timestamp: string;
  datetime: Date;
  summary: string;
  userId?: string;
  createdAt: Date;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    console.log("♻️ Using cached MongoDB connection");
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "curemebaby";

  console.log("🔌 Attempting to connect to MongoDB...");
  console.log("📊 Database name:", dbName);
  console.log("🔑 MongoDB URI exists:", !!uri);

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set!");
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("🔌 MongoDB client connected successfully");

    const db = client.db(dbName);
    console.log("📚 Database selected:", dbName);

    cachedClient = client;
    cachedDb = db;

    console.log("✅ Connected to MongoDB for chat summaries");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// POST: Store AI summary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, summary, userId = "default" } = body;

    if (!sessionId || !summary) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sessionId, summary",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const chatSummary: ChatSummary = {
      sessionId,
      date: now.toISOString().split("T")[0], // YYYY-MM-DD
      timestamp: now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      datetime: now,
      summary,
      userId,
      createdAt: now,
    };

    const db = await connectToDatabase();
    const collection = db.collection<ChatSummary>("chat_summaries");

    const result = await collection.insertOne(chatSummary);

    console.log(`📝 Stored chat summary for session: ${sessionId}`);

    return NextResponse.json({
      success: true,
      sessionId,
      insertedId: result.insertedId,
      summary: chatSummary,
    });
  } catch (error: any) {
    console.error("Error storing chat summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to store chat summary",
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve chat summaries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "100");
    
    // Only default to "default" if no userId is explicitly provided AND no date filter
    // When querying by date without userId, we want to get all users' summaries for that date
    const userId = userIdParam || (date ? null : "default");

    console.log("📥 GET request received for chat summaries");
    console.log("👤 UserId:", userId || "ALL", "Date:", date || "none", "Limit:", limit);

    const db = await connectToDatabase();
    const collection = db.collection<ChatSummary>("chat_summaries");

    // Get specific summary by session ID
    if (sessionId) {
      console.log("🔍 Searching for sessionId:", sessionId);
      const filter: any = { sessionId };
      if (userId) {
        filter.userId = userId;
      }
      const summary = await collection.findOne(filter);
      if (!summary) {
        console.log("❌ Summary not found for sessionId:", sessionId);
        return NextResponse.json(
          { success: false, error: "Summary not found" },
          { status: 404 }
        );
      }
      console.log("✅ Summary found for sessionId:", sessionId);
      return NextResponse.json({ success: true, summary });
    }

    // Get summaries for specific date
    if (date) {
      console.log("📅 Searching for date:", date);
      // If userId is provided in query, filter by it; otherwise get all summaries for that date
      const query: any = { date };
      if (userId && userId !== "undefined") {
        query.userId = userId;
      }
      const summaries = await collection
        .find(query)
        .sort({ datetime: -1 })
        .toArray();
      console.log(`✅ Found ${summaries.length} summaries for date:`, date, `(userId filter: ${query.userId || 'none'})`);
      return NextResponse.json({
        success: true,
        summaries,
        count: summaries.length,
      });
    }

    // Get all summaries for user (sorted by date, newest first)
    console.log("🔍 Fetching all summaries for userId:", userId);
    const filter: any = {};
    if (userId) {
      filter.userId = userId;
    }
    const summaries = await collection
      .find(filter)
      .sort({ datetime: -1 })
      .limit(limit)
      .toArray();

    console.log(`✅ Found ${summaries.length} summaries for userId:`, userId);

    return NextResponse.json({
      success: true,
      summaries,
      count: summaries.length,
    });
  } catch (error: any) {
    console.error("❌ Error retrieving chat summaries:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve chat summaries",
        errorDetails: {
          name: error.name,
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
