import { Modal, Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TopMenu({
  visible,
  onClose,
  onProfile,
  onSettings,
  onLogout,
}: {
  visible: boolean;
  onClose: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* backdrop */}
      <Pressable style={{ flex:1, backgroundColor:"rgba(0,0,0,0.3)" }} onPress={onClose} />
      {/* menu panel */}
      <View style={{
        position:"absolute", top: 70, right: 12, width: 200,
        backgroundColor:"#12182A", borderRadius:14, borderWidth:1, borderColor:"rgba(255,255,255,0.12)",
        overflow:"hidden"
      }}>
        <MenuItem icon="person-circle" label="Profile" onPress={onProfile} />
        <Divider />
        <MenuItem icon="settings" label="Settings" onPress={onSettings} />
        <Divider />
        <MenuItem icon="log-out" label="Logout" onPress={onLogout} danger />
      </View>
    </Modal>
  );
}

function MenuItem({ icon, label, onPress, danger=false }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical:12, paddingHorizontal:14, flexDirection:"row", alignItems:"center", gap:10 }}>
      <Ionicons name={icon} size={18} color={danger ? "#FF7B93" : "#FFFFFF"} />
      <Text style={{ color: danger ? "#FF7B93" : "#FFFFFF", fontWeight:"700" }}>{label}</Text>
    </Pressable>
  );
}
function Divider() {
  return <View style={{ height:1, backgroundColor:"rgba(255,255,255,0.1)" }} />;
}
