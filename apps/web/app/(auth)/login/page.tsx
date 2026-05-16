import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi Día</h1>
          <p className="mt-1 text-sm text-muted">Tu checklist diario</p>
        </div>
        <div className="rounded-2xl border border-card-border bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
