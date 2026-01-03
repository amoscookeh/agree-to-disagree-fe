function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  
  // debug logging
  if (typeof window === 'undefined') {
    console.log(`[Server] ${key}:`, value || '(undefined)');
  }
  
  if (value === undefined || value === null || value === '') {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    console.warn(`Using fallback for ${key}: ${fallback}`);
    return fallback;
  }
  return value;
}

const apiUrl = getEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");

// log the final config
console.log('[Config] API URL:', apiUrl);

export const config = {
  apiUrl,
} as const;
