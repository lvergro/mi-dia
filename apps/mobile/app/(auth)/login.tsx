import { useState } from "react";
import { Alert, Image, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { signIn, signUp } from "@mi-dia/database";
import { useSessionStore } from "../../hooks/useSession";
import { useAuth } from "../../hooks/useAuth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, marginRight: 10 }}>
      <Text style={{ fontSize: 16, lineHeight: 20 }}>G</Text>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, loading: googleLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <View className="flex-1 bg-surface justify-center px-6">
      <View className="items-center mb-8">
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 16 }}
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-primary">Trazadía</Text>
        <Text className="text-muted mt-1">Tu diario de salud diario</Text>
      </View>

      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        editable={!isAnyLoading}
      />
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isAnyLoading}
      />

      <TouchableOpacity
        className={`rounded-xl py-4 mb-3 items-center ${isValid && !isAnyLoading ? "bg-primary" : "bg-gray-300"}`}
        onPress={handleSignIn}
        disabled={!isValid || isAnyLoading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className={`rounded-xl py-4 mb-4 items-center border ${isValid && !isAnyLoading ? "border-primary" : "border-gray-300"}`}
        onPress={handleSignUp}
        disabled={!isValid || isAnyLoading}
      >
        <Text className={`font-semibold text-base ${isValid && !isAnyLoading ? "text-primary" : "text-gray-400"}`}>
          Crear cuenta
        </Text>
      </TouchableOpacity>

      {/* Separador */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
        <Text style={{ marginHorizontal: 12, fontSize: 12, color: "#9ca3af" }}>o</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
      </View>

      {/* Botón Google — guías de marca: fondo blanco, borde gris, texto oscuro */}
      <TouchableOpacity
        onPress={() => void signInWithGoogle()}
        disabled={isAnyLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#dadce0",
          borderRadius: 12,
          paddingVertical: 14,
          opacity: isAnyLoading ? 0.6 : 1,
        }}
      >
        {googleLoading ? (
          <ActivityIndicator color="#4285F4" />
        ) : (
          <>
            <Text style={{ fontSize: 18, marginRight: 10, lineHeight: 22 }}>
              {/* Google colors SVG-like representation via colored letters */}
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
    </View>
  );
}
