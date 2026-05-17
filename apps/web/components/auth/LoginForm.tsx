"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
    return "Credenciales incorrectas. Verifica tu email y contraseña.";
  if (msg.includes("Email not confirmed") || msg.includes("email_not_confirmed"))
    return "Debes confirmar tu email. Revisa tu bandeja de entrada.";
  if (msg.includes("User already registered") || msg.includes("already registered"))
    return "Ya existe una cuenta con ese email. Intenta iniciar sesión.";
  if (msg.includes("Password should be"))
    return "La contraseña debe tener al menos 6 caracteres.";
  return msg;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isLogin = mode === "login";
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 6;
  const isAnyLoading = loading || googleLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isAnyLoading) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
      }
      router.push("/mi-dia");
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (isAnyLoading) return;
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(friendlyError(err));
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa tu email para recuperar tu contraseña.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setError(null);
    alert(`Enviamos un enlace de recuperación a ${email.trim()}.`);
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xl font-bold text-[#1a1a2e] mb-1">
        {isLogin ? "¡Bienvenido de nuevo!" : "Crea tu cuenta"}
      </p>
      <p className="text-[13px] text-[#8b93a5] mb-5">
        {isLogin ? "Inicia sesión para continuar" : "Regístrate para empezar"}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Email */}
        <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e8eaf0] bg-[#fafafe] px-4 focus-within:border-primary transition-colors">
          <Mail className="size-4 shrink-0 text-[#b0b8c8]" strokeWidth={1.8} />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isAnyLoading}
            className="flex-1 py-3.5 text-[15px] text-[#1a1a2e] placeholder:text-[#b0b8c8] bg-transparent outline-none"
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e8eaf0] bg-[#fafafe] px-4 focus-within:border-primary transition-colors">
          <Lock className="size-4 shrink-0 text-[#b0b8c8]" strokeWidth={1.8} />
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isAnyLoading}
            className="flex-1 py-3.5 text-[15px] text-[#1a1a2e] placeholder:text-[#b0b8c8] bg-transparent outline-none"
          />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="text-[#b0b8c8] hover:text-[#64748b] transition-colors">
            {showPassword ? <EyeOff className="size-4" strokeWidth={1.8} /> : <Eye className="size-4" strokeWidth={1.8} />}
          </button>
        </div>

        {/* Forgot password */}
        {isLogin && (
          <button type="button" onClick={handleForgotPassword} className="self-end text-[12px] text-primary font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        )}

        {error && (
          <p className="rounded-xl bg-[#fef2f2] px-4 py-2.5 text-[13px] text-[#ef4444]">{error}</p>
        )}

        {/* Primary button */}
        <button
          type="submit"
          disabled={!isValid || isAnyLoading}
          className={cn(
            "mt-1 flex items-center justify-center gap-2 rounded-[14px] py-4 text-[16px] font-bold transition-all",
            isValid && !isAnyLoading
              ? "bg-primary text-white hover:bg-primary-dark"
              : "bg-[#d1d5db] text-[#9ca3af] cursor-not-allowed"
          )}
        >
          {loading
            ? <Loader2 className="size-5 animate-spin" />
            : isLogin ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>

      {/* Separador */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#e8eaf0]" />
        <span className="text-[12px] text-[#b0b8c8]">o</span>
        <div className="flex-1 h-px bg-[#e8eaf0]" />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={isAnyLoading}
        className="flex items-center justify-center gap-3 rounded-[14px] border-[1.5px] border-[#e8eaf0] bg-white py-3.5 text-[15px] font-medium text-[#3c4043] hover:bg-[#f8f9fa] transition-colors disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="size-5 animate-spin text-[#4285F4]" />
        ) : (
          <>
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </>
        )}
      </button>

      {/* Switch mode */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        <span className="text-[13px] text-[#8b93a5]">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
        </span>
        <button
          onClick={() => { setMode(isLogin ? "register" : "login"); setError(null); }}
          className="text-[13px] text-primary font-semibold hover:underline"
        >
          {isLogin ? "Crear cuenta" : "Ingresar"}
        </button>
      </div>

      {/* Footer seguridad */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <span className="text-[11px] text-[#b0b8c8]">🔒</span>
        <span className="text-[11px] text-[#b0b8c8]">Tu información está segura con nosotros</span>
      </div>
    </div>
  );
}
