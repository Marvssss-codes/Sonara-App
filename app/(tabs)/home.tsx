// app/(tabs)/home.tsx
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState<string>(""); // no "there" default; we’ll fallback at render
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Feed state
  const [activeCat, setActiveCat] = useState("All");
  const [popular, setPopular] = useState<AudiusTrack[]>([]);
  const [catTracks, setCatTracks] = useState<AudiusTrack[]>([]);
  const [genTracks, setGenTracks] = useState<AudiusTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Load profile + playlists (name fallback to auth user)
useEffect(() => {
  (async () => {
    try {
      const { data: sessionData } = await supa.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) return;

      // get auth user for fallback name
      const { data: userData } = await supa.auth.getUser();
      const authUser = userData.user;

      // fetch profile row
      const { data: prof } = await supa
        .from("profiles")
        .select("display_name,generation")
        .eq("id", uid)
        .single();

      // derive a friendly name
      const fallbackName =
        (authUser?.user_metadata?.full_name as string) ||
        (authUser?.user_metadata?.name as string) ||
        (authUser?.email ? authUser.email.split("@")[0] : "") ||
        "";

      setDisplayName(
        (prof?.display_name && String(prof.display_name).trim()) || fallbackName
      );

      if (prof?.generation) setGeneration(prof.generation as Generation);

      // playlists
      const { data: pls } = await supa
        .from("playlists")
        .select("id,name,cover_url")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (pls) setPlaylists(pls as Playlist[]);
    } catch {
      // keep UI working even if something fails
    }
  })();
}, []);

  // Load Audius sections
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
              } catch {
                // try next genre
              }
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
        // keep UI, just empty lists
      } finally {
        if (!cancelled) setLoading(false);
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
        {/* Your Playlists (top preview) */}
        {playlists?.length ? (
          <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>Your Playlists</Text>
              <Link href="/library" style={{ color: "#C07CFF", fontWeight: "800" }}>See all</Link>
            </View>

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
          </View>
        ) : null}

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}
        >
          {CATS.map((c) => (
            <CategoryChip key={c} label={c} active={c === activeCat} onPress={() => setActiveCat(c)} />
          ))}
        </ScrollView>

        {/* Popular Songs */}
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

        {/* For Your Generation */}
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

        {/* Category feed */}
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
  onProfile={() => { setMenuOpen(false); router.push("/profile"); }}   // ✅ matches bottom tab
  onSettings={() => { setMenuOpen(false); router.push("/settings"); }}
  onLogout={async () => {
    setMenuOpen(false);
    try { await supa.auth.signOut(); } catch {}
    router.replace("/login");
  }}
/>
    </View>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 8, marginBottom: 12 }}>
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 8,
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
