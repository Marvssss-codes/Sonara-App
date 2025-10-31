import { useEffect, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { usePlaylists } from "../components/PlaylistContext";
import { getRecentlyPlayed, RecentlyPlayedTrack } from "../lib/playerStorage";
import { usePlayer } from "../components/PlayerContext";
import type { PlaylistInfo, Track } from "../types/player";

const DEMO_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // mock URL for Expo Go

function resolveTrackById(id: string, title?: string, artist?: string, artworkUri?: string | null): Track {
  return {
    id,
    title: title || `Track ${id}`,
    artist: artist || "Unknown Artist",
    artworkUri: artworkUri || undefined,
    source: { uri: DEMO_AUDIO },
  };
}

export default function ProfileScreen() {
  const { playlists } = usePlaylists();
  const { playTrack, playPlaylist, setPlayerExpanded } = usePlayer();
  const [recent, setRecent] = useState<RecentlyPlayedTrack[]>([]);

  useEffect(() => {
    getRecentlyPlayed().then(setRecent).catch(() => setRecent([]));
  }, []);

  const onPlayPlaylist = async (id: string) => {
    const p = playlists.find((pl) => pl.id === id);
    if (!p || p.trackIds.length === 0) return;
    const info: PlaylistInfo = { id: p.id, name: p.name, trackIds: p.trackIds };
    const first = resolveTrackById(p.trackIds[0]);
    await playTrack(first, info, 0);
    setPlayerExpanded(true);
  };

  const onPlayRecent = async (t: RecentlyPlayedTrack) => {
    const full = resolveTrackById(t.id, t.title, t.artist ?? undefined, t.artwork ?? undefined);
    await playTrack(full);
    setPlayerExpanded(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      <FlatList
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>Your Playlists</Text>
          </View>
        }
        data={playlists}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPlayPlaylist(item.id)} style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1A1E2A" }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
            <Text style={{ color: "#A4A8B8", marginTop: 2 }}>{item.trackIds.length} tracks</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 12 }}>Recently Played</Text>
            {recent.length === 0 ? (
              <Text style={{ color: "#A4A8B8", marginTop: 8 }}>No recent plays yet.</Text>
            ) : null}
          </View>
        }
      />

      {/* Recently played list below */}
      <FlatList
        data={recent}
        keyExtractor={(t) => `${t.id}-${t.playedAt}`}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPlayRecent(item)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1A1E2A" }}>
            <Text style={{ color: "#fff" }}>{item.title}</Text>
            <Text style={{ color: "#A4A8B8", marginTop: 2 }}>{item.artist || "Unknown Artist"}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}


