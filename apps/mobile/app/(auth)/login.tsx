import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, signIn, signUp } = useAuth();

  const isValid = isValidEmail(email) && password.length >= 6;

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
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-1 text-base"
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <Text className="text-gray-400 text-xs mb-4">Mínimo 6 caracteres</Text>

      {error && (
        <Text className="text-red-500 text-sm mb-4">{error}</Text>
      )}

      <TouchableOpacity
        className={`rounded-xl py-4 mb-3 items-center ${isValid && !loading ? "bg-primary" : "bg-gray-300"}`}
        onPress={() => signIn(email, password)}
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
        onPress={() => signUp(email, password)}
        disabled={!isValid || loading}
      >
        <Text className={`font-semibold text-base ${isValid && !loading ? "text-primary" : "text-gray-400"}`}>
          Crear cuenta
        </Text>
      </TouchableOpacity>
    </View>
  );
}
