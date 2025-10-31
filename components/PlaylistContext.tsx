import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Playlist } from "../types/player";
import { addTrackToPlaylist, createPlaylist, deletePlaylist, getPlaylists, removeTrackFromPlaylist, savePlaylists, updatePlaylist } from "../lib/playlistsStorage";

type PlaylistContextType = {
  playlists: Playlist[];
  refresh: () => Promise<void>;
  create: (name: string, description?: string) => Promise<Playlist>;
  update: (p: Playlist) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addTrack: (playlistId: string, trackId: string) => Promise<void>;
  removeTrack: (playlistId: string, trackId: string) => Promise<void>;
};

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const refresh = async () => {
    const list = await getPlaylists();
    setPlaylists(list);
  };

  useEffect(() => {
    refresh();
  }, []);

  const createCb: PlaylistContextType["create"] = async (name, description) => {
    const p = await createPlaylist(name, description);
    await refresh();
    return p;
  };

  const updateCb: PlaylistContextType["update"] = async (p) => {
    await updatePlaylist(p);
    await refresh();
  };

  const removeCb: PlaylistContextType["remove"] = async (id) => {
    await deletePlaylist(id);
    await refresh();
  };

  const addTrackCb: PlaylistContextType["addTrack"] = async (playlistId, trackId) => {
    await addTrackToPlaylist(playlistId, trackId);
    await refresh();
  };

  const removeTrackCb: PlaylistContextType["removeTrack"] = async (playlistId, trackId) => {
    await removeTrackFromPlaylist(playlistId, trackId);
    await refresh();
  };

  const value = useMemo(() => ({ playlists, refresh, create: createCb, update: updateCb, remove: removeCb, addTrack: addTrackCb, removeTrack: removeTrackCb }), [playlists]);

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylists = () => {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistProvider");
  return ctx;
};


