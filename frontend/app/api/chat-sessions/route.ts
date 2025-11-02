import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  date: string;
  timestamp: string;
  datetime: Date;
  messages: ChatMessage[];
  messageCount: number;
  userId?: string;
}

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

  console.log("✅ Connected to MongoDB for chat sessions");
  return db;
}

// POST: Store new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, messages, userId = "default" } = body;

    if (!sessionId || !messages) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sessionId, messages",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const chatSession: ChatSession = {
      sessionId,
      date: now.toISOString(),
      timestamp: now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      datetime: now,
      messages: messages.map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || now.toISOString(),
      })),
      messageCount: messages.length,
      userId,
    };

    const db = await connectToDatabase();
    const collection = db.collection<ChatSession>("chat_sessions");

    const result = await collection.insertOne(chatSession);

    console.log(
      `💬 Stored chat session: ${sessionId} with ${messages.length} messages`
    );

    return NextResponse.json({
      success: true,
      sessionId,
      messageCount: messages.length,
      insertedId: result.insertedId,
    });
  } catch (error: any) {
    console.error("Error storing chat session:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to store chat session",
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve chat sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const limit = parseInt(searchParams.get("limit") || "100");
    const sessionId = searchParams.get("sessionId");

    const db = await connectToDatabase();
    const collection = db.collection<ChatSession>("chat_sessions");

    // Get specific session by ID
    if (sessionId) {
      const session = await collection.findOne({ sessionId, userId });
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, session });
    }

    // Get all sessions for user (sorted by date, newest first)
    const sessions = await collection
      .find({ userId })
      .sort({ datetime: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    console.error("Error retrieving chat sessions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve chat sessions",
      },
      { status: 500 }
    );
  }
}
