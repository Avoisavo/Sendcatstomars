"use client";

import Bookshelf from "@/components/Bookshelf";
import { useRouter } from "next/navigation";

export default function BookshelfPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/catroom");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "white", // White background when accessed directly
        position: "relative",
      }}
    >
      <Bookshelf onClose={handleClose} />
    </div>
  );
}
