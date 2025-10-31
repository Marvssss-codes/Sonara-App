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

export type RepeatMode = "off" | "one" | "all";

type Ctx = {
  // state
  current: NowPlaying | null;
  queue: NowPlaying[];
  index: number;
  isPlaying: boolean;
  durationMs: number;
  positionMs: number;
  repeatMode: RepeatMode;

  // controls
  playSingle: (t: NowPlaying, autoplay?: boolean) => Promise<void>;
  playFromList: (list: NowPlaying[], startIndex: number, autoplay?: boolean) => Promise<void>;
  toggle: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  setRepeatMode: (m: RepeatMode) => void;
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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

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

  // Forward declare to use inside onStatus
  const nextRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const replayCurrentRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status || !("isLoaded" in status)) return;
    if (!status.isLoaded) return;

    const s = status as AVPlaybackStatusSuccess;
    setIsPlaying(s.isPlaying);
    setDurationMs(s.durationMillis ?? 0);
    setPositionMs(s.positionMillis ?? 0);

    if (s.didJustFinish && !s.isLooping) {
      // Handle repeat logic
      if (repeatMode === "one") {
        // Restart the same track
        void replayCurrentRef.current();
        return;
      }
      if (repeatMode === "all") {
        void nextRef.current();
        return;
      }
      // repeatMode === "off"
      // Only advance if we haven't reached the end; otherwise stop.
      const atEnd = index >= queue.length - 1;
      if (!atEnd) void nextRef.current();
      // if at end, do nothing; stays stopped at end
    }
  }, [repeatMode, index, queue.length]);

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

  // helper to replay current (for repeat "one")
  const replayCurrent = useCallback(async () => {
    const t = current;
    if (!t) return;
    await load(t, true);
  }, [current, load]);
  replayCurrentRef.current = replayCurrent;

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
    if (queue.length === 0) return;
    const atEnd = index >= queue.length - 1;
    if (atEnd) {
      if (repeatMode === "all") {
        setIndex(0);
        await load(queue[0], true);
      } else {
        // repeat off / one: do nothing at hard end
      }
      return;
    }
    const ni = index + 1;
    setIndex(ni);
    await load(queue[ni], true);
  }, [index, queue, load, repeatMode]);
  nextRef.current = next;

  const prev = useCallback(async () => {
    if (queue.length === 0) return;
    const atStart = index <= 0;
    if (atStart) {
      if (repeatMode === "all" && queue.length > 1) {
        const last = queue.length - 1;
        setIndex(last);
        await load(queue[last], true);
      } else {
        // at hard start: restart current to beginning
        await seekTo(0);
      }
      return;
    }
    const pi = index - 1;
    setIndex(pi);
    await load(queue[pi], true);
  }, [index, queue, load, repeatMode, seekTo]);

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
      repeatMode,
      playSingle,
      playFromList,
      toggle,
      play,
      pause,
      next,
      prev,
      seekTo,
      setRepeatMode,
    }),
    [
      current,
      queue,
      index,
      isPlaying,
      durationMs,
      positionMs,
      repeatMode,
      playSingle,
      playFromList,
      toggle,
      play,
      pause,
      next,
      prev,
      seekTo,
      setRepeatMode,
    ]
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  const v = useContext(PlaybackContext);
  if (!v) throw new Error("PlaybackProvider is not mounted.");
  return v;
}
