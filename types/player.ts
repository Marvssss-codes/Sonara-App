export type TrackSource = { uri: string } | number; // number for require('...') assets

export type Track = {
  id: string;
  title: string;
  artist: string;
  artworkUri?: string; // optional image uri
  source: TrackSource; // local require or remote URL
  durationMs?: number; // optional known duration
};

export type Playlist = {
  id: string;
  name: string;
  description?: string;
  trackIds: string[]; // references to tracks in a library; minimal for persistence
  createdAt: number;
  updatedAt: number;
};

export type PlayerSettings = {
  autoplay: boolean;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
};

export type PlaylistInfo = {
  id: string;
  name: string;
  trackIds: string[];
};

export type PlayerProgress = {
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
};


