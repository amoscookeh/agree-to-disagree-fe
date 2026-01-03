// static access required for Next.js client-side env vars
// process.env[key] doesn't work - must use literal property access
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

console.log("[Config] API URL:", apiUrl);

export const config = {
  apiUrl,
} as const;
