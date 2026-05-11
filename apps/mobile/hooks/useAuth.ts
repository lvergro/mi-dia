import { useState } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { signIn, signUp, signOut, getGoogleOAuthUrl, setSessionFromOAuthCallback } from "@mi-dia/database";
import { useSessionStore } from "./useSession";

interface AuthState {
  loading: boolean;
  error: string | null;
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Credenciales incorrectas. Verifica tu email y contraseña.";
  }
  if (msg.includes("Email not confirmed") || msg.includes("email_not_confirmed")) {
    return "Debes confirmar tu email. Revisa tu bandeja de entrada.";
  }
  if (msg.includes("User already registered") || msg.includes("already registered")) {
    return "Ya existe una cuenta con ese email. Intenta iniciar sesión.";
  }
  if (msg.includes("Password should be")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return msg;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null });

  function clearError() {
    setState((s) => ({ ...s, error: null }));
  }

  async function handleSignIn(email: string, password: string): Promise<void> {
    setState({ loading: true, error: null });
    try {
      const session = await signIn(email, password);
      useSessionStore.getState().setSession(session);
      setState({ loading: false, error: null });
    } catch (err) {
      const msg = friendlyError(err);
      setState({ loading: false, error: msg });
      Alert.alert("Error al ingresar", msg);
    }
  }

  async function handleSignUp(email: string, password: string): Promise<void> {
    setState({ loading: true, error: null });
    try {
      const session = await signUp(email, password);
      if (session) {
        useSessionStore.getState().setSession(session);
      } else {
        Alert.alert(
          "Confirma tu email",
          "Te enviamos un link de confirmación. Revisa tu bandeja de entrada y luego ingresa."
        );
      }
      setState({ loading: false, error: null });
    } catch (err) {
      const msg = friendlyError(err);
      setState({ loading: false, error: msg });
      Alert.alert("Error al registrarse", msg);
    }
  }

  async function handleSignOut(): Promise<void> {
    setState({ loading: true, error: null });
    try {
      await signOut();
      useSessionStore.getState().setSession(null);
      setState({ loading: false, error: null });
    } catch (err) {
      setState({ loading: false, error: friendlyError(err) });
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    setState({ loading: true, error: null });
    try {
      const redirectUri = makeRedirectUri({ scheme: "mi-dia" });
      const url = await getGoogleOAuthUrl(redirectUri);
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
      if (result.type === "success") {
        const session = await setSessionFromOAuthCallback(result.url);
        useSessionStore.getState().setSession(session);
      }
      setState({ loading: false, error: null });
    } catch (err) {
      const msg = friendlyError(err);
      setState({ loading: false, error: msg });
      Alert.alert("Error con Google", msg);
    }
  }

  return {
    loading: state.loading,
    error: state.error,
    clearError,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    signInWithGoogle: handleGoogleSignIn,
  };
}
