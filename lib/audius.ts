// lib/audius.ts
export type AudiusUser = { id: string; name: string; image?: string | null };
export type AudiusTrack = {
  id: string;
  title: string;
  duration?: number | null;
  artwork?: string | null;
  user?: AudiusUser;
};

const BASE = "https://discoveryprovider.audius.co/v1";
const APP = "sonara";

// pick the highest quality available from an images object like {150x150, 480x480, 1000x1000}
function pickImage(images?: Record<string, string> | null): string | null {
  if (!images) return null;
  return (
    images["1000x1000"] ||
    images["480x480"] ||
    images["150x150"] ||
    null
  );
}

// ensure we always return https urls (RN/iOS blocks http)
function ensureHttps(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

export function normalizeTrack(t: any): AudiusTrack {
  const artwork =
    pickImage(t?.artwork) ||
    pickImage(t?.cover_art) || // some endpoints use cover_art
    pickImage(t?.downloadable?.artwork) ||
    pickImage(t?.remix_of?.tracks?.[0]?.artwork) ||
    null;

  const userImg =
    pickImage(t?.user?.profile_picture_sizes) ||
    pickImage(t?.user?.profile_picture) ||
    null;

  return {
    id: String(t?.id),
    title: String(t?.title ?? "Untitled"),
    duration: t?.duration ?? null,
    artwork: ensureHttps(artwork) || ensureHttps(userImg), // fallback to artist image
    user: {
      id: String(t?.user?.id ?? ""),
      name: String(t?.user?.name ?? t?.user?.handle ?? "Unknown"),
      image: ensureHttps(userImg),
    },
  };
}

// ---- SEARCH ----
export async function searchTracks(query: string, limit = 25): Promise<AudiusTrack[]> {
  if (!query.trim()) return [];
  const url = `${BASE}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&app_name=${APP}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data || []).map(normalizeTrack);
}

// (optional) trending helper if you need it elsewhere
export async function getTrending(limit = 12): Promise<AudiusTrack[]> {
  const res = await fetch(`${BASE}/tracks/trending?limit=${limit}&app_name=${APP}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data || []).map(normalizeTrack);
}
