import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { supa } from "../../lib/supabase";

function CTA({ title, onPress, disabled=false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <View style={{ borderRadius: 999, overflow: "hidden" }}>
      <LinearGradient colors={["#8E59FF", "#C07CFF"]} start={{x:0,y:0.5}} end={{x:1,y:0.5}}
        style={{ paddingVertical: 16, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color:"#fff", fontWeight:"800" }}>{disabled ? "..." : title}</Text>
      </LinearGradient>
    </View>
  );
}

import { Text, Alert } from "react-native";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false);

  async function handleReset() {
    if (!email) return Alert.alert("Missing email", "Please enter your account email.");
    setBusy(true);
    const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo: "sonara://reset" });
    setBusy(false);
    if (error) return Alert.alert("Failed", error.message);
    Alert.alert("Email sent", "Check your inbox to reset your password.");
  }

  return (
    <View style={{ flex:1, backgroundColor:"#0B0E17" }}>
      <AuthHeader title="Forgot Password" subtitle="We’ll email you a reset link" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28 }}>
          <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <View style={{ marginTop: 16 }}>
            <CTA title={busy ? "Sending..." : "Send reset link"} onPress={handleReset} disabled={busy} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
