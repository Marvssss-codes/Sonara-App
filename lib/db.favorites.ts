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
  const { data } = await supa
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("track_id", trackId)
    .maybeSingle();
  return !!data;
}

export async function toggleFavorite(track: {
  id: string;
  title: string;
  user?: { name?: string | null } | null;
  artwork?: string | { [k: string]: string } | null;
  duration?: number | null;
}) {
  const user = (await supa.auth.getUser()).data.user;
  if (!user) throw new Error("Not logged in");

  // normalize artwork
  const artwork =
    typeof track.artwork === "string"
      ? track.artwork
      : (track.artwork &&
          (track.artwork["150x150"] ||
            track.artwork["480x480"] ||
            track.artwork["1000x1000"])) ||
        null;

  const { data: existing } = await supa
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("track_id", track.id)
    .maybeSingle();

  if (existing) {
    await supa.from("favorites").delete().eq("id", existing.id);
    return false; // now unliked
  } else {
    await supa.from("favorites").insert({
      user_id: user.id,
      track_id: track.id,
      title: track.title,
      artist: track.user?.name || "Unknown",
      artwork_url: artwork,
      duration: track.duration ?? null,
    });
    return true; // now liked
  }
}
