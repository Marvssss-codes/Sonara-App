import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import GradientButton from "../../components/GradientButton";
import Divider from "../../components/Divider";
import SocialButton from "../../components/SocialButton";
import { Link } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    if (!email) return Alert.alert("Missing email", "Please enter your account email.");
    try {
      setBusy(true);
      const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo: "sonara://reset" });
      setBusy(false);
      if (error) return Alert.alert("Failed", error.message);
      Alert.alert("Email sent", "Check your inbox to reset your password.");
    } catch (e: any) {
      setBusy(false);
      Alert.alert("Error", e?.message ?? "Could not send reset email.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      <AuthHeader title="Forgot Password" subtitle="We’ll email you a reset link" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: 32 }}>
          <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

          <GradientButton title={busy ? "Sending..." : "Send reset link"} onPress={handleReset} style={{ marginTop: 16 }} />

          <Divider text="OR" />

          <View style={{ gap: 10 }}>
            <SocialButton kind="google" onPress={() => {}} />
            <SocialButton kind="apple" onPress={() => {}} />
          </View>

          <View style={{ alignItems: "center", marginTop: 18 }}>
            <Text style={{ color: "#B7BCD3" }}>
              Remembered your password?{" "}
              <Link href="/login"><Text style={{ color: "#C07CFF", fontWeight: "800" }}>Back to Login</Text></Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
