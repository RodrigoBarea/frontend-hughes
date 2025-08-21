// lib/parent-session.ts
export type ParentSession = {
  id: number;
  email: string;
  fullName?: string;
};

const KEY = "hs_parent";

export function saveParentSession(s: ParentSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function getParentSession(): ParentSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ParentSession) : null;
  } catch {
    return null;
  }
}

export function clearParentSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
