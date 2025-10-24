import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { trendingTracks, AudiusTrack } from "../../lib/audius";
import SongCard from "../../components/SongCard";
import { supa } from "../../lib/supabase";
import { addFavorite } from "../../lib/db";

type ProfileRow = { generation?: string };

export default function Home() {
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        // session/user
        const { data: userData, error: userErr } = await supa.auth.getUser();
        if (userErr) {
          console.log("auth.getUser error:", userErr.message);
        }
        const uid = userData?.user?.id ?? null;
        setUserId(uid);

        // profile (generation)
        if (uid) {
          const { data: prof, error: profErr } = await supa
            .from("profiles")
            .select("generation")
            .eq("id", uid)
            .single<ProfileRow>();
          if (!profErr && prof?.generation) {
            setGeneration(prof.generation);
          }
        }

        // trending
        const list = await trendingTracks(20);
        setTracks(list);
      } catch (e: any) {
        console.log("Home init error:", e?.message);
        Alert.alert("Oops", e?.message ?? "Failed to load content");
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingTop: 32 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>
          {generation ? `${generation} picks` : "For your generation"}
        </Text>
        <Text style={{ color: "#666" }}>Trending on Sonara</Text>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const artist =
            item?.user?.name || item?.user?.handle || "Unknown artist";
          return (
            <SongCard
              title={item?.title ?? "Untitled"}
              artist={artist}
              artwork={item?.artwork_url ?? ""}
              onPress={() => {
                // player comes later
              }}
              onFavorite={async () => {
                try {
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
                } catch (e: any) {
                  Alert.alert("Failed", e?.message ?? "Could not save favorite");
                }
              }}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#666", marginTop: 24 }}>
            No tracks yet. Pull to refresh or try again later.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
