function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback || "";
}

export const config = {
  apiUrl: getEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000"),
} as const;
