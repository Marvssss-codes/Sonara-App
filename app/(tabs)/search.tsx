import { useState } from "react";
import { View, TextInput, FlatList, Alert, Text } from "react-native";
import { searchTracks, AudiusTrack } from "../../lib/audius";
import SongCard from "../../components/SongCard";
import { supa } from "../../lib/supabase";
import { addFavorite } from "../../lib/db";

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AudiusTrack[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  async function doSearch() {
    try {
      const { data } = await supa.auth.getUser();
      setUserId(data.user?.id || null);

      const list = await searchTracks(q, 25);
      setResults(list);
    } catch (e: any) {
      Alert.alert("Search error", e?.message ?? "Failed to search");
    }
  }

  return (
    <View style={{ flex:1, paddingTop:32 }}>
      <View style={{ padding:16 }}>
        <TextInput
          placeholder="Search songs or artists"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={doSearch}
          style={{ borderWidth:1, borderRadius:12, paddingHorizontal:12, paddingVertical:10 }}
        />
      </View>

      {results.length === 0 ? (
        <Text style={{ textAlign:"center", color:"#666" }}>Try a search…</Text>
      ) : (
        <FlatList
          data={results}
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
      )}
    </View>
  );
}
