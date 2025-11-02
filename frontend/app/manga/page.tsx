"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { MangaBook3D } from "@/components/MangaBook3D";
import Spline from "@splinetool/react-spline";

interface SummaryData {
  date: string;
  datetime: string;
  summary: string;
  dayOfWeek: string;
}

interface MemoryData {
  date: string;
  datetime: string;
  title: string;
  logline: string;
  aiSummary: string;
  dayOfWeek: string;
}

export default function MangaPage() {
  const router = useRouter();
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [bookOpened, setBookOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [oldestSummaryData, setOldestSummaryData] = useState<SummaryData | null>(null);
  const [newestSummaryData, setNewestSummaryData] = useState<SummaryData | null>(null);
  const [memoryData, setMemoryData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMemories, setHasMemories] = useState(false);

  // Fetch summaries and check for memories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch summaries (get more to find oldest and newest)
        const summaryResponse = await fetch(
          "/api/chat-summaries?userId=default&limit=100"
        );
        const summaryData = await summaryResponse.json();

        if (summaryData.success && summaryData.summaries && summaryData.summaries.length > 0) {
          const summaries = summaryData.summaries;
          
          // Oldest summary (last in array since sorted by datetime DESC)
          const oldestSummary = summaries[summaries.length - 1];
          const oldestDateObj = new Date(oldestSummary.date + "T00:00:00");
          const oldestDayOfWeek = oldestDateObj.toLocaleDateString("en-US", {
            weekday: "long",
          });

          setOldestSummaryData({
            date: oldestSummary.date,
            datetime: oldestDateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            summary: oldestSummary.summary,
            dayOfWeek: oldestDayOfWeek,
          });
          
          // Newest summary (first in array)
          const newestSummary = summaries[0];
          const newestDateObj = new Date(newestSummary.date + "T00:00:00");
          const newestDayOfWeek = newestDateObj.toLocaleDateString("en-US", {
            weekday: "long",
          });

          setNewestSummaryData({
            date: newestSummary.date,
            datetime: newestDateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            summary: newestSummary.summary,
            dayOfWeek: newestDayOfWeek,
          });
        }

        // Check if memories exist and fetch latest memory
        const memoriesResponse = await fetch("/api/memories?userId=default&limit=100");
        const memoriesData = await memoriesResponse.json();
        
        // Use totalInDatabase to count ALL memories in collection (not filtered by userId)
        const totalMemoryCount = memoriesData.totalInDatabase || 0;
        console.log(`📊 Total memories in MongoDB 'memories' collection: ${totalMemoryCount}`);
        console.log(`🔍 Memories for userId="default": ${memoriesData.count || 0}`);
        console.log(`📦 Memories API Response:`, memoriesData);
        
        // Unlock second page only if MORE than 1 memory in the entire collection (i.e., 2 or more)
        if (memoriesData.success && totalMemoryCount > 1) {
          setHasMemories(true);
          
          // Try to get latest memory data if available
          if (memoriesData.memories && memoriesData.memories.length > 0) {
            const latestMemory = memoriesData.memories[0];
            
            // Parse date for day of week
            const memoryDateObj = new Date(latestMemory.date + "T00:00:00");
            const memoryDayOfWeek = memoryDateObj.toLocaleDateString("en-US", {
              weekday: "long",
            });

            setMemoryData({
              date: latestMemory.date,
              datetime: memoryDateObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              title: latestMemory.title || "Memory",
              logline: latestMemory.logline || "",
              aiSummary: latestMemory.aiSummary || "No summary available.",
              dayOfWeek: memoryDayOfWeek,
            });
          }
          
          console.log(`✅ ${totalMemoryCount} memories in collection! Second page unlocked.`);
        } else {
          console.log(`📖 Only ${totalMemoryCount} memory/memories - second page locked`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Page data
  const pages = [
    {
      image: "/first.png",
      text: loading
        ? "Loading your oldest summary..."
        : oldestSummaryData
        ? oldestSummaryData.summary
        : "No summary available yet. Chat with the AI to create your first summary!",
      date: oldestSummaryData?.datetime || "",
      dayOfWeek: oldestSummaryData?.dayOfWeek || "",
    },
    {
      image: "/second.png",
      text: loading
        ? "Loading your newest summary..."
        : newestSummaryData
        ? newestSummaryData.summary
        : "No new summary available yet. Complete a chat session to generate more summaries!",
      date: newestSummaryData?.datetime || "",
      dayOfWeek: newestSummaryData?.dayOfWeek || "",
    },
  ];

  const handleClose = () => {
    router.back();
  };

  // Add ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [router]);

  // Handle book click to open
  const handleBookClick = () => {
    if (!bookOpened) {
      setBookOpened(true);
      setCurrentPage(0); // Start at first page
    }
  };

  // Handle left page click - go to previous page or close book
  const handleLeftPageClick = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      // At first page, close the book
      setBookOpened(false);
    }
  };

  // Handle right page click - go to next page or close book
  const handleRightPageClick = () => {
    const maxPage = hasMemories ? 1 : 0; // Page 1 only available if memories exist
    
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    } else {
      // At last available page, close the book
      setBookOpened(false);
      setCurrentPage(0); // Reset to first page for next open
    }
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "white", // White background like bookshelf
      }}
    >
      {/* Catroom background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: splineLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in",
        }}
      >
        <Spline
          scene="/scene.splinecode"
          onLoad={() => setSplineLoaded(true)}
        />
      </div>

      {/* Dark overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1,
        }}
      />

      {/* 3D Manga book */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [0, 0, 5],
            fov: 45,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.8} />
          <pointLight position={[0, 0, 5]} intensity={0.5} />
          <Suspense fallback={null}>
            <MangaBook3D
              leftPageImage={pages[currentPage].image}
              rightPageText={pages[currentPage].text}
              rightPageDate={pages[currentPage].date}
              rightPageDayOfWeek={pages[currentPage].dayOfWeek}
              opened={bookOpened}
              onBookClick={handleBookClick}
              onLeftPageClick={handleLeftPageClick}
              onRightPageClick={handleRightPageClick}
            />
          </Suspense>
        </Canvas>

        {/* Click to open prompt */}
        {!bookOpened && (
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "22px",
              fontWeight: "600",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
              pointerEvents: "none",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "12px 24px",
              borderRadius: "12px",
              backdropFilter: "blur(4px)",
            }}
          >
            📖 Click the book to open
          </div>
        )}

        {/* Navigation hint when book is open */}
        {bookOpened && (
          <div
            style={{
              position: "absolute",
              bottom: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "16px",
              fontWeight: "500",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
              pointerEvents: "none",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "10px 20px",
              borderRadius: "10px",
              backdropFilter: "blur(4px)",
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <span>← Click left to go back</span>
            <span>|</span>
            <span>Click right to advance →</span>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "44px",
          height: "44px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "2px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "20px",
          fontWeight: "400",
          zIndex: 1001,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#333",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
          e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.15)";
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </main>
  );
}
