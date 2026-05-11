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
import { Eye, EyeOff, Key, Mail, Shield, Trash2 } from "lucide-react-native";
import { updatePassword, deleteAccount } from "@mi-dia/database";
import { useSessionStore } from "../../hooks/useSession";
import { colors, radii, shadows, spacing } from "../../theme";

function SectionTitle({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: spacing.sm,
        marginLeft: 4,
      }}
    >
      {label}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        overflow: "hidden",
        marginBottom: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        ...shadows.card,
      }}
    >
      {children}
    </View>
  );
}

function CardRow({
  icon: Icon,
  label,
  subtitle,
  value,
  onPress,
  danger,
  last,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  subtitle?: string;
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
        paddingHorizontal: spacing.lg,
        paddingVertical: 14,
        backgroundColor: pressed && onPress ? colors.gray50 : colors.white,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.gray100,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radii.md,
          backgroundColor: danger ? colors.dangerSubtle : colors.primarySubtle,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon size={17} color={danger ? colors.danger : colors.primary} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: danger ? colors.danger : colors.textPrimary, fontWeight: "500" }}>
          {label}
        </Text>
        {subtitle !== undefined && (
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{subtitle}</Text>
        )}
      </View>
      {value !== undefined && (
        <Text style={{ fontSize: 13, color: colors.textMuted, maxWidth: "45%", textAlign: "right" }} numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && value === undefined && (
        <Text style={{ fontSize: 20, color: colors.gray300, lineHeight: 24 }}>›</Text>
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
      Alert.alert("Listo", "Tu contraseña fue actualizada.");
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.danger} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14 }}>Eliminando cuenta…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.surface }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={{ alignItems: "center", paddingTop: 28, paddingBottom: 24, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Image source={require("../../assets/icon.png")} style={{ width: 48, height: 48, borderRadius: 12 }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 }}>{email}</Text>
          {createdAt && (
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Miembro desde {createdAt}</Text>
          )}
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xxl }}>

          <SectionTitle label="Cuenta" />
          <Card>
            <CardRow icon={Mail} label="Email" subtitle={email} last />
          </Card>

          <SectionTitle label="Seguridad" />
          <Card>
            <CardRow
              icon={Key}
              label="Cambiar contraseña"
              subtitle="Actualiza tu acceso de forma segura"
              onPress={() => setShowPasswordForm((v) => !v)}
              last={!showPasswordForm}
            />
            {showPasswordForm && (
              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, backgroundColor: colors.gray50 }}>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, paddingHorizontal: 12, marginBottom: 8, backgroundColor: colors.white }}>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showNew}
                    style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary }}
                  />
                  <Pressable onPress={() => setShowNew(v => !v)} hitSlop={8}>
                    {showNew
                      ? <EyeOff size={18} color={colors.textMuted} strokeWidth={1.8} />
                      : <Eye size={18} color={colors.textMuted} strokeWidth={1.8} />
                    }
                  </Pressable>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, paddingHorizontal: 12, marginBottom: 12, backgroundColor: colors.white }}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirm}
                    style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary }}
                  />
                  <Pressable onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                    {showConfirm
                      ? <EyeOff size={18} color={colors.textMuted} strokeWidth={1.8} />
                      : <Eye size={18} color={colors.textMuted} strokeWidth={1.8} />
                    }
                  </Pressable>
                </View>
                <TouchableOpacity
                  onPress={() => void handleChangePassword()}
                  disabled={isChangingPassword || !newPassword.trim()}
                  style={{
                    backgroundColor: newPassword.trim() ? colors.primary : colors.gray200,
                    borderRadius: radii.md,
                    paddingVertical: 13,
                    alignItems: "center",
                  }}
                >
                  {isChangingPassword
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Text style={{ color: newPassword.trim() ? colors.white : colors.textMuted, fontWeight: "600", fontSize: 14 }}>Actualizar contraseña</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </Card>

          <SectionTitle label="Zona de peligro" />
          <Card>
            <CardRow icon={Trash2} label="Eliminar cuenta" subtitle="Esta acción es permanente" onPress={confirmDeleteAccount} danger last />
          </Card>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <Shield size={12} color={colors.textDisabled} strokeWidth={1.5} />
            <Text style={{ fontSize: 11, color: colors.textDisabled }}>Tu información está protegida</Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
