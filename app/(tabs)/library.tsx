import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { supa } from "../../lib/supabase";
import { listFavorites } from "../../lib/db";
import SongCard from "../../components/SongCard";

type Fav = {
  user_id: string;
  track_id: string;
  title: string;
  artist: string | null;
  artwork_url: string | null;
  created_at: string;
};

export default function Library() {
  const [favorites, setFavorites] = useState<Fav[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;

      const { data: favs, error } = await listFavorites(uid);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      setFavorites((favs as Fav[]) || []);
    })();
  }, []);

  return (
    <View style={{ flex:1, paddingTop:32 }}>
      <Text style={{ fontSize:20, fontWeight:"700", padding:16 }}>Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(it) => it.track_id}
        renderItem={({ item }) => (
          <SongCard
            title={item.title}
            artist={item.artist || "Unknown"}
            artwork={item.artwork_url || undefined}
            onPress={() => {}}
            onFavorite={() => {}}
          />
        )}
      />
    </View>
  );
}
