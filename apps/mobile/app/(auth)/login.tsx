import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { supabase } from "@mi-dia/database";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError("No se pudo crear la cuenta. Intenta con otro email.");
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-surface justify-center px-6">
      <Text className="text-3xl font-bold text-primary mb-2">Mi Día</Text>
      <Text className="text-muted mb-8">Registro de medicamentos diarios</Text>

      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      {error && (
        <Text className="text-red-500 text-sm mb-4">{error}</Text>
      )}

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 mb-3 items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="rounded-xl py-4 items-center border border-primary"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-primary font-semibold text-base">Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}
