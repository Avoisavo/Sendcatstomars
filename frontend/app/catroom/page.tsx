"use client";

import Spline from "@splinetool/react-spline";
import Header from "@/components/header";
import ChatPanelWrapper from "@/components/chat-panel";
import Instruction from "@/components/instruction";
import Cloud from "@/components/cloud";
import Rate from "@/components/rate";
import Bookshelf from "@/components/Bookshelf";
import { MangaBook3D } from "@/components/MangaBook3D";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SummaryData {
  date: string;
  datetime: string;
  summary: string;
  dayOfWeek: string;
}

interface MongoSummary {
  date: string;
  datetime: Date;
  summary: string;
  userId: string;
  sessionId: string;
}

interface MemoryData {
  date: string;
  datetime: string;
  title: string;
  logline: string;
  aiSummary: string;
  dayOfWeek: string;
}

export default function Catroom() {
  const [showInstruction, setShowInstruction] = useState(true);
  const [showCloud, setShowCloud] = useState(false);
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showManga, setShowManga] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookOpened, setBookOpened] = useState(false);
  const [isDayMode, setIsDayMode] = useState(false);
  const [firstSummary, setFirstSummary] = useState<SummaryData | null>(null);
  const [secondSummary, setSecondSummary] = useState<SummaryData | null>(null);
  const [memoryData, setMemoryData] = useState<MemoryData | null>(null);
  const [hasMemories, setHasMemories] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper function to parse summary data
  const parseSummary = (summary: MongoSummary): SummaryData => {
    const dateObj = new Date(summary.date + "T00:00:00");
    const dayOfWeek = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
    });

    return {
      date: summary.date,
      datetime: dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      summary: summary.summary,
      dayOfWeek: dayOfWeek,
    };
  };

  // Fetch summaries from MongoDB
  const fetchSummaries = useCallback(async () => {
    console.log("🔍 Fetching summaries from MongoDB...");

    try {
      // Fetch specific record for first page (date: 2025-11-01) - without userId filter
      console.log("🌐 Fetching summary for 2025-11-01...");
      const firstPageResponse = await fetch(
        "/api/chat-summaries?date=2025-11-01"
      );
      const firstPageData = await firstPageResponse.json();
      
      if (firstPageData.success && firstPageData.summaries && firstPageData.summaries.length > 0) {
        const firstSummaryRecord = firstPageData.summaries[0];
        setFirstSummary(parseSummary(firstSummaryRecord));
        console.log(`📖 First page loaded: ${firstSummaryRecord.date} (userId: ${firstSummaryRecord.userId})`);
      } else {
        console.log("⚠️ No summary found for 2025-11-01");
      }

      // Fetch specific record for second page (date: 2025-11-02) - without userId filter
      console.log("🌐 Fetching summary for 2025-11-02...");
      const secondPageResponse = await fetch(
        "/api/chat-summaries?date=2025-11-02"
      );
      const secondPageData = await secondPageResponse.json();
      
      if (secondPageData.success && secondPageData.summaries && secondPageData.summaries.length > 0) {
        const secondSummaryRecord = secondPageData.summaries[0];
        setSecondSummary(parseSummary(secondSummaryRecord));
        console.log(`📖 Second page loaded: ${secondSummaryRecord.date}`);
      } else {
        console.log("⚠️ No summary found for 2025-11-02, using first page summary for second page");
        // If no 2025-11-02 summary exists, reuse the first page summary so the second page can still display
        if (firstPageData.success && firstPageData.summaries && firstPageData.summaries.length > 0) {
          setSecondSummary(parseSummary(firstPageData.summaries[0]));
          console.log(`📖 Second page will show: ${firstPageData.summaries[0].date}`);
        }
      }

      // Check memory count to determine if second page should be unlocked
      console.log("🌐 Making fetch request to /api/memories...");
      const memoriesResponse = await fetch("/api/memories?userId=default&limit=100");
      console.log("📡 Memories API Response status:", memoriesResponse.status);
      const memoriesData = await memoriesResponse.json();
      console.log("📦 Memories API Response data:", memoriesData);
      
      // Count ALL memories in the database collection (not filtered by userId)
      const totalMemoryCount = memoriesData.totalInDatabase || 0;
      console.log(`📊 Total memories in MongoDB 'memories' collection: ${totalMemoryCount}`);
      console.log(`🔍 Memories for userId="default": ${memoriesData.count || 0}`);
      
      // Unlock second page if MORE than 1 memory exists in the entire collection
      if (memoriesData.success && totalMemoryCount > 1) {
        setHasMemories(true);
        console.log(`✅ ${totalMemoryCount} memories in collection - second page unlocked!`);
      } else {
        setHasMemories(false);
        console.log(`📖 Only ${totalMemoryCount} memory/memories - second page locked`);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching summaries:", error);
      setLoading(false);
    }
  }, []);

  // Fetch summaries on component mount
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  // Refetch summaries when bookshelf is opened (in case user created new summaries)
  useEffect(() => {
    if (showBookshelf) {
      console.log("📚 Bookshelf opened - refreshing summaries...");
      fetchSummaries();
    }
  }, [showBookshelf, fetchSummaries]);

  // Page data - dynamically build based on available summaries and memories
  const pages = [
    {
      image: "/first.png",
      text: loading
        ? "Loading your summary..."
        : firstSummary
        ? firstSummary.summary
        : "No summary available yet. Chat with the AI to create your first summary!",
      date: firstSummary?.datetime || "",
      dayOfWeek: firstSummary?.dayOfWeek || "",
    },
    // Only include second page if memories exist (memory count > 1)
    ...(hasMemories && secondSummary
      ? [
          {
            image: "/second.png",
            text: loading
              ? "Loading your newest summary..."
              : secondSummary.summary,
            date: secondSummary.datetime,
            dayOfWeek: secondSummary.dayOfWeek,
          },
        ]
      : []),
  ];
  
  // Debug logging
  console.log(`📚 Pages array length: ${pages.length}`);
  console.log(`🔓 hasMemories: ${hasMemories}`);
  console.log(`📄 secondSummary exists: ${!!secondSummary}`);

  const handleBookClick = () => {
    if (!bookOpened) {
      setCurrentPage(0);
      setBookOpened(true);
    }
  };

  const handleLeftPageClick = () => {
    if (currentPage === 0) {
      // On first page, going left closes the book
      setBookOpened(false);
      setCurrentPage(0);
      return;
    }
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRightPageClick = () => {
    // Check if this is the last available page
    if (currentPage === pages.length - 1) {
      // On last page, going right closes the book
      setBookOpened(false);
      setCurrentPage(0);
      return;
    }

    // Only allow going to next page if it exists
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Listen for "1", "2", "3", "4", "5" key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1") {
        router.push("/chatme");
      } else if (e.key === "2") {
        setShowCloud(true);
      } else if (e.key === "3") {
        setShowBookshelf(true);
      } else if (e.key === "4") {
        router.push("/chatme");
      } else if (e.key === "5") {
        setShowRate(true);
      } else if (e.key === "Escape") {
        // ESC key closes any open modal
        if (showManga) {
          setShowManga(false);
        } else if (showBookshelf) {
          setShowBookshelf(false);
        } else if (showCloud) {
          setShowCloud(false);
        } else if (showRate) {
          setShowRate(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router, showManga, showBookshelf, showCloud, showRate]);

  // Ensure the 3D book starts closed each time the modal opens
  useEffect(() => {
    if (showManga) {
      setBookOpened(false);
      setCurrentPage(0);
    }
  }, [showManga]);

  return (
    <>
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        .moon {
          position: absolute;
          top: 10%;
          right: 15%;
          width: 100px;
          height: 100px;
          background: #f4f4f4;
          border-radius: 50%;
          box-shadow: 0 0 60px rgba(255, 255, 255, 0.8),
            0 0 100px rgba(255, 255, 255, 0.4);
          z-index: 0;
        }

        .moon::before {
          content: "";
          position: absolute;
          top: 15px;
          right: 15px;
          width: 70px;
          height: 70px;
          background: rgba(200, 200, 200, 0.3);
          border-radius: 50%;
        }

        .moon::after {
          content: "";
          position: absolute;
          top: 40px;
          right: 30px;
          width: 20px;
          height: 20px;
          background: rgba(200, 200, 200, 0.4);
          border-radius: 50%;
        }

        .sun {
          position: absolute;
          top: 10%;
          right: 15%;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #ffd700, #ffa500);
          border-radius: 50%;
          box-shadow: 0 0 60px rgba(255, 215, 0, 0.8),
            0 0 100px rgba(255, 165, 0, 0.6), 0 0 140px rgba(255, 215, 0, 0.4);
          z-index: 0;
          animation: rotateSun 60s linear infinite;
        }

        @keyframes rotateSun {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .sun::before,
        .sun::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150%;
          height: 150%;
          border-radius: 50%;
          background: transparent;
          border: 3px solid rgba(255, 215, 0, 0.3);
          transform: translate(-50%, -50%);
          animation: pulse 3s ease-in-out infinite;
        }

        .sun::after {
          width: 180%;
          height: 180%;
          border: 2px solid rgba(255, 215, 0, 0.2);
          animation-delay: 1.5s;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(-600px) translateY(600px) rotate(-45deg);
            opacity: 0;
          }
        }

        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
          z-index: 0;
          opacity: 0;
        }

        .shooting-star::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          height: 2px;
          width: 80px;
          background: linear-gradient(
            to left,
            rgba(255, 255, 255, 0.9),
            transparent
          );
          border-radius: 50%;
        }

        /* Each shooting star appears one at a time with gaps between them */
        .shooting-star1 {
          top: 15%;
          right: 10%;
          animation: shootingStar 2.5s ease-in;
          animation-delay: 3s;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
        }

        .shooting-star2 {
          top: 25%;
          right: 40%;
          animation: shootingStar 2.8s ease-in;
          animation-delay: 10s;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
        }

        .shooting-star3 {
          top: 12%;
          right: 65%;
          animation: shootingStar 2.6s ease-in;
          animation-delay: 17s;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          z-index: 0;
          animation: twinkle 3s ease-in-out infinite;
        }

        .star1 {
          width: 3px;
          height: 3px;
          top: 15%;
          left: 10%;
          animation-delay: 0s;
        }

        .star2 {
          width: 2px;
          height: 2px;
          top: 25%;
          left: 25%;
          animation-delay: 0.5s;
        }

        .star3 {
          width: 4px;
          height: 4px;
          top: 18%;
          left: 45%;
          animation-delay: 1s;
        }

        .star4 {
          width: 3px;
          height: 3px;
          top: 30%;
          left: 60%;
          animation-delay: 1.5s;
        }

        .star5 {
          width: 2px;
          height: 2px;
          top: 12%;
          left: 75%;
          animation-delay: 2s;
        }

        .star6 {
          width: 3px;
          height: 3px;
          top: 35%;
          left: 15%;
          animation-delay: 2.5s;
        }

        .star7 {
          width: 4px;
          height: 4px;
          top: 40%;
          left: 35%;
          animation-delay: 0.3s;
        }

        .star8 {
          width: 2px;
          height: 2px;
          top: 22%;
          left: 85%;
          animation-delay: 1.8s;
        }

        .star9 {
          width: 3px;
          height: 3px;
          top: 45%;
          left: 55%;
          animation-delay: 0.7s;
        }

        .star10 {
          width: 2px;
          height: 2px;
          top: 38%;
          left: 70%;
          animation-delay: 1.2s;
        }

        .star11 {
          width: 4px;
          height: 4px;
          top: 8%;
          left: 30%;
          animation-delay: 2.2s;
        }

        .star12 {
          width: 3px;
          height: 3px;
          top: 50%;
          left: 20%;
          animation-delay: 0.9s;
        }
      `}</style>
      <Header />

      {/* Day/Night Toggle Button */}
      <button
        onClick={() => setIsDayMode(!isDayMode)}
        style={{
          position: "fixed",
          top: "120px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "3px solid rgba(255, 255, 255, 0.3)",
          background: isDayMode
            ? "linear-gradient(135deg, #FFD700, #FFA500)"
            : "linear-gradient(135deg, #1a1a2e, #0a0e27)",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: isDayMode
            ? "0 0 20px rgba(255, 215, 0, 0.6)"
            : "0 0 20px rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isDayMode ? "☀️" : "🌙"}
      </button>

      <div
        style={{
          position: "relative",
          top: "50px",
          width: "100%",
          height: "100vh",
          background: isDayMode
            ? "linear-gradient(to bottom, #87CEEB, #E0F6FF, #FFFFFF)"
            : "linear-gradient(to bottom, #0a0e27, #1a1a2e, #16213e)",
          overflow: "hidden",
          transition: "background 0.5s ease",
        }}
      >
        {/* Day Mode - Sun */}
        {isDayMode && <div className="sun"></div>}

        {/* Night Mode - Moon, Shooting Stars, and Twinkling Stars */}
        {!isDayMode && (
          <>
            {/* Moon */}
            <div className="moon"></div>

            {/* Shooting stars */}
            <div className="shooting-star shooting-star1"></div>
            <div className="shooting-star shooting-star2"></div>
            <div className="shooting-star shooting-star3"></div>

            {/* Twinkling stars */}
            <div className="star star1"></div>
            <div className="star star2"></div>
            <div className="star star3"></div>
            <div className="star star4"></div>
            <div className="star star5"></div>
            <div className="star star6"></div>
            <div className="star star7"></div>
            <div className="star star8"></div>
            <div className="star star9"></div>
            <div className="star star10"></div>
            <div className="star star11"></div>
            <div className="star star12"></div>
          </>
        )}

        <div style={{ position: "relative", zIndex: 1, marginTop: "80px" }}>
          <Spline scene="/scene-2.splinecode" />
        </div>
      </div>
      {showInstruction && (
        <Instruction onClose={() => setShowInstruction(false)} />
      )}
      {showCloud && (
        <Cloud
          onClose={() => setShowCloud(false)}
          left="45%" // Move to the left (lower % = more left)
          // ===== HOW TO ADJUST CLOUD POSITION =====
          // Uncomment and modify these props to change position:

          // top="20%"        // Distance from top (default: 20%)
          // bottom="auto"    // Distance from bottom (default: auto)
          // left="50%"       // Distance from left (default: 50% - centered)
          // right="auto"     // Distance from right (default: auto)

          // EXAMPLES:
          // Top-left corner:     top="10%" left="10%"
          // Top-right corner:    top="10%" right="10%" left="auto"
          // Bottom-left corner:  bottom="10%" left="10%" top="auto"
          // Bottom-right corner: bottom="10%" right="10%" left="auto" top="auto"
          // Center screen:       top="50%" left="50%" (default is already centered)
          // Lower center:        top="60%" left="50%"
        />
      )}
      {showBookshelf && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowBookshelf(false)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Bookshelf
              onClose={() => setShowBookshelf(false)}
              onMangaClick={() => {
                setShowBookshelf(false);
                setShowManga(true);
              }}
            />
          </div>
        </div>
      )}
      {showManga && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Canvas
              shadows
              camera={{
                position: [0, 1, 4],
                fov: 50,
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <ambientLight intensity={0.8} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                castShadow
              />
              <directionalLight position={[-5, 3, -3]} intensity={0.4} />
              <pointLight position={[0, 2, 3]} intensity={0.5} />
              <Suspense fallback={null}>
                <group position={[0, -0.5, 0]}>
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
                </group>
              </Suspense>
            </Canvas>
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowManga(false)}
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
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              e.currentTarget.style.boxShadow =
                "0 2px 12px rgba(0, 0, 0, 0.15)";
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
        </div>
      )}
      {showRate && (
        <Rate onClose={() => setShowRate(false)} />
      )}
    </>
  );
}
