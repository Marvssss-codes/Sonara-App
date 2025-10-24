// lib/db.ts
import { supa } from "./supabase";

export async function addFavorite(
  userId: string,
  track: { id: string; title: string; artist?: string; artwork_url?: string }
) {
  return supa.from("favorites").insert({
    user_id: userId,
    track_id: track.id,
    title: track.title,
    artist: track.artist || "",
    artwork_url: track.artwork_url || "",
    source: "audius",
  });
}

export async function removeFavorite(userId: string, trackId: string) {
  return supa.from("favorites").delete().eq("user_id", userId).eq("track_id", trackId);
}

export async function listFavorites(userId: string) {
  return supa
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createPlaylist(userId: string, name: string) {
  return supa.from("playlists").insert({ user_id: userId, name }).select("*").single();
}

export async function listPlaylists(userId: string) {
  return supa
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function addToPlaylist(
  playlistId: string,
  track: { id: string; title: string; artist?: string; artwork_url?: string }
) {
  return supa.from("playlist_items").insert({
    playlist_id: playlistId,
    track_id: track.id,
    title: track.title,
    artist: track.artist || "",
    artwork_url: track.artwork_url || "",
  });
}

export async function listPlaylistItems(playlistId: string) {
  return supa
    .from("playlist_items")
    .select("*")
    .eq("playlist_id", playlistId)
    .order("added_at", { ascending: false });
}
