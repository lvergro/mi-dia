import { useState } from "react";
import { Alert, Image, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { signIn, signUp } from "@mi-dia/database";
import { useSessionStore } from "../../hooks/useSession";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailTrimmed = email.trim();
  const isValid = isValidEmail(emailTrimmed) && password.length >= 6;

  async function handleSignIn() {
    if (!isValid || loading) return;
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
    if (!isValid || loading) return;
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
        editable={!loading}
      />
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        className={`rounded-xl py-4 mb-3 items-center ${isValid && !loading ? "bg-primary" : "bg-gray-300"}`}
        onPress={handleSignIn}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className={`rounded-xl py-4 items-center border ${isValid && !loading ? "border-primary" : "border-gray-300"}`}
        onPress={handleSignUp}
        disabled={!isValid || loading}
      >
        <Text className={`font-semibold text-base ${isValid && !loading ? "text-primary" : "text-gray-400"}`}>
          Crear cuenta
        </Text>
      </TouchableOpacity>
    </View>
  );
}
