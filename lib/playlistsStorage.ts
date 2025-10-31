import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Playlist } from "../types/player";

const PLAYLISTS_KEY = "@sonara:playlists";

export async function getPlaylists(): Promise<Playlist[]> {
  try {
    const json = await AsyncStorage.getItem(PLAYLISTS_KEY);
    if (!json) return [];
    const list = JSON.parse(json) as Playlist[];
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export async function createPlaylist(name: string, description?: string): Promise<Playlist> {
  const now = Date.now();
  const playlist: Playlist = {
    id: `pl_${now}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    trackIds: [],
    createdAt: now,
    updatedAt: now,
  };
  const all = await getPlaylists();
  const updated = [playlist, ...all];
  await savePlaylists(updated);
  return playlist;
}

export async function updatePlaylist(updated: Playlist): Promise<void> {
  const all = await getPlaylists();
  const next = all.map((p) => (p.id === updated.id ? { ...updated, updatedAt: Date.now() } : p));
  await savePlaylists(next);
}

export async function deletePlaylist(id: string): Promise<void> {
  const all = await getPlaylists();
  const next = all.filter((p) => p.id !== id);
  await savePlaylists(next);
}

export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  const all = await getPlaylists();
  const next = all.map((p) => (p.id === playlistId ? { ...p, trackIds: p.trackIds.includes(trackId) ? p.trackIds : [trackId, ...p.trackIds], updatedAt: Date.now() } : p));
  await savePlaylists(next);
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  const all = await getPlaylists();
  const next = all.map((p) => (p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId), updatedAt: Date.now() } : p));
  await savePlaylists(next);
}


