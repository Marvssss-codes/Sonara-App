// app/(tabs)/home.tsx
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { supa } from "../../lib/supabase";
import {
  getTrendingAll,
  getTrendingByGenre,
  AudiusTrack,
} from "../../lib/audius";
import { genresForGeneration, Generation } from "../../utils/genToGenres";
import CategoryChip from "../../components/CategoryChip";
import SongCard from "../../components/SongCard";
import PlaylistPill from "../../components/PlaylistPill";
import TopMenu from "../../components/TopMenu";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

const CATS = [
  "All",
  "Hip-Hop/Rap",
  "Pop",
  "Electronic",
  "Rock",
  "R&B/Soul",
  "Jazz",
  "Blues",
];

type Playlist = { id: string; name: string; cover_url: string | null };

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [activeCat, setActiveCat] = useState("All");
  const [popular, setPopular] = useState<AudiusTrack[]>([]);
  const [catTracks, setCatTracks] = useState<AudiusTrack[]>([]);
  const [genTracks, setGenTracks] = useState<AudiusTrack[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Animated header fade-in
  const fadeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load profile & playlists
  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supa.auth.getSession();
        const uid = sessionData.session?.user?.id || null;
        setUserId(uid);

        const { data: userData } = await supa.auth.getUser();
        const authUser = userData.user;

        if (uid) {
          const { data: prof } = await supa
            .from("profiles")
            .select("display_name,generation")
            .eq("id", uid)
            .single();

          const fallbackName =
            (authUser?.user_metadata?.full_name as string) ||
            (authUser?.user_metadata?.name as string) ||
            (authUser?.email ? authUser.email.split("@")[0] : "") ||
            "";

          setDisplayName(
            (prof?.display_name && String(prof.display_name).trim()) ||
              fallbackName
          );
          if (prof?.generation) setGeneration(prof.generation as Generation);

          const { data: pls } = await supa
            .from("playlists")
            .select("id,name,cover_url")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });
          setPlaylists((pls as Playlist[]) || []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPlaylists(false);
      }
    })();
  }, []);

  // Load feed
  useEffect(() => {
    let cancelled = false;
    setLoadingFeed(true);

    (async () => {
      try {
        const [popularList, catList, genList] = await Promise.all([
          getTrendingAll("week"),
          activeCat === "All"
            ? getTrendingAll("week")
            : getTrendingByGenre(activeCat, "week"),
          (async () => {
            const picks = generation
              ? genresForGeneration(generation)
              : ["Pop", "Electronic", "Hip-Hop/Rap"];
            for (const g of picks) {
              try {
                const res = await getTrendingByGenre(g, "week");
                if (res?.length) return res;
              } catch {}
            }
            return [];
          })(),
        ]);

        if (!cancelled) {
          setPopular((popularList || []).slice(0, 12));
          setCatTracks((catList || []).slice(0, 12));
          setGenTracks((genList || []).slice(0, 12));
        }
      } catch {
        if (!cancelled) {
          setPopular([]);
          setCatTracks([]);
          setGenTracks([]);
        }
      } finally {
        if (!cancelled) setLoadingFeed(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeCat, generation]);

  const hello = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <LinearGradient colors={["#0B0E17", "#0A0016", "#000"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: insets.top + 40 }}
      >
        {/* Header Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            paddingHorizontal: 20,
            marginBottom: 25,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ color: "#B7BCD3", fontSize: 15 }}>{hello},</Text>

            <MaskedView
              maskElement={
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "900",
                    color: "white",
                  }}
                >
                  {(displayName && displayName.trim()) ? displayName : "there"} ✨
                </Text>
              }
            >
              <LinearGradient
                colors={["#C07CFF", "#9b5de5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "900",
                    opacity: 0, // mask reveals gradient
                  }}
                >
                  {(displayName && displayName.trim()) ? displayName : "there"} ✨
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>

          <Pressable
            onPress={() => setMenuOpen(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>👤</Text>
          </Pressable>
        </Animated.View>

        {/* ===== Your Playlists ===== */}
        <Section title="Your Playlists" href="/library">
          {loadingPlaylists ? (
            <Text style={{ color: "#aaa", paddingHorizontal: 20 }}>Loading...</Text>
          ) : playlists.length ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: 12,
                paddingHorizontal: 20,
              }}
            >
              {playlists.slice(0, 6).map((p) => (
                <PlaylistPill
                  key={p.id}
                  title={p.name}
                  image={p.cover_url}
                  onPress={() =>
                    router.push({ pathname: "/playlist/[id]", params: { id: p.id } })
                  }
                />
              ))}
            </View>
          ) : (
            <Pressable
              onPress={() => router.push("/library")}
              style={{
                height: 70,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.06)",
                alignItems: "center",
                justifyContent: "center",
                marginHorizontal: 20,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Create your first playlist</Text>
              <Text style={{ color: "#B7BCD3", fontSize: 12, marginTop: 2 }}>
                Tap to open Library
              </Text>
            </Pressable>
          )}
        </Section>

        {/* ===== Categories ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 10 }}
        >
          {CATS.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={c === activeCat}
              onPress={() => setActiveCat(c)}
            />
          ))}
        </ScrollView>

        {/* ===== Popular Songs ===== */}
        <Section title="Popular Songs" href="/search">
          <FlatList
            horizontal
            data={popular}
            keyExtractor={(t) => t.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            renderItem={({ item }) => <SongCard track={item} />}
          />
        </Section>

        {/* ===== For Your Generation ===== */}
        <Section title={generation ? `For ${generation}` : "For You"}>
          <FlatList
            horizontal
            data={genTracks}
            keyExtractor={(t) => t.id + "-gen"}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            renderItem={({ item }) => <SongCard track={item} />}
          />
        </Section>

        {/* ===== Category Picks ===== */}
        <Section title={activeCat === "All" ? "Trending Now" : `${activeCat} Picks`}>
          <FlatList
            horizontal
            data={catTracks}
            keyExtractor={(t) => t.id + "-cat"}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            renderItem={({ item }) => <SongCard track={item} />}
          />
        </Section>
      </ScrollView>

      {/* Top Menu */}
      <TopMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onProfile={() => {
          setMenuOpen(false);
          router.navigate("/(tabs)/profile");
        }}
        onSettings={() => {
          setMenuOpen(false);
          router.navigate("/settings");
        }}
        onLogout={async () => {
          setMenuOpen(false);
          try {
            await supa.auth.signOut();
          } catch {}
          router.replace("/login");
        }}
      />
    </LinearGradient>
  );
}

// Reusable Section Component
function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: any;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 16, marginBottom: 20 }}>
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>{title}</Text>
        {href ? (
          <Link href={href as any} style={{ color: "#C07CFF", fontWeight: "800" }}>
            See all
          </Link>
        ) : (
          <View />
        )}
      </View>
      {children}
    </View>
  );
}
