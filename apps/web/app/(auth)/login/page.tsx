import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #e8f4ff 0%, #f0ebff 50%, #ffffff 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Trazadía" width={120} height={120} className="rounded-[20px] shadow-card" priority />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1e293b]">Trazadía</h1>
            <p className="mt-0.5 text-sm text-[#64748b]">Un día a la vez</p>
          </div>
        </div>

        <div className="rounded-3xl border border-card-border bg-white p-8 shadow-card">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
