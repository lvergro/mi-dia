import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #ede9fe 0%, #f0f4ff 40%, #f8fafc 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-[20px] bg-primary shadow-card">
            <span className="text-3xl">💊</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1e293b]">Mi Día</h1>
            <p className="mt-0.5 text-sm text-[#64748b]">Tu checklist diario de salud</p>
          </div>
        </div>

        <div className="rounded-3xl border border-card-border bg-white p-8 shadow-card">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
