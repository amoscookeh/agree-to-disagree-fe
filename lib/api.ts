import { config } from "./config";
import type { ChatThread } from "./types";

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
