import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { updatePassword, deleteAccount } from "@mi-dia/database";
import { useSessionStore } from "../../hooks/useSession";

function SectionTitle({ label }: { label: string }) {
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: "700",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      marginLeft: 4,
    }}>
      {label}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#6366f1",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 24,
    }}>
      {children}
    </View>
  );
}

function CardRow({
  icon, label, value, onPress, danger, last,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: pressed && onPress ? "#f8fafc" : "#ffffff",
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: "#f1f5f9",
      })}
    >
      <View style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: danger ? "#fef2f2" : "#f0f4ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}>
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: danger ? "#ef4444" : "#1e293b", fontWeight: "500" }}>
        {label}
      </Text>
      {value !== undefined && (
        <Text style={{ fontSize: 13, color: "#94a3b8", maxWidth: "45%", textAlign: "right" }} numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && value === undefined && (
        <Text style={{ fontSize: 20, color: "#cbd5e1", lineHeight: 24 }}>›</Text>
      )}
    </Pressable>
  );
}

export default function AccountScreen() {
  const session = useSessionStore((s) => s.session);
  const email = session?.user?.email ?? "—";
  const createdAt = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      Alert.alert("✓ Listo", "Tu contraseña fue actualizada.");
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsChangingPassword(false);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es permanente. Se borrarán todos tus datos y no podrás recuperarlos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            Alert.alert("¿Estás seguro?", "Confirma que deseas eliminar tu cuenta definitivamente.", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sí, eliminar", style: "destructive", onPress: () => void handleDeleteAccount() },
            ]),
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
      Alert.alert("Error", err instanceof Error ? err.message : "Error desconocido");
    }
  }

  if (isDeletingAccount) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ color: "#94a3b8", marginTop: 12, fontSize: 14 }}>Eliminando cuenta…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f8fafc" }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Avatar + info */}
        <View style={{ alignItems: "center", paddingTop: 32, paddingBottom: 28, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#ede9fe", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Image source={require("../../assets/icon.png")} style={{ width: 48, height: 48, borderRadius: 12 }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 2 }}>{email}</Text>
          {createdAt && (
            <Text style={{ fontSize: 12, color: "#94a3b8" }}>Miembro desde {createdAt}</Text>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>

          {/* Cuenta */}
          <SectionTitle label="Cuenta" />
          <Card>
            <CardRow icon="✉️" label="Email" value={email} last />
          </Card>

          {/* Seguridad */}
          <SectionTitle label="Seguridad" />
          <Card>
            <CardRow
              icon="🔑"
              label="Cambiar contraseña"
              onPress={() => setShowPasswordForm((v) => !v)}
              last={!showPasswordForm}
            />
            {showPasswordForm && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#fafafe" }}>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 12, marginBottom: 8, backgroundColor: "#ffffff" }}>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNew}
                    style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: "#1e293b" }}
                  />
                  <Pressable onPress={() => setShowNew(v => !v)} hitSlop={8}>
                    <Text style={{ fontSize: 16, color: "#94a3b8" }}>{showNew ? "🙈" : "👁"}</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, backgroundColor: "#ffffff" }}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirm}
                    style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: "#1e293b" }}
                  />
                  <Pressable onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                    <Text style={{ fontSize: 16, color: "#94a3b8" }}>{showConfirm ? "🙈" : "👁"}</Text>
                  </Pressable>
                </View>
                <TouchableOpacity
                  onPress={() => void handleChangePassword()}
                  disabled={isChangingPassword || !newPassword.trim()}
                  style={{
                    backgroundColor: newPassword.trim() ? "#4f46e5" : "#e2e8f0",
                    borderRadius: 12,
                    paddingVertical: 13,
                    alignItems: "center",
                  }}
                >
                  {isChangingPassword
                    ? <ActivityIndicator size="small" color="#ffffff" />
                    : <Text style={{ color: newPassword.trim() ? "#ffffff" : "#94a3b8", fontWeight: "600", fontSize: 14 }}>Actualizar contraseña</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Zona de peligro */}
          <SectionTitle label="Zona de peligro" />
          <Card>
            <CardRow icon="🗑️" label="Eliminar cuenta" onPress={confirmDeleteAccount} danger last />
          </Card>

          <Text style={{ fontSize: 11, color: "#cbd5e1", textAlign: "center", marginTop: 4 }}>
            🔒 Tu información está protegida
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
