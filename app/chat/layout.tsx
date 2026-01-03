"use client";

import { useState } from "react";
import { ChatHistory } from "@/components/Sidebar/HistorySidebar";
import { useAuth } from "@/context/AuthContext";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ChatHistory
        isOpen={sidebarOpen && !!user}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`
          min-h-screen transition-all duration-300
          ${sidebarOpen && user ? "ml-72" : "ml-0"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
