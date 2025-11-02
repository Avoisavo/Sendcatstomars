import { MongoClient, ObjectId, Db, Collection } from "mongodb";

interface BookMetadata {
  title: string;
  description: string;
}

interface Book {
  _id?: ObjectId;
  yearMonth: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  totalPages: number;
  totalEntries: number;
  coverImage: string | null;
  metadata: BookMetadata;
}

interface DailyEntry {
  _id?: ObjectId;
  date: string;
  userId: string;
  yearMonth: string;
  originalText: string;
  aiSummary: string;
  mangaImageUrl: string | null;
  emotion: string;
  chatSnapshot: Array<{ role: string; content: string }>;
  pageNumber: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

class MangaBookStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<Db> {
    if (this.isConnected && this.client) {
      return this.db!;
    }

    try {
      const uri = process.env.MONGODB_URI;

      if (!uri) {
        throw new Error("MONGODB_URI environment variable is not set");
      }

      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB_NAME || "curemebaby");
      this.isConnected = true;

      console.log("✅ Connected to MongoDB");
      return this.db;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  async getBooksCollection(): Promise<Collection<Book>> {
    await this.ensureConnection();
    return this.db!.collection<Book>("manga_books");
  }

  async getEntriesCollection(): Promise<Collection<DailyEntry>> {
    await this.ensureConnection();
    return this.db!.collection<DailyEntry>("daily_entries");
  }

  async getOrCreateBook(
    yearMonth: string,
    userId: string = "default"
  ): Promise<Book> {
    const booksCollection = await this.getBooksCollection();

    let book = await booksCollection.findOne({ yearMonth, userId });

    if (!book) {
      const newBook: Book = {
        yearMonth,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalPages: 0,
        totalEntries: 0,
        coverImage: null,
        metadata: {
          title: `Journal - ${yearMonth}`,
          description: `Daily manga journal for ${yearMonth}`,
        },
      };

      const result = await booksCollection.insertOne(newBook);
      book = { ...newBook, _id: result.insertedId };
      console.log(`📚 Created new book for ${yearMonth}`);
    }

    return book;
  }

  async addOrUpdateDailyEntry(
    date: string,
    entryData: Partial<DailyEntry>,
    userId: string = "default"
  ): Promise<DailyEntry> {
    const yearMonth = date.substring(0, 7);
    const entriesCollection = await this.getEntriesCollection();

    await this.getOrCreateBook(yearMonth, userId);

    const existingEntry = await entriesCollection.findOne({ date, userId });

    const entryDocument: Partial<DailyEntry> = {
      date,
      userId,
      yearMonth,
      originalText: entryData.originalText || "",
      aiSummary: entryData.aiSummary || "",
      mangaImageUrl: entryData.mangaImageUrl || null,
      emotion: entryData.emotion || "neutral",
      chatSnapshot: entryData.chatSnapshot || [],
      pageNumber: entryData.pageNumber || null,
      tags: entryData.tags || [],
      updatedAt: new Date(),
    };

    let result;
    if (existingEntry) {
      result = await entriesCollection.updateOne(
        { _id: existingEntry._id },
        { $set: entryDocument }
      );
      return { ...existingEntry, ...entryDocument } as DailyEntry;
    } else {
      const newEntry = {
        ...entryDocument,
        createdAt: new Date(),
      } as DailyEntry;
      result = await entriesCollection.insertOne(newEntry);
      console.log(`✨ Created new entry for ${date}`);
      return { ...newEntry, _id: result.insertedId };
    }
  }

  async updateBookStats(
    yearMonth: string,
    userId: string = "default"
  ): Promise<void> {
    const booksCollection = await this.getBooksCollection();
    const entriesCollection = await this.getEntriesCollection();

    const totalEntries = await entriesCollection.countDocuments({
      yearMonth,
      userId,
    });

    await booksCollection.updateOne(
      { yearMonth, userId },
      {
        $set: {
          totalPages: totalEntries,
          totalEntries: totalEntries,
          updatedAt: new Date(),
        },
      }
    );
  }

  async getDailyEntry(
    date: string,
    userId: string = "default"
  ): Promise<DailyEntry | null> {
    const entriesCollection = await this.getEntriesCollection();
    return await entriesCollection.findOne({ date, userId });
  }

  async getMonthEntries(
    yearMonth: string,
    userId: string = "default"
  ): Promise<DailyEntry[]> {
    const entriesCollection = await this.getEntriesCollection();

    const entries = await entriesCollection
      .find({ yearMonth, userId })
      .sort({ date: 1 })
      .toArray();

    return entries;
  }

  async getBookWithEntries(
    yearMonth: string,
    userId: string = "default"
  ): Promise<(Book & { entries: DailyEntry[] }) | null> {
    const booksCollection = await this.getBooksCollection();

    const book = await booksCollection.findOne({ yearMonth, userId });

    if (!book) {
      return null;
    }

    const entries = await this.getMonthEntries(yearMonth, userId);

    return {
      ...book,
      entries,
    };
  }

  async listAllBooks(userId: string = "default"): Promise<Book[]> {
    const booksCollection = await this.getBooksCollection();

    const books = await booksCollection
      .find({ userId })
      .sort({ yearMonth: -1 })
      .toArray();

    return books;
  }

  async deleteDailyEntry(
    date: string,
    userId: string = "default"
  ): Promise<boolean> {
    const yearMonth = date.substring(0, 7);
    const entriesCollection = await this.getEntriesCollection();

    const result = await entriesCollection.deleteOne({ date, userId });

    if (result.deletedCount > 0) {
      await this.updateBookStats(yearMonth, userId);
      console.log(`🗑️ Deleted entry for ${date}`);
      return true;
    }

    return false;
  }

  async deleteBook(
    yearMonth: string,
    userId: string = "default"
  ): Promise<boolean> {
    const booksCollection = await this.getBooksCollection();
    const entriesCollection = await this.getEntriesCollection();

    await entriesCollection.deleteMany({ yearMonth, userId });

    const result = await booksCollection.deleteOne({ yearMonth, userId });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted book for ${yearMonth}`);
      return true;
    }

    return false;
  }

  async getBookStats(
    yearMonth: string,
    userId: string = "default"
  ): Promise<{
    yearMonth: string;
    totalPages: number;
    totalEntries: number;
    firstEntry?: string;
    lastEntry?: string;
    createdAt: Date;
    updatedAt: Date;
    coverImage: string | null;
  } | null> {
    const booksCollection = await this.getBooksCollection();
    const entriesCollection = await this.getEntriesCollection();

    const book = await booksCollection.findOne({ yearMonth, userId });

    if (!book) {
      return null;
    }

    const entries = await entriesCollection
      .find({ yearMonth, userId })
      .sort({ date: 1 })
      .toArray();

    return {
      yearMonth: book.yearMonth,
      totalPages: book.totalPages,
      totalEntries: book.totalEntries,
      firstEntry: entries[0]?.date,
      lastEntry: entries[entries.length - 1]?.date,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      coverImage: book.coverImage,
    };
  }

  async searchEntries(
    searchText: string,
    userId: string = "default"
  ): Promise<DailyEntry[]> {
    const entriesCollection = await this.getEntriesCollection();

    const entries = await entriesCollection
      .find({
        userId,
        $or: [
          { originalText: { $regex: searchText, $options: "i" } },
          { aiSummary: { $regex: searchText, $options: "i" } },
        ],
      })
      .sort({ date: -1 })
      .limit(20)
      .toArray();

    return entries;
  }

  async getEntriesByEmotion(
    emotion: string,
    userId: string = "default"
  ): Promise<DailyEntry[]> {
    const entriesCollection = await this.getEntriesCollection();

    const entries = await entriesCollection
      .find({ emotion, userId })
      .sort({ date: -1 })
      .toArray();

    return entries;
  }

  async getEntriesByDateRange(
    startDate: string,
    endDate: string,
    userId: string = "default"
  ): Promise<DailyEntry[]> {
    const entriesCollection = await this.getEntriesCollection();

    const entries = await entriesCollection
      .find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .toArray();

    return entries;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("👋 Disconnected from MongoDB");
    }
  }
}

export default new MangaBookStorage();
