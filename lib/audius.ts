// Minimal Audius client for public endpoints
// Docs pattern: https://api.audius.co/v1/...
const API = "https://api.audius.co/v1";
const APP = "sonara"; // app name for rate limiting identification

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audius ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type AudiusTrack = {
  id: string;
  title: string;
  user: { handle: string; name: string };
  artwork: { "150x150": string; "480x480": string; "1000x1000": string } | null;
  duration: number;
  genre?: string;
  mood?: string;
  permalink: string;
};

type TracksResp = { data: AudiusTrack[] };

export async function getTrendingAll(time: "week" | "month" | "year" = "week") {
  const url = `${API}/tracks/trending?time=${time}&app_name=${APP}`;
  const json = await fetchJson<TracksResp>(url);
  return json.data;
}

export async function getTrendingByGenre(genre: string, time: "week" | "month" | "year" = "week") {
  const url = `${API}/tracks/trending?genre=${encodeURIComponent(genre)}&time=${time}&app_name=${APP}`;
  const json = await fetchJson<TracksResp>(url);
  return json.data;
}

// lib/audius.ts (add this)
export async function searchTracks(query: string, limit = 25): Promise<AudiusTrack[]> {
  if (!query.trim()) return [];
  const base = "https://discoveryprovider.audius.co/v1";
  const url = `${base}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&app_name=sonara`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  // audius returns { data: [...] }
  return json?.data || [];
}