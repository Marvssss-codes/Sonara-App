import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { trendingTracks, AudiusTrack } from "../../lib/audius";
import SongCard from "../../components/SongCard";
import { supa } from "../../lib/supabase";
import { addFavorite } from "../../lib/db";

export default function Home() {
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getUser();
      const uid = data.user?.id || null;
      setUserId(uid);

      if (uid) {
        const { data: prof, error } = await supa.from("profiles").select("generation").eq("id", uid).single();
        if (!error && prof?.generation) setGeneration(prof.generation);
      }

      try {
        const list = await trendingTracks(20);
        setTracks(list);
      } catch (e: any) {
        Alert.alert("Audius error", e?.message ?? "Failed to load trending");
      }
    })();
  }, []);

  return (
    <View style={{ flex:1 }}>
      <View style={{ padding:16, paddingTop:32 }}>
        <Text style={{ fontSize:20, fontWeight:"700" }}>
          {generation ? `${generation} picks` : "For your generation"}
        </Text>
        <Text style={{ color:"#666" }}>Trending on Sonara</Text>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard
            title={item.title}
            artist={item.user?.name || item.user?.handle || "Unknown"}
            artwork={item.artwork_url}
            onPress={() => {}}
            onFavorite={async () => {
              if (!userId) {
                Alert.alert("Please log in", "You need to be signed in to favorite.");
                return;
              }
              const { error } = await addFavorite(userId, {
                id: item.id,
                title: item.title,
                artist: item.user?.name || item.user?.handle || "",
                artwork_url: item.artwork_url || "",
              });
              if (error) Alert.alert("Failed", error.message);
              else Alert.alert("Saved", "Added to favorites.");
            }}
          />
        )}
      />
    </View>
  );
}
