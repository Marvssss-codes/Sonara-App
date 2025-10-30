// lib/player.ts
import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { getStreamUrl } from "./audius";

export type NowPlaying = {
  id: string;
  title: string;
  artist?: string | null;
  artwork?: string | null;
};

class PlayerCore {
  private sound: Audio.Sound | null = null;
  private loadedId: string | null = null;

  public current: NowPlaying | null = null;
  public isPlaying = false;
  public position = 0;   // ms
  public duration = 0;   // ms
  public onUpdate?: () => void; // subscriber callback

  constructor() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    }).catch(() => {});
  }

  private notify() {
    this.onUpdate?.();
  }

  async load(track: NowPlaying, autoplay = true) {
    try {
      const url = getStreamUrl(track.id);

      // unload previous
      if (this.sound) {
        await this.sound.unloadAsync().catch(() => {});
        this.sound.setOnPlaybackStatusUpdate(null);
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: autoplay, progressUpdateIntervalMillis: 250 },
      );

      this.sound = sound;
      this.loadedId = track.id;
      this.current = track;

      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st || !("isLoaded" in st)) return;
        if (!st.isLoaded) return;
        const s = st as AVPlaybackStatusSuccess;
        this.isPlaying = !!s.isPlaying;
        this.position = s.positionMillis ?? 0;
        this.duration = s.durationMillis ?? 0;
        this.notify();
      });
    } catch (e) {
      // swallow; UI can show error if needed
      throw e;
    }
  }

  async play() {
    if (!this.sound) return;
    await this.sound.playAsync();
  }
  async pause() {
    if (!this.sound) return;
    await this.sound.pauseAsync();
  }
  async seek(ms: number) {
    if (!this.sound) return;
    await this.sound.setPositionAsync(Math.max(0, Math.min(ms, this.duration || ms)));
  }

  async toggle() {
    if (!this.sound) return;
    if (this.isPlaying) await this.pause();
    else await this.play();
  }

  async dispose() {
    if (!this.sound) return;
    await this.sound.unloadAsync().catch(() => {});
    this.sound.setOnPlaybackStatusUpdate(null);
    this.sound = null;
    this.current = null;
    this.loadedId = null;
    this.isPlaying = false;
    this.position = 0;
    this.duration = 0;
    this.notify();
  }
}

export const Player = new PlayerCore();
