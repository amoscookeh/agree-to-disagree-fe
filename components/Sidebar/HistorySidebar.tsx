"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchThreads, deleteThread, Thread } from "@/lib/api";

interface ChatHistoryProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatHistory({ isOpen, onToggle }: ChatHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadThreads = useCallback(
    async (reset = false) => {
      if (!token) return;

      setLoading(true);
      try {
        const offset = reset ? 0 : threads.length;
        const result = await fetchThreads(token, 30, offset);

        if (reset) {
          setThreads(result.threads);
        } else {
          setThreads((prev) => [...prev, ...result.threads]);
        }
        setHasMore(result.threads.length === 30);
      } catch (err) {
        console.error("Failed to load threads:", err);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    },
    [token, threads.length]
  );

  useEffect(() => {
    if (token) loadThreads(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!token) return;

    try {
      await deleteThread(token, threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (pathname === `/chat/${threadId}`) {
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const currentThreadId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!user) return null;

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800
          transition-all duration-300 z-40 flex flex-col
          ${isOpen ? "w-72" : "w-0 overflow-hidden"}
        `}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-zinc-200">Research History</h2>
          <button
            onClick={() => loadThreads(true)}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Refresh"
          >
            <RefreshIcon />
          </button>
        </div>

        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            + New Research
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && threads.length === 0 ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner loading-sm text-teal-500" />
            </div>
          ) : threads.length === 0 ? (
            <p className="p-4 text-center text-zinc-500 text-sm">
              No research history yet
            </p>
          ) : (
            <div className="py-2">
              {threads.map((thread) => (
                <div key={thread.id} className="relative group">
                  <button
                    onClick={() => router.push(`/chat/${thread.id}`)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors pr-10
                      ${currentThreadId === thread.id ? "bg-zinc-800 border-l-2 border-teal-500" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-zinc-300 line-clamp-2 flex-1">
                        {thread.title || thread.query_text || "Untitled"}
                      </span>
                      <span className="text-xs text-zinc-600 shrink-0">
                        {formatDate(thread.created_at)}
                      </span>
                    </div>
                    {!thread.is_completed && (
                      <span className="text-xs text-amber-500 mt-1 inline-block">
                        In Progress
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, thread.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-all"
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}

              {hasMore && !loading && (
                <button
                  onClick={() => loadThreads(false)}
                  className="w-full py-2 text-sm text-teal-500 hover:text-teal-400 transition-colors"
                >
                  Load more
                </button>
              )}

              {loading && threads.length > 0 && (
                <div className="flex justify-center p-4">
                  <span className="loading loading-spinner loading-sm text-teal-500" />
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <button
        onClick={onToggle}
        className={`
          fixed top-4 z-50 bg-zinc-800 border border-zinc-700 rounded-r-lg p-2
          hover:bg-zinc-700 transition-all duration-300
          ${isOpen ? "left-72" : "left-0"}
        `}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <ChevronIcon
          className={`w-5 h-5 text-zinc-400 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </>
  );
}

const RefreshIcon = () => (
  <svg
    className="w-4 h-4 text-zinc-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-3 h-3 text-zinc-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export { ChatHistory as HistorySidebar };
