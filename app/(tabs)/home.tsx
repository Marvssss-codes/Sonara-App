// app/(tabs)/home.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { supa } from "../../lib/supabase";
import { getTrendingAll, getTrendingByGenre, AudiusTrack } from "../../lib/audius";
import { genresForGeneration, Generation } from "../../utils/genToGenres";
import CategoryChip from "../../components/CategoryChip";
import SongCard from "../../components/SongCard";
import PlaylistPill from "../../components/PlaylistPill";
import TopMenu from "../../components/TopMenu";

const CATS = ["All", "Hip-Hop/Rap", "Pop", "Electronic", "Rock", "R&B/Soul", "Jazz", "Blues"];

type Playlist = { id: string; name: string; cover_url: string | null };

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // UI
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState<string>("");
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Playlists
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  // Feed
  const [activeCat, setActiveCat] = useState("All");
  const [popular, setPopular] = useState<AudiusTrack[]>([]);
  const [catTracks, setCatTracks] = useState<AudiusTrack[]>([]);
  const [genTracks, setGenTracks] = useState<AudiusTrack[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Load profile + playlists
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
            (prof?.display_name && String(prof.display_name).trim()) || fallbackName
          );
          if (prof?.generation) setGeneration(prof.generation as Generation);

          // fetch playlists
          setLoadingPlaylists(true);
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

  // Load Audius feed sections
  useEffect(() => {
    let cancelled = false;
    setLoadingFeed(true);

    (async () => {
      try {
        const [popularList, catList, genList] = await Promise.all([
          getTrendingAll("week"),
          activeCat === "All" ? getTrendingAll("week") : getTrendingByGenre(activeCat, "week"),
          (async () => {
            const picks = generation ? genresForGeneration(generation) : ["Pop", "Electronic", "Hip-Hop/Rap"];
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
    <View style={{ flex: 1, backgroundColor: "#0B0E17", paddingTop: insets.top + 6 }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: "#B7BCD3" }}>{hello},</Text>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22 }}>
            {(displayName && displayName.trim()) ? displayName : "there"} ✨
          </Text>
        </View>

        {/* Top-right profile menu trigger */}
        <Pressable
          onPress={() => setMenuOpen(true)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Text style={{ color: "#fff" }}>👤</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* ===== Your Playlists (top preview) ===== */}
        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>Your Playlists</Text>
            <Link href="/library" style={{ color: "#C07CFF", fontWeight: "800" }}>See all</Link>
          </View>

          {loadingPlaylists ? (
            <Text style={{ color: "#B7BCD3" }}>Loading...</Text>
          ) : playlists.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
              {playlists.slice(0, 6).map((p) => (
                <PlaylistPill
                  key={p.id}
                  title={p.name}
                  image={p.cover_url}
                  onPress={() => router.push(`/playlist/${p.id}`)}
                />
              ))}
            </View>
          ) : (
            // Empty state with "Create playlist" tile
            <Pressable
              onPress={() => router.push("/library")}
              style={{
                height: 64,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Create your first playlist</Text>
              <Text style={{ color: "#B7BCD3", fontSize: 12, marginTop: 2 }}>Tap to open Library</Text>
            </Pressable>
          )}
        </View>

        {/* ===== Category chips ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}
        >
          {CATS.map((c) => (
            <CategoryChip key={c} label={c} active={c === activeCat} onPress={() => setActiveCat(c)} />
          ))}
        </ScrollView>

        {/* ===== Popular Songs ===== */}
        <Section title="Popular Songs" href="/search">
          <FlatList
            horizontal
            data={popular}
            keyExtractor={(t) => t.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
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
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
            renderItem={({ item }) => <SongCard track={item} />}
          />
        </Section>

        {/* ===== Category feed ===== */}
        <Section title={activeCat === "All" ? "Trending Now" : `${activeCat} Picks`}>
          <FlatList
            horizontal
            data={catTracks}
            keyExtractor={(t) => t.id + "-cat"}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
            renderItem={({ item }) => <SongCard track={item} />}
          />
        </Section>
      </ScrollView>

      {/* Top-right dropdown menu */}
      <TopMenu
  visible={menuOpen}
  onClose={() => setMenuOpen(false)}
  onProfile={() => {
    setMenuOpen(false);
    // explicitly target the Tabs group’s profile screen
    router.navigate("/(tabs)/profile");
  }}
  onSettings={() => { setMenuOpen(false); router.navigate("/settings"); }}
  onLogout={async () => { setMenuOpen(false); try { await supa.auth.signOut(); } catch {} router.replace("/login"); }}
/>
    </View>
  );
}

function Section({ title, href, children }: { title: string; href?: any; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 8, marginBottom: 12 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>{title}</Text>
        {href ? <Link href={href as any} style={{ color: "#C07CFF", fontWeight: "800" }}>See all</Link> : <View />}
      </View>
      {children}
    </View>
  );
}
