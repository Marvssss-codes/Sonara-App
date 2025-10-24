import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { trendingTracks, AudiusTrack } from "../../lib/audius";
import SongCard from "../../components/SongCard";
import { supa } from "../../lib/supabase";
import { addFavorite } from "../../lib/db";
import { theme } from "../../lib/theme";
import GlassCard from "../../components/GlassCard";

type ProfileRow = { generation?: string };

export default function Home() {
  const router = useRouter();

  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supa.auth.getUser();
        const uid = userData?.user?.id ?? null;
        setUserId(uid);

        if (uid) {
          const { data: prof } = await supa
            .from("profiles")
            .select("generation")
            .eq("id", uid)
            .single<ProfileRow>();
          if (prof?.generation) setGeneration(prof.generation);
        }

        const list = await trendingTracks(20);
        setTracks(list);
      } catch (e: any) {
        Alert.alert("Oops", e?.message ?? "Failed to load content");
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: theme.spacing.lg }}>
      <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "700" }}>
          {generation ? `${generation} Picks` : "For Your Generation"}
        </Text>
        <Text style={{ color: theme.colors.textSoft, marginTop: 4 }}>Trending Tracks</Text>
      </View>

      {/* Highlight card like in mock */}
      {tracks[0] && (
        <GlassCard style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: tracks[0].artwork_url || "" }}
              style={{ width: 64, height: 64, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface2 }}
            />
            <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
              <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: "700" }}>
                {tracks[0].title}
              </Text>
              <Text numberOfLines={1} style={{ color: theme.colors.textSoft }}>
                {tracks[0].user?.name || tracks[0].user?.handle || "Unknown artist"}
              </Text>
            </View>
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: theme.colors.primary,
                width: 44,
                height: 44,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>▶︎</Text>
            </Pressable>
          </View>
        </GlassCard>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const artist = item?.user?.name || item?.user?.handle || "Unknown artist";
          return (
            <View style={{ marginHorizontal: theme.spacing.md, marginBottom: 10, borderRadius: theme.radius.lg, overflow: "hidden" }}>
              <GlassCard style={{ padding: 0 }}>
                <SongCard
                  title={item?.title ?? "Untitled"}
                  artist={artist}
                  artwork={item?.artwork_url ?? ""}
                  onPress={() => {}}
                  onAdd={() => {
                    const qs = new URLSearchParams({
                      trackId: String(item.id),
                      title: item?.title ?? "",
                      artist,
                      artwork: item?.artwork_url ?? "",
                    }).toString();
                    router.push(`/playlist/select?${qs}`);
                  }}
                  onFavorite={async () => {
                    if (!userId) {
                      Alert.alert("Please log in", "You need to be signed in to favorite.");
                      return;
                    }
                    const { error } = await addFavorite(userId, {
                      id: String(item.id),
                      title: item?.title ?? "Untitled",
                      artist,
                      artwork_url: item?.artwork_url ?? "",
                    });
                    if (error) Alert.alert("Failed", error.message);
                    else Alert.alert("Saved", "Added to favorites.");
                  }}
                />
              </GlassCard>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      />
    </View>
  );
}
