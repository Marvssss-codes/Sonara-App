// contexts/PlaybackContext.tsx
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Audio,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";

export type NowPlaying = {
  id: string;
  title: string;
  artist?: string | null;
  artwork?: string | null;
  streamUrl: string; // resolved URL that expo-av can play
};

type Ctx = {
  // state
  current: NowPlaying | null;
  queue: NowPlaying[];
  index: number;
  isPlaying: boolean;
  durationMs: number;
  positionMs: number;

  // controls
  playSingle: (t: NowPlaying, autoplay?: boolean) => Promise<void>;
  playFromList: (list: NowPlaying[], startIndex: number, autoplay?: boolean) => Promise<void>;
  toggle: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
};

const PlaybackContext = createContext<Ctx | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [queue, setQueue] = useState<NowPlaying[]>([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<NowPlaying | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [positionMs, setPositionMs] = useState(0);

  // Make sure we only ever have one audio mode & one sound
  const ensureAudioMode = useCallback(async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    });
  }, []);

  const unload = useCallback(async () => {
    const s = soundRef.current;
    if (s) {
      try {
        await s.unloadAsync();
      } catch {}
      s.setOnPlaybackStatusUpdate(undefined);
      soundRef.current = null;
    }
    setIsPlaying(false);
    setDurationMs(0);
    setPositionMs(0);
  }, []);

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status || !("isLoaded" in status)) return;
    if (!status.isLoaded) return;

    const s = status as AVPlaybackStatusSuccess;
    setIsPlaying(s.isPlaying);
    setDurationMs(s.durationMillis ?? 0);
    setPositionMs(s.positionMillis ?? 0);

    if (s.didJustFinish && !s.isLooping) {
      // Auto-advance
      void next();
    }
  }, []); // next is hoisted below but referenced via closure; fine in RN

  const load = useCallback(
    async (track: NowPlaying, autoplay = true) => {
      await ensureAudioMode();
      await unload();

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.streamUrl },
        { shouldPlay: autoplay, progressUpdateIntervalMillis: 300 },
        onStatus
      );

      soundRef.current = sound;
      setCurrent(track);
    },
    [ensureAudioMode, unload, onStatus]
  );

  const playSingle = useCallback(
    async (t: NowPlaying, autoplay = true) => {
      setQueue([t]);
      setIndex(0);
      await load(t, autoplay);
    },
    [load]
  );

  const playFromList = useCallback(
    async (list: NowPlaying[], startIndex: number, autoplay = true) => {
      const idx = Math.max(0, Math.min(list.length - 1, startIndex));
      setQueue(list);
      setIndex(idx);
      await load(list[idx], autoplay);
    },
    [load]
  );

  const play = useCallback(async () => {
    const s = soundRef.current;
    if (s) await s.playAsync().catch(() => {});
  }, []);

  const pause = useCallback(async () => {
    const s = soundRef.current;
    if (s) await s.pauseAsync().catch(() => {});
  }, []);

  const toggle = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    const st = (await s.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (st.isPlaying) await s.pauseAsync().catch(() => {});
    else await s.playAsync().catch(() => {});
  }, []);

  const seekTo = useCallback(async (ms: number) => {
    const s = soundRef.current;
    if (s) await s.setPositionAsync(Math.max(0, ms)).catch(() => {});
  }, []);

  const next = useCallback(async () => {
    if (queue.length < 2) return;
    const ni = (index + 1) % queue.length;
    setIndex(ni);
    await load(queue[ni], true);
  }, [index, queue, load]);

  const prev = useCallback(async () => {
    if (queue.length < 2) return;
    const pi = (index - 1 + queue.length) % queue.length;
    setIndex(pi);
    await load(queue[pi], true);
  }, [index, queue, load]);

  // Cleanup on unmount (development fast refresh safe)
  useEffect(() => {
    return () => {
      const s = soundRef.current;
      if (s) {
        try {
          s.unloadAsync();
        } catch {}
      }
    };
  }, []);

  const value: Ctx = useMemo(
    () => ({
      current,
      queue,
      index,
      isPlaying,
      durationMs,
      positionMs,
      playSingle,
      playFromList,
      toggle,
      play,
      pause,
      next,
      prev,
      seekTo,
    }),
    [
      current,
      queue,
      index,
      isPlaying,
      durationMs,
      positionMs,
      playSingle,
      playFromList,
      toggle,
      play,
      pause,
      next,
      prev,
      seekTo,
    ]
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  const v = useContext(PlaybackContext);
  if (!v) throw new Error("PlaybackProvider is not mounted.");
  return v;
}
