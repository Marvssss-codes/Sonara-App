// lib/audius.ts
const API_BASE = "https://discoveryprovider.audius.co/v1";

export type AudiusTrack = {
  id: string;
  title: string;
  user?: { handle?: string; name?: string };
  artwork?: { '100x100'?: string; '480x480'?: string; '1000x1000'?: string };
  artwork_url?: string; // some responses provide direct
  duration?: number;
};

function pickArtwork(t: AudiusTrack) {
  return (
    t.artwork_url ||
    t.artwork?.["480x480"] ||
    t.artwork?.["100x100"] ||
    t.artwork?.["1000x1000"] ||
    ""
  );
}

export async function searchTracks(q: string, limit = 20): Promise<AudiusTrack[]> {
  const url = `${API_BASE}/tracks/search?query=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Audius search failed");
  const json = await res.json();
  const list: AudiusTrack[] = json?.data || [];
  return list.map(t => ({ ...t, artwork_url: pickArtwork(t) }));
}

export async function trendingTracks(limit = 20): Promise<AudiusTrack[]> {
  const url = `${API_BASE}/tracks/trending?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Audius trending failed");
  const json = await res.json();
  const list: AudiusTrack[] = json?.data || {};
  return (list as any[]).map((t: any) => ({ ...t, artwork_url: pickArtwork(t) }));
}
