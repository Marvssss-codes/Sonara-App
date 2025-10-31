import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { addToRecentlyPlayed, getPlayerSettings, savePlayerSettings } from "../lib/playerStorage";
import type { PlayerSettings, PlaylistInfo, Track } from "../types/player";

type PlayerContextType = {
  track: Track | null;
  setTrack: (track: Track | null) => void;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
  playerExpanded: boolean;
  setPlayerExpanded: (expanded: boolean) => void;
  currentPlaylist: PlaylistInfo | null;
  currentTrackIndex: number;
  playTrack: (track: Track, playlist?: PlaylistInfo, index?: number) => Promise<void>;
  playPlaylist: (playlist: PlaylistInfo, startIndex?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  settings: PlayerSettings;
  updateSettings: (settings: Partial<PlayerSettings>) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [bufferedMs, setBufferedMs] = useState(0);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistInfo | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [settings, setSettings] = useState<PlayerSettings>({ autoplay: true, shuffle: false, repeat: "off" });

  useEffect(() => {
    Audio.setAudioModeAsync({ staysActiveInBackground: true, shouldDuckAndroid: true, playsInSilentModeIOS: true });
    getPlayerSettings().then(setSettings).catch(() => {});
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAndPlay = useCallback(async (nextTrack: Track, shouldPlay: boolean) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }

    const sound = new Audio.Sound();
    soundRef.current = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      const s = status as AVPlaybackStatusSuccess;
      setIsPlaying(s.isPlaying);
      setPositionMs(s.positionMillis ?? 0);
      setDurationMs(s.durationMillis ?? 0);
      const buffered = Array.isArray((s as any).playableDurationMillis) ? (s as any).playableDurationMillis[0] : ((s as any).playableDurationMillis as number | undefined);
      setBufferedMs(buffered ?? 0);

      if (s.didJustFinish) {
        handleTrackEnd();
      }
    });

    const source = typeof nextTrack.source === "number" ? nextTrack.source : { uri: nextTrack.source.uri };
    await sound.loadAsync(source, { shouldPlay });
    setTrack(nextTrack);

    addToRecentlyPlayed({ id: nextTrack.id, title: nextTrack.title, artist: nextTrack.artist ?? null, artwork: nextTrack.artworkUri ?? null }).catch(() => {});
  }, []);

  const handleTrackEnd = useCallback(async () => {
    if (settings.repeat === "one") {
      await seekTo(0);
      await soundRef.current?.playAsync();
      return;
    }
    await nextTrack();
  }, [settings.repeat]);

  const playTrack = useCallback(async (newTrack: Track, playlist?: PlaylistInfo, index?: number) => {
    if (playlist) {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(index ?? 0);
    } else {
      setCurrentPlaylist(null);
      setCurrentTrackIndex(0);
    }
    await loadAndPlay(newTrack, true);
  }, [loadAndPlay]);

  const playPlaylist = useCallback(async (playlist: PlaylistInfo, startIndex: number = 0) => {
    setCurrentPlaylist(playlist);
    const index = Math.max(0, Math.min(startIndex, (playlist.trackIds?.length ?? 1) - 1));
    setCurrentTrackIndex(index);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, []);

  const seekTo = useCallback(async (position: number) => {
    if (!soundRef.current) return;
    const ms = Math.max(0, Math.min(position, durationMs || position));
    await soundRef.current.setPositionAsync(ms);
  }, [durationMs]);

  const resolveNextIndex = useCallback((dir: 1 | -1): number | null => {
    if (!currentPlaylist || !currentPlaylist.trackIds?.length) return null;
    const count = currentPlaylist.trackIds.length;
    if (settings.shuffle) {
      if (count <= 1) return currentTrackIndex;
      let nextIdx = currentTrackIndex;
      while (nextIdx === currentTrackIndex) {
        nextIdx = Math.floor(Math.random() * count);
      }
      return nextIdx;
    }
    const next = currentTrackIndex + dir;
    if (next < 0) return settings.repeat === "all" ? count - 1 : null;
    if (next >= count) return settings.repeat === "all" ? 0 : null;
    return next;
  }, [currentPlaylist, currentTrackIndex, settings.shuffle, settings.repeat]);

  const nextTrack = useCallback(async () => {
    const nextIdx = resolveNextIndex(1);
    if (nextIdx == null) {
      return;
    }
    setCurrentTrackIndex(nextIdx);
  }, [resolveNextIndex]);

  const previousTrack = useCallback(async () => {
    const prevIdx = resolveNextIndex(-1);
    if (prevIdx == null) return;
    setCurrentTrackIndex(prevIdx);
  }, [resolveNextIndex]);

  const updateSettings = useCallback(async (partial: Partial<PlayerSettings>) => {
    setSettings((s) => {
      const updated = { ...s, ...partial } as PlayerSettings;
      savePlayerSettings(updated).catch(() => {});
      return updated;
    });
  }, []);

  const value = useMemo<PlayerContextType>(() => ({
    track,
    setTrack,
    isPlaying,
    positionMs,
    durationMs,
    bufferedMs,
    playerExpanded,
    setPlayerExpanded,
    currentPlaylist,
    currentTrackIndex,
    playTrack,
    playPlaylist,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    settings,
    updateSettings,
  }), [track, isPlaying, positionMs, durationMs, bufferedMs, playerExpanded, currentPlaylist, currentTrackIndex, playTrack, playPlaylist, togglePlayPause, nextTrack, previousTrack, seekTo, settings, updateSettings]);

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
