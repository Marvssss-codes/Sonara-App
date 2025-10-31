// lib/db.favorites.ts
import { supa } from "./supabase";

export type FavoriteRow = {
  id: string;
  user_id: string;
  track_id: string;
  title: string;
  artist: string | null;
  artwork_url: string | null;
  duration: number | null;
  created_at: string;
};

/* ---------- utils ---------- */
function normalizeArtwork(
  art?: string | { [k: string]: string } | null
): string | null {
  if (!art) return null;
  if (typeof art === "string") return art;
  return art["150x150"] || art["480x480"] || art["1000x1000"] || null;
}

/* ---------- queries ---------- */
export async function getMyFavorites(): Promise<FavoriteRow[]> {
  const user = (await supa.auth.getUser()).data.user;
  if (!user) throw new Error("Not logged in");

  const { data, error } = await supa
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as FavoriteRow[];
}

export async function isFavorite(trackId: string) {
  const user = (await supa.auth.getUser()).data.user;
  if (!user) return false;

  const { data, error } = await supa
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("track_id", trackId)
    .limit(1);

  if (error) return false;
  return !!(data && data.length > 0);
}

/** Remove ALL rows for this (user, track) to kill duplicates safely. */
export async function removeFavorite(trackId: string): Promise<boolean> {
  const user = (await supa.auth.getUser()).data.user;
  if (!user) throw new Error("Not logged in");

  const { error } = await supa
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("track_id", trackId);

  if (error) throw error;
  return true;
}

/**
 * Toggle like. Robust against duplicates:
 * - Checks existence with a bounded query (no .single/.maybeSingle).
 * - On unlike: deletes all matches for safety.
 */
export async function toggleFavorite(track: {
  id: string;
  title: string;
  user?: { name?: string | null } | null;
  artwork?: string | { [k: string]: string } | null;
  duration?: number | null;
}): Promise<boolean> {
  const user = (await supa.auth.getUser()).data.user;
  if (!user) throw new Error("Not logged in");

  const artist = track.user?.name || "Unknown";
  const artwork = normalizeArtwork(track.artwork);

  // existence check without .single()
  const { data: existing, error: checkErr } = await supa
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("track_id", track.id)
    .limit(1);

  if (checkErr) throw checkErr;

  if (existing && existing.length > 0) {
    // UNLIKE: delete all duplicates just in case
    const { error: delErr } = await supa
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("track_id", track.id);
    if (delErr) throw delErr;
    return false;
  } else {
    const { error: insErr } = await supa.from("favorites").insert([
      {
        user_id: user.id,
        track_id: track.id,
        title: track.title,
        artist,
        artwork_url: artwork,
        duration: track.duration ?? null,
      },
    ]);
    if (insErr) throw insErr;
    return true;
  }
}

/**
 * Optional helper to clean existing duplicates for the current user.
 * Call once from a settings screen or dev button if needed.
 */
export async function dedupeFavorites(): Promise<void> {
  const user = (await supa.auth.getUser()).data.user;
  if (!user) throw new Error("Not logged in");

  // Get all favorites
  const { data } = await supa
    .from("favorites")
    .select("id, track_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const map = new Map<string, string[]>(); // track_id -> ids to delete (excluding newest)
  (data || []).forEach((row: any) => {
    const arr = map.get(row.track_id) || [];
    arr.push(row.id);
    map.set(row.track_id, arr);
  });

  for (const [, ids] of map) {
    if (ids.length > 1) {
      // keep first (newest), delete the rest
      const idsToDelete = ids.slice(1);
      await supa.from("favorites").delete().in("id", idsToDelete);
    }
  }
}
