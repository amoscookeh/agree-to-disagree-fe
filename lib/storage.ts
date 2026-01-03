// safe localStorage wrapper that handles SSR and errors gracefully

export function getItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    console.warn(`Failed to read ${key} from localStorage`);
    return null;
  }
}

export function setItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    console.warn(`Failed to write ${key} to localStorage`);
    return false;
  }
}

export function removeItem(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    console.warn(`Failed to remove ${key} from localStorage`);
    return false;
  }
}
