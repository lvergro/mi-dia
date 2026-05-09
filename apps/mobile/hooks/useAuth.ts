import { useState } from "react";
import { signIn, signUp, signOut } from "@mi-dia/database";

interface AuthState {
  loading: boolean;
  error: string | null;
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Credenciales incorrectas. Verifica tu email y contraseña.";
  }
  if (msg.includes("User already registered") || msg.includes("already registered")) {
    return "Ya existe una cuenta con ese email. Intenta iniciar sesión.";
  }
  if (msg.includes("Password should be")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null });

  function clearError() {
    setState((s) => ({ ...s, error: null }));
  }

  async function handleSignIn(email: string, password: string): Promise<void> {
    setState({ loading: true, error: null });
    try {
      await signIn(email, password);
      setState({ loading: false, error: null });
    } catch (err) {
      setState({ loading: false, error: friendlyError(err) });
    }
  }

  async function handleSignUp(email: string, password: string): Promise<void> {
    setState({ loading: true, error: null });
    try {
      await signUp(email, password);
      setState({ loading: false, error: null });
    } catch (err) {
      setState({ loading: false, error: friendlyError(err) });
    }
  }

  async function handleSignOut(): Promise<void> {
    setState({ loading: true, error: null });
    try {
      await signOut();
      setState({ loading: false, error: null });
    } catch (err) {
      setState({ loading: false, error: friendlyError(err) });
    }
  }

  return {
    loading: state.loading,
    error: state.error,
    clearError,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };
}
