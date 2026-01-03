import { config } from "./config";
import type { ChatThread } from "./types";

export interface Thread {
  id: string;
  thread_id: string;
  query_text: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export interface ThreadsResponse {
  threads: Thread[];
  offset: number;
  limit: number;
}

export async function fetchChat(
  token: string,
  queryId: string
): Promise<ChatThread> {
  const res = await fetch(`${config.apiUrl}/api/chat/${queryId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch chat");
  return res.json();
}

export async function fetchThreads(
  token: string,
  limit: number = 20,
  offset: number = 0
): Promise<ThreadsResponse> {
  const res = await fetch(
    `${config.apiUrl}/api/threads?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch threads");
  return res.json();
}

export async function deleteThread(
  token: string,
  threadId: string
): Promise<{ deleted: boolean }> {
  const res = await fetch(`${config.apiUrl}/api/threads/${threadId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete thread");
  return res.json();
}
