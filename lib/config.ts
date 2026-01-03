function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  
  // extensive debug logging
  console.log(`[DEBUG] Checking env var: ${key}`);
  console.log(`[DEBUG] Raw value:`, value);
  console.log(`[DEBUG] Type:`, typeof value);
  console.log(`[DEBUG] All NEXT_PUBLIC vars:`, Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
  
  if (value === undefined || value === null || value === '') {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    console.warn(`⚠️ Using fallback for ${key}: ${fallback}`);
    return fallback;
  }
  console.log(`✅ Using env var ${key}:`, value);
  return value;
}

const apiUrl = getEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");

// log the final config
console.log('[Config] API URL:', apiUrl);

export const config = {
  apiUrl,
} as const;
