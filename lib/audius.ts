// lib/audius.ts

const API_BASE = "https://discoveryprovider.audius.co/v1";

export type AudiusUser = {
  handle?: string;
  name?: string;
};

export type AudiusArtwork = {
  "100x100"?: string;
  "480x480"?: string;
  "1000x1000"?: string;
};

export type AudiusTrack = {
  id: string;
  title: string;
  user?: AudiusUser;
  artwork?: AudiusArtwork;
  artwork_url?: string;
  duration?: number;
};

function pickArtwork(t: Partial<AudiusTrack>): string {
  const a = (t as any)?.artwork as AudiusArtwork | undefined;
  return (
    (t as any)?.artwork_url ||
    a?.["480x480"] ||
    a?.["1000x1000"] ||
    a?.["100x100"] ||
    ""
  );
}

async function fetchJson<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Audius request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function searchTracks(q: string, limit = 20): Promise<AudiusTrack[]> {
  const url = `${API_BASE}/tracks/search?query=${encodeURIComponent(q)}&limit=${limit}`;
  const json = await fetchJson<{ data?: any[] }>(url);
  const list = Array.isArray(json?.data) ? json.data : [];
  return list.map((t: any) => ({
    ...t,
    artwork_url: pickArtwork(t),
  }));
}

export async function trendingTracks(limit = 20): Promise<AudiusTrack[]> {
  const url = `${API_BASE}/tracks/trending?limit=${limit}`;
  const json = await fetchJson<{ data?: any[] }>(url);
  const list = Array.isArray(json?.data) ? json.data : [];
  return list.map((t: any) => ({
    ...t,
    artwork_url: pickArtwork(t),
  }));
}
