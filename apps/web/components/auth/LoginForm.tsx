"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/mi-dia");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="email" label="Email" type="email" required
        value={email} onChange={e => setEmail(e.target.value)}
        placeholder="tu@email.com"
      />
      <Input
        id="password" label="Contraseña" type="password" required
        value={password} onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="rounded-xl bg-danger-subtle px-4 py-2.5 text-sm text-danger">{error}</p>}
      <Button type="submit" loading={loading} size="lg" className="mt-1">
        Iniciar sesión
      </Button>
    </form>
  );
}
