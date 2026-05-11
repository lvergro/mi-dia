import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { sendPasswordResetEmail, updatePassword, deleteAccount } from "@mi-dia/database";
import { useAuth } from "../../hooks/useAuth";
import { useSessionStore } from "../../hooks/useSession";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" }}>
        {children}
      </View>
    </View>
  );
}

function Row({ label, value, onPress, danger }: { label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
      })}
    >
      <Text style={{ fontSize: 15, color: danger ? "#ef4444" : "#1f2937" }}>{label}</Text>
      {value !== undefined && (
        <Text style={{ fontSize: 14, color: "#9ca3af", maxWidth: "60%", textAlign: "right" }} numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && !value && (
        <Text style={{ fontSize: 18, color: "#d1d5db" }}>›</Text>
      )}
    </Pressable>
  );
}

export default function AccountScreen() {
  const session = useSessionStore((s) => s.session);
  const { signOut } = useAuth();
  const email = session?.user?.email ?? "—";

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  async function handleChangePassword() {
    const pwd = newPassword.trim();
    if (pwd.length < 6) {
      Alert.alert("Contraseña muy corta", "Debe tener al menos 6 caracteres.");
      return;
    }
    if (pwd !== confirmPassword.trim()) {
      Alert.alert("No coinciden", "Las contraseñas no son iguales.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await updatePassword(pwd);
      Alert.alert("Listo", "Tu contraseña fue actualizada.");
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      Alert.alert("Error", msg);
    } finally {
      setIsChangingPassword(false);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro? Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar mi cuenta",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmar eliminación",
              `Escribe tu email (${email}) para confirmar.`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Confirmar",
                  style: "destructive",
                  onPress: () => void handleDeleteAccount(),
                },
              ]
            );
          },
        },
      ]
    );
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      useSessionStore.getState().setSession(null);
    } catch (err) {
      setIsDeletingAccount(false);
      const msg = err instanceof Error ? err.message : "Error desconocido";
      Alert.alert("Error", msg);
    }
  }

  if (isDeletingAccount) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ color: "#9ca3af", marginTop: 12 }}>Eliminando cuenta…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">

        <Section title="Cuenta">
          <Row label="Email" value={email} />
        </Section>

        <Section title="Seguridad">
          <Row
            label="Cambiar contraseña"
            onPress={() => setShowPasswordForm((v) => !v)}
          />
          {showPasswordForm && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#111827",
                  backgroundColor: "#f9fafb",
                  marginBottom: 8,
                }}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#111827",
                  backgroundColor: "#f9fafb",
                  marginBottom: 12,
                }}
              />
              <Pressable
                onPress={() => void handleChangePassword()}
                disabled={isChangingPassword || !newPassword.trim()}
                style={({ pressed }) => ({
                  backgroundColor: newPassword.trim() ? "#4f46e5" : "#e5e7eb",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                {isChangingPassword
                  ? <ActivityIndicator size="small" color="#ffffff" />
                  : <Text style={{ color: newPassword.trim() ? "#ffffff" : "#9ca3af", fontWeight: "600", fontSize: 14 }}>Actualizar contraseña</Text>
                }
              </Pressable>
            </View>
          )}
        </Section>

        <Section title="Sesión">
          <Row label="Cerrar sesión" onPress={() => void signOut()} />
        </Section>

        <Section title="Zona de peligro">
          <Row label="Eliminar cuenta" onPress={confirmDeleteAccount} danger />
        </Section>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
