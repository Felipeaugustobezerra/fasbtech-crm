import { redirect } from "next/navigation";

import { logout } from "./actions";

import { AppShell } from "@/components/app-shell";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await resolveFoundationContext();

  if (context.status === "UNAUTHENTICATED") {
    redirect("/login");
  }

  if (context.status === "PENDING_ACCESS") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">
            Acesso pendente
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            A sua conta está autenticada, mas ainda não possui acesso
            operacional à FASBtech.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Um OWNER deverá associar a sua conta à Organization.
          </p>

          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (context.status === "ACCESS_DENIED") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">
            Acesso indisponível
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            A sua conta não possui acesso operacional ao CRM neste momento.
          </p>

          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <AppShell
      userEmail={context.userEmail}
      fullName={context.profile.full_name}
      organizationName={context.organization.name}
      role={context.membership.role}
    >
      {children}
    </AppShell>
  );
}
