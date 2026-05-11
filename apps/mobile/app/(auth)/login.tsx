import { useState } from "react";
import {
  Alert,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { signIn, signUp, sendPasswordResetEmail } from "@mi-dia/database";
import { useSessionStore } from "../../hooks/useSession";
import { useAuth } from "../../hooks/useAuth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, loading: googleLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const isAnyLoading = loading || googleLoading;
  const emailTrimmed = email.trim();
  const isValid = isValidEmail(emailTrimmed) && password.length >= 6;

  async function handleSignIn() {
    if (!isValid || isAnyLoading) return;
    setLoading(true);
    try {
      const session = await signIn(emailTrimmed, password);
      useSessionStore.getState().setSession(session);
      router.replace("/(tabs)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("Error al ingresar", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!isValid || isAnyLoading) return;
    setLoading(true);
    try {
      const session = await signUp(emailTrimmed, password);
      if (session) {
        useSessionStore.getState().setSession(session);
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Confirma tu email",
          "Te enviamos un link de confirmación. Revisa tu bandeja de entrada y luego ingresa."
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("Error al registrarse", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!isValidEmail(emailTrimmed)) {
      Alert.alert("Email requerido", "Ingresa tu email para recuperar tu contraseña.");
      return;
    }
    try {
      await sendPasswordResetEmail(emailTrimmed);
      Alert.alert("Revisa tu email", `Enviamos un enlace de recuperación a ${emailTrimmed}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("Error", msg);
    }
  }

  const isLogin = mode === "login";

  return (
    <LinearGradient
      colors={["#e8f4ff", "#f0ebff", "#ffffff"]}
      locations={[0, 0.5, 1]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + nombre */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Image
              source={require("../../assets/logo-transparent.png")}
              style={{ width: 110, height: 110, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 30, fontWeight: "700", color: "#4f46e5", letterSpacing: -0.5 }}>
              Trazadía
            </Text>
            <Text style={{ fontSize: 13, color: "#8b93a5", marginTop: 4 }}>
              Tu bienestar, un día a la vez
            </Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: 24,
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
          }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginBottom: 4 }}>
              {isLogin ? "¡Bienvenido de nuevo!" : "Crea tu cuenta"}
            </Text>
            <Text style={{ fontSize: 13, color: "#8b93a5", marginBottom: 20 }}>
              {isLogin ? "Inicia sesión para continuar" : "Regístrate para empezar"}
            </Text>

            {/* Email input */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#e8eaf0",
              borderRadius: 14,
              paddingHorizontal: 14,
              marginBottom: 12,
              backgroundColor: "#fafafe",
            }}>
              <Text style={{ fontSize: 16, marginRight: 10, color: "#8b93a5" }}>✉</Text>
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: "#1a1a2e" }}
                placeholder="Email"
                placeholderTextColor="#b0b8c8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!isAnyLoading}
              />
            </View>

            {/* Password input */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#e8eaf0",
              borderRadius: 14,
              paddingHorizontal: 14,
              marginBottom: 8,
              backgroundColor: "#fafafe",
            }}>
              <Text style={{ fontSize: 16, marginRight: 10, color: "#8b93a5" }}>🔒</Text>
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: "#1a1a2e" }}
                placeholder="Contraseña"
                placeholderTextColor="#b0b8c8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isAnyLoading}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Text style={{ fontSize: 16, color: "#8b93a5" }}>{showPassword ? "🙈" : "👁"}</Text>
              </Pressable>
            </View>

            {/* Forgot password */}
            {isLogin && (
              <TouchableOpacity onPress={() => void handleForgotPassword()} style={{ alignSelf: "flex-end", marginBottom: 20 }}>
                <Text style={{ fontSize: 12, color: "#4f46e5", fontWeight: "500" }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            )}

            {!isLogin && <View style={{ height: 20 }} />}

            {/* Primary button */}
            <TouchableOpacity
              onPress={() => void (isLogin ? handleSignIn() : handleSignUp())}
              disabled={!isValid || isAnyLoading}
              style={{ borderRadius: 14, overflow: "hidden", marginBottom: 16 }}
            >
              <LinearGradient
                colors={isValid && !isAnyLoading ? ["#6366f1", "#4f46e5"] : ["#d1d5db", "#d1d5db"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: "center" }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: isValid && !isAnyLoading ? "#fff" : "#9ca3af", fontWeight: "700", fontSize: 16 }}>
                    {isLogin ? "Ingresar" : "Crear cuenta"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Separador */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "#e8eaf0" }} />
              <Text style={{ marginHorizontal: 12, fontSize: 12, color: "#b0b8c8" }}>o</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#e8eaf0" }} />
            </View>

            {/* Botón Google */}
            <TouchableOpacity
              onPress={() => void signInWithGoogle()}
              disabled={isAnyLoading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                borderWidth: 1.5,
                borderColor: "#e8eaf0",
                borderRadius: 14,
                paddingVertical: 14,
                opacity: isAnyLoading ? 0.6 : 1,
                marginBottom: 20,
              }}
            >
              {googleLoading ? (
                <ActivityIndicator color="#4285F4" />
              ) : (
                <>
                  <Text style={{ fontSize: 18, marginRight: 10 }}>
                    <Text style={{ color: "#4285F4" }}>G</Text>
                    <Text style={{ color: "#EA4335" }}>o</Text>
                    <Text style={{ color: "#FBBC05" }}>o</Text>
                    <Text style={{ color: "#4285F4" }}>g</Text>
                    <Text style={{ color: "#34A853" }}>l</Text>
                    <Text style={{ color: "#EA4335" }}>e</Text>
                  </Text>
                  <Text style={{ fontSize: 15, color: "#3c4043", fontWeight: "500" }}>
                    Continuar con Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Switch mode */}
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#8b93a5" }}>
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              </Text>
              <TouchableOpacity onPress={() => setMode(isLogin ? "register" : "login")} style={{ marginLeft: 4 }}>
                <Text style={{ fontSize: 13, color: "#4f46e5", fontWeight: "600" }}>
                  {isLogin ? "Crear cuenta" : "Ingresar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 24 }}>
            <Text style={{ fontSize: 11, color: "#b0b8c8" }}>🔒</Text>
            <Text style={{ fontSize: 11, color: "#b0b8c8", marginLeft: 4 }}>
              Tu información está segura con nosotros
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
