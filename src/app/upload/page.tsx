"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadTraces from "./components/UploadTraces";
import { Button } from "@/components/ui/button";

export default function Upload() {
  const [showDashboardButton, setShowDashboardButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkData() {
      try {
        const response = await fetch("/upload/api/check-data");
        const data = await response.json();
        setShowDashboardButton(data.dataExists);
      } catch (error) {
        console.error("Error checking data:", error);
      }
    }

    checkData();
  }, []);

  return (
    <div className="relative w-full h-screen">
      {showDashboardButton && (
        <Button className="absolute top-4 left-4" onClick={() => router.push("/dashboard")} variant="outline">
          Dashboard
        </Button>
      )}
      <div className="flex items-center justify-center h-full">
        <UploadTraces />
      </div>
    </div>
  );
}
