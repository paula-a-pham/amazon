const PREFIX = 'amazon_';

export const getSessionItem = <T>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const setSessionItem = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently ignore
  }
};

export const removeSessionItem = (key: string): void => {
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Storage unavailable — silently ignore
  }
};
