// direct access to env var
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// debug logging
console.log('[DEBUG] Direct access - NEXT_PUBLIC_API_URL:', API_URL);
console.log('[DEBUG] Type:', typeof API_URL);
console.log('[DEBUG] All env keys:', Object.keys(process.env));
console.log('[DEBUG] All NEXT_PUBLIC vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));

// use fallback if not set
const apiUrl = API_URL || "http://localhost:8000";

if (!API_URL) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using fallback:', apiUrl);
} else {
  console.log('✅ Using NEXT_PUBLIC_API_URL:', apiUrl);
}

export const config = {
  apiUrl,
} as const;
