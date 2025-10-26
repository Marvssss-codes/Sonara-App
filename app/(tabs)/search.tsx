// app/(tabs)/search.tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { searchTracks, AudiusTrack } from "../../lib/audius";
import {
  getMyPlaylists,
  addItemToPlaylist,
  createPlaylist,
  Playlist,
} from "../../lib/db.playlists";

const BG = "#0B0E17";
const CARD = "rgba(255,255,255,0.06)";
const STROKE = "rgba(255,255,255,0.12)";
const SUBTLE = "#A4A8B8";
const ACCENT = "#8E59FF";
const ACCENT_2 = "#C07CFF";

const CATEGORIES = ["New Music", "Top", "Podcasts", "Free", "Artists", "Genres"];

export default function Search() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [workingQ, setWorkingQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AudiusTrack[]>([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<AudiusTrack | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeCat, setActiveCat] = useState("New Music");

  const [topSearched, setTopSearched] = useState<AudiusTrack[]>([]);
  const [hotTrending, setHotTrending] = useState<AudiusTrack[]>([]);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => setPlaylists(await getMyPlaylists()))();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const seeds = ["afrobeats", "burna boy", "lofi", "edm", "hip hop"];
        const r = await searchTracks(seeds[Math.floor(Math.random() * seeds.length)], 12);
        setTopSearched(r.slice(0, 8));

        const res = await fetch(
          "https://discoveryprovider.audius.co/v1/tracks/trending?limit=12&app_name=sonara"
        );
        const json = await res.json();
        const items: AudiusTrack[] = (json?.data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          artwork:
            t.artwork?.["150x150"] ||
            t.artwork?.["480x480"] ||
            t.artwork?.["1000x1000"] ||
            null,
          duration: t.duration,
          user: { name: t.user?.name || t.user?.handle || "Unknown", id: t.user?.id },
        }));
        setHotTrending(items.slice(0, 12));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const term = q.trim();
      setWorkingQ(term);
      if (!term) return setResults([]);
      try {
        setLoading(true);
        setResults(await searchTracks(term, 40));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q]);

  const openPicker = (track: AudiusTrack) => {
    setSelectedTrack(track);
    setPickerOpen(true);
    Keyboard.dismiss();
  };

  const addTo = async (playlistId: string) => {
    if (!selectedTrack) return;
    try {
      await addItemToPlaylist(playlistId, {
        track_id: selectedTrack.id,
        title: selectedTrack.title,
        artist: selectedTrack.user?.name || "Unknown",
        artwork_url:
          typeof selectedTrack.artwork === "string"
            ? selectedTrack.artwork
            : selectedTrack.artwork?.["150x150"] ||
              selectedTrack.artwork?.["480x480"] ||
              selectedTrack.artwork?.["1000x1000"] ||
              null,
        duration: selectedTrack.duration || null,
      });
      setPickerOpen(false);
      setSelectedTrack(null);
      Alert.alert("Added", "Song added to playlist.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not add to playlist.");
    }
  };

  const quickCreate = async () => {
    if (!newName.trim()) return;
    try {
      setCreating(true);
      const p = await createPlaylist(newName.trim());
      setPlaylists(await getMyPlaylists());
      setNewName("");
      setCreating(false);
      if (selectedTrack) await addTo(p.id);
    } catch (e: any) {
      setCreating(false);
      Alert.alert("Error", e?.message ?? "Could not create playlist.");
    }
  };

  const renderRow = (item: AudiusTrack) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingRight: 8,
      }}
    >
        <Image
        source={{
          uri:
            typeof item.artwork === "string"
              ? item.artwork
              : "https://placehold.co/80x80/161821/F7F7F7?text=%E2%99%AB",
        }}
        style={{ width: 48, height: 48, borderRadius: 10 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: SUBTLE, fontSize: 12 }} numberOfLines={1}>
          {item.user?.name || "Unknown"}
        </Text>
      </View>

      <Pressable
        onPress={() => Alert.alert("Coming soon", "More options will be here.")}
        style={{ padding: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={16} color="#9EA3B5" />
      </Pressable>

      {/* Add button in Sonara accent */}
      <Pressable onPress={() => openPicker(item)} style={{ padding: 6, marginLeft: 2 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            backgroundColor: ACCENT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 12 }}>
          Search
        </Text>

        {/* Search bar + icons */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#151823",
              borderRadius: 18,
              paddingHorizontal: 14,
              height: 44,
              borderWidth: 1,
              borderColor: STROKE,
            }}
          >
            <Ionicons name="search" size={18} color="#8b8ea3" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search Music"
              placeholderTextColor="#8b8ea3"
              style={{ flex: 1, color: "#fff", marginLeft: 8 }}
              returnKeyType="search"
              onSubmitEditing={() => setQ(q)}
            />
            <Pressable onPress={() => Alert.alert("Voice search", "Coming soon!")}>
              <Ionicons name="mic-outline" size={18} color="#8b8ea3" />
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", marginLeft: 10 }}>
            <Pill text="FREE" />
            <Circle icon="notifications-outline" onPress={() => Alert.alert("Coming soon")} />
            <Circle icon="settings-outline" onPress={() => router.push("/settings")} />
          </View>
        </View>

        {/* Category chips (purple accent) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6, gap: 10 }}
        >
          {CATEGORIES.map((c) => {
            const active = activeCat === c;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCat(c)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: active ? ACCENT : "transparent",
                  borderWidth: 1,
                  borderColor: active ? ACCENT : STROKE,
                }}
              >
                <Text style={{ color: active ? "#fff" : "#EDEFF6", fontWeight: "900" }}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Body */}
      {loading ? (
        <Center>
          <ActivityIndicator />
          <Text style={{ color: SUBTLE, marginTop: 8 }}>Searching…</Text>
        </Center>
      ) : workingQ ? (
        <FlatList
          data={results}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <Text
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Results for “{workingQ}”
            </Text>
          }
          renderItem={({ item }) => renderRow(item)}
        />
      ) : (
        <FlatList
          data={topSearched}
          keyExtractor={(t, i) => t.id + i}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={<SectionHeader title="Top Searched Songs" action="See All" />}
          renderItem={({ item }) => renderRow(item)}
          ListFooterComponent={
            <>
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  fontSize: 16,
                  marginTop: 18,
                  marginBottom: 10,
                }}
              >
                Hot & Trending
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {hotTrending.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => openPicker(t)}
                    style={{
                      width: 180,
                      borderRadius: 14,
                      overflow: "hidden",
                      backgroundColor: CARD,
                      borderWidth: 1,
                      borderColor: STROKE,
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          typeof t.artwork === "string"
                            ? t.artwork
                            : "https://placehold.co/320x200/161821/F7F7F7?text=%E2%99%AB",
                      }}
                      style={{ width: 180, height: 110 }}
                    />
                    <View style={{ padding: 10 }}>
                      <Text style={{ color: "#fff", fontWeight: "800" }} numberOfLines={1}>
                        {t.title}
                      </Text>
                      <Text style={{ color: SUBTLE, fontSize: 12 }} numberOfLines={1}>
                        {t.user?.name || "Unknown"}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          }
        />
      )}

      {/* Add to playlist modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setPickerOpen(false)}
        />
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: "18%",
            backgroundColor: "#151827",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 10 }}>
            Add to playlist
          </Text>

          {playlists.length === 0 ? (
            <Text style={{ color: SUBTLE, marginBottom: 10 }}>
              You have no playlists yet. Create one below.
            </Text>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(p) => p.id}
              style={{ maxHeight: 240 }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => addTo(item.id)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: CARD,
                    borderWidth: 1,
                    borderColor: STROKE,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>{item.name}</Text>
                </Pressable>
              )}
            />
          )}

          {/* Quick create */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="New playlist name"
              placeholderTextColor="#778"
              style={{
                flex: 1,
                backgroundColor: CARD,
                color: "#fff",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: STROKE,
              }}
            />
            <Pressable
              onPress={quickCreate}
              disabled={creating || !newName.trim()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor:
                  creating || !newName.trim() ? "rgba(255,255,255,0.1)" : ACCENT,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                {creating ? "…" : "Create"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setPickerOpen(false)}
            style={{ alignSelf: "flex-end", marginTop: 12 }}
          >
            <Text style={{ color: SUBTLE }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

/* UI helpers (Sonara colors) */
function Pill({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: ACCENT,
        paddingHorizontal: 10,
        height: 30,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{text}</Text>
    </View>
  );
}
function Circle({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: STROKE,
        marginRight: 8,
      }}
    >
      <Ionicons name={icon} size={18} color="#fff" />
    </Pressable>
  );
}
function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>{title}</Text>
      {action ? <Text style={{ color: ACCENT, fontWeight: "900" }}>{action}</Text> : null}
    </View>
  );
}
function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>{children}</View>;
}
