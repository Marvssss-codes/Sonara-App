import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENTLY_PLAYED_KEY = "@sonara:recently_played";
const PLAYER_SETTINGS_KEY = "@sonara:player_settings";
const MAX_RECENT_TRACKS = 50;

export type RecentlyPlayedTrack = {
    id: string;
    title: string;
    artist?: string | null;
    artwork?: string | null;
    playedAt: number;
};

export type PlayerSettings = {
    autoplay: boolean;
    shuffle: boolean;
    repeat: "off" | "all" | "one";
};

export const defaultSettings: PlayerSettings = {
    autoplay: true,
    shuffle: false,
    repeat: "off",
};

/**
 * Get recently played tracks
 */
export async function getRecentlyPlayed(): Promise<RecentlyPlayedTrack[]> {
  try {
        const json = await AsyncStorage.getItem(RECENTLY_PLAYED_KEY);
        if (!json) return [];
        const tracks = JSON.parse(json) as RecentlyPlayedTrack[];
        return tracks.sort((a, b) => b.playedAt - a.playedAt);
    } catch {
        return [];
    }
}

/**
 * Add a track to recently played
 */
export async function addToRecentlyPlayed(track: {
    id: string;
    title: string;
    artist?: string | null;
    artwork?: string | null;
}): Promise<void> {
    try {
        const recent = await getRecentlyPlayed();
        const existing = recent.findIndex((t) => t.id === track.id);

        if (existing >= 0) {
            // Move to top
            recent.splice(existing, 1);
        }

        recent.unshift({
            ...track,
            playedAt: Date.now(),
        });

        // Keep only MAX_RECENT_TRACKS
        const trimmed = recent.slice(0, MAX_RECENT_TRACKS);
        await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.warn("Failed to save recently played:", error);
    }
}

/**
 * Clear recently played history
 */
export async function clearRecentlyPlayed(): Promise<void> {
    try {
        await AsyncStorage.removeItem(RECENTLY_PLAYED_KEY);
    } catch (error) {
        console.warn("Failed to clear recently played:", error);
    }
}

/**
 * Get player settings
 */
export async function getPlayerSettings(): Promise<PlayerSettings> {
    try {
        const json = await AsyncStorage.getItem(PLAYER_SETTINGS_KEY);
        if (!json) return defaultSettings;
        return { ...defaultSettings, ...JSON.parse(json) };
    } catch {
        return defaultSettings;
    }
}

/**
 * Save player settings
 */
export async function savePlayerSettings(settings: Partial<PlayerSettings>): Promise<void> {
    try {
        const current = await getPlayerSettings();
        const updated = { ...current, ...settings };
        await AsyncStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.warn("Failed to save player settings:", error);
    }
}
