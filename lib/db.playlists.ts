import { supa } from "./supabase";

export type Playlist = { id: string; name: string; cover_url: string | null; created_at: string };
export type PlaylistItem = {
  id: string; playlist_id: string; track_id: string;
  title: string; artist?: string | null; artwork_url?: string | null; duration?: number | null;
};

export async function getMyPlaylists(): Promise<Playlist[]> {
  const { data: s } = await supa.auth.getSession();
  const uid = s.session?.user?.id;
  if (!uid) return [];
  const { data } = await supa
    .from("playlists")
    .select("id,name,cover_url,created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  return (data as any) || [];
}

export async function createPlaylist(name: string, cover_url?: string | null) {
  const { data: s } = await supa.auth.getSession();
  const user_id = s.session?.user?.id;
  if (!user_id) throw new Error("Not signed in");
  const { data, error } = await supa
    .from("playlists")
    .insert({ user_id, name, cover_url: cover_url || null })
    .select()
    .single();
  if (error) throw error;
  return data as Playlist;
}

export async function renamePlaylist(id: string, name: string) {
  const { error } = await supa.from("playlists").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deletePlaylist(id: string) {
  const { error } = await supa.from("playlists").delete().eq("id", id);
  if (error) throw error;
}

export async function getPlaylistItems(playlist_id: string): Promise<PlaylistItem[]> {
  const { data } = await supa
    .from("playlist_items")
    .select("id,playlist_id,track_id,title,artist,artwork_url,duration")
    .eq("playlist_id", playlist_id)
    .order("created_at", { ascending: false });
  return (data as any) || [];
}

export async function addItemToPlaylist(pId: string, item: Omit<PlaylistItem,"id"|"playlist_id">) {
  const { error } = await supa.from("playlist_items").insert({ playlist_id: pId, ...item });
  if (error) throw error;
}

export async function removeItem(id: string) {
  const { error } = await supa.from("playlist_items").delete().eq("id", id);
  if (error) throw error;
}
