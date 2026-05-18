import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { DangerZone } from "@/components/account/DangerZone";
import { UserCircle, Mail, Calendar } from "lucide-react";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const joinDate = new Date(user.created_at).toLocaleDateString("es-ES", {
    year: "numeric", month: "long", day: "numeric",
  });

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Mi Cuenta" subtitle="Información de tu perfil" />

      <div className="flex flex-col gap-4">
        {/* Avatar card */}
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-subtle flex items-center gap-5">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{user.email}</p>
            <p className="text-sm text-slate-400 mt-0.5">Usuario activo</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-subtle">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Detalles de cuenta</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50">
                <Mail className="size-4 text-indigo-500" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-800">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-green-50">
                <Calendar className="size-4 text-green-500" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Miembro desde</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{joinDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100">
                <UserCircle className="size-4 text-slate-500" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs text-slate-400">ID de usuario</p>
                <p className="text-[11px] font-mono text-slate-500 truncate max-w-xs">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        <DangerZone />
      </div>
    </div>
  );
}
