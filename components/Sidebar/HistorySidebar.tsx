"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchThreads, deleteThread, Thread } from "@/lib/api";
import { formatRelativeDate } from "@/lib/dateUtils";

const THREADS_PAGE_SIZE = 30;

interface HistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function HistorySidebar({ isOpen, onToggle }: HistorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const loadThreads = useCallback(
    async (reset = false) => {
      if (!token) return;

      setLoading(true);
      try {
        const offset = reset ? 0 : offsetRef.current;
        const result = await fetchThreads(token, THREADS_PAGE_SIZE, offset);

        if (reset) {
          setThreads(result.threads);
          offsetRef.current = result.threads.length;
        } else {
          setThreads((prev) => [...prev, ...result.threads]);
          offsetRef.current += result.threads.length;
        }
        setHasMore(result.threads.length === THREADS_PAGE_SIZE);
      } catch (err) {
        console.error("Failed to load threads:", err);
        setThreads([]);
        offsetRef.current = 0;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      loadThreads(true);
    }
  }, [token, loadThreads]);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, threadId: string) => {
      e.stopPropagation();
      if (!token) return;

      try {
        await deleteThread(token, threadId);
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
        offsetRef.current -= 1;
        if (pathname === `/chat/${threadId}`) {
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    },
    [token, pathname, router]
  );

  const handleRefresh = useCallback(() => {
    loadThreads(true);
  }, [loadThreads]);

  const handleLoadMore = useCallback(() => {
    loadThreads(false);
  }, [loadThreads]);

  const handleNewResearch = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      router.push(`/chat/${threadId}`);
    },
    [router]
  );

  const currentThreadId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  if (!user) return null;

  const completedThreads = threads.filter((t) => t.is_completed);

  return (
    <>
      <aside
        role="navigation"
        aria-label="Research history"
        className={`
          fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800
          transition-all duration-300 z-40 flex flex-col
          ${isOpen ? "w-72" : "w-0 overflow-hidden"}
        `}
      >
        <header className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-zinc-200">Research History</h2>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Refresh history"
          >
            <RefreshIcon aria-hidden="true" />
          </button>
        </header>

        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={handleNewResearch}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            + New Research
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto" aria-label="Research threads">
          {loading && threads.length === 0 ? (
            <div className="flex justify-center p-4" role="status">
              <span className="loading loading-spinner loading-sm text-teal-500" />
              <span className="sr-only">Loading threads...</span>
            </div>
          ) : completedThreads.length === 0 ? (
            <p className="p-4 text-center text-zinc-500 text-sm">
              No research history yet
            </p>
          ) : (
            <ul className="py-2">
              {completedThreads.map((thread) => (
                <li key={thread.id} className="relative group">
                  <button
                    onClick={() => handleSelectThread(thread.id)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors pr-10
                      ${currentThreadId === thread.id ? "bg-zinc-800 border-l-2 border-teal-500" : ""}
                    `}
                    aria-current={
                      currentThreadId === thread.id ? "page" : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-zinc-300 line-clamp-2 flex-1">
                        {thread.title || thread.query_text || "Untitled"}
                      </span>
                      <time
                        className="text-xs text-zinc-600 shrink-0"
                        dateTime={thread.created_at}
                      >
                        {formatRelativeDate(thread.created_at)}
                      </time>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, thread.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-all"
                    aria-label={`Delete "${thread.title || thread.query_text || "Untitled"}"`}
                  >
                    <TrashIcon aria-hidden="true" />
                  </button>
                </li>
              ))}

              {hasMore && !loading && (
                <li>
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-2 text-sm text-teal-500 hover:text-teal-400 transition-colors"
                  >
                    Load more
                  </button>
                </li>
              )}

              {loading && threads.length > 0 && (
                <li className="flex justify-center p-4" role="status">
                  <span className="loading loading-spinner loading-sm text-teal-500" />
                  <span className="sr-only">Loading more threads...</span>
                </li>
              )}
            </ul>
          )}
        </nav>
      </aside>

      <button
        onClick={onToggle}
        className={`
          fixed top-4 z-50 bg-zinc-800 border border-zinc-700 rounded-r-lg p-2
          hover:bg-zinc-700 transition-all duration-300
          ${isOpen ? "left-72" : "left-0"}
        `}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
      >
        <ChevronIcon
          className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
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
    role="img"
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
    role="img"
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
    role="img"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// backward compatibility export
export { HistorySidebar as ChatHistory };
