import Link from "next/link";

import { logout } from "@/app/(private)/actions";

type AppRole = "OWNER" | "ADMIN" | "MEMBER";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  userEmail?: string;
  fullName?: string | null;
  organizationName: string;
  role: AppRole;
}>;

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    enabled: true,
  },
  {
    label: "Demandas",
    href: "/demandas",
    enabled: false,
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    enabled: false,
  },
  {
    label: "Contratos",
    href: "/contratos",
    enabled: false,
  },
  {
    label: "Clientes",
    href: "/clientes",
    enabled: true,
  },
  {
    label: "Acessos",
    href: "/acessos",
    enabled: true,
    ownerOnly: true,
  },
] as const;

const roleLabels: Record<AppRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Membro",
};

function NavigationItems({ role }: Readonly<{ role: AppRole }>) {
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {navigation.map((item) => {
        if ("ownerOnly" in item && item.ownerOnly && role !== "OWNER") {
          return null;
        }

        if (!item.enabled) {
          return (
            <div
              key={item.label}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
            >
              <span>{item.label}</span>

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Em breve
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  userEmail,
  fullName,
  organizationName,
  role,
}: AppShellProps) {
  const normalizedFullName = fullName?.trim();

  const hasDistinctFullName =
    Boolean(normalizedFullName) &&
    normalizedFullName?.toLowerCase() !== userEmail?.toLowerCase();

  const displayName = hasDistinctFullName
    ? normalizedFullName
    : userEmail || "Usuário";

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 text-white md:flex md:flex-col">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-lg font-semibold tracking-tight">FASBtech CRM</p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {organizationName}
          </p>
        </div>

        <div className="flex-1 px-4 py-6">
          <NavigationItems role={role} />
        </div>

        <div className="border-t border-slate-800 px-5 py-5">
          <p className="truncate text-sm font-medium text-slate-200">
            {displayName}
          </p>

          {userEmail && hasDistinctFullName ? (
            <p className="mt-1 truncate text-xs text-slate-500">{userEmail}</p>
          ) : null}

          <span className="mt-3 inline-flex rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            {roleLabels[role]}
          </span>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div className="md:hidden">
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Menu
                </summary>

                <div className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-slate-950 p-4 shadow-xl">
                  <div className="mb-4 border-b border-slate-800 pb-4">
                    <p className="font-semibold text-white">FASBtech CRM</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {organizationName}
                    </p>
                  </div>

                  <NavigationItems role={role} />
                </div>
              </details>
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-500">
                {organizationName}
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-4">
              <div className="hidden min-w-0 text-right sm:block">
                <div className="flex items-center justify-end gap-2">
                  <p className="max-w-48 truncate text-sm font-medium text-slate-900">
                    {displayName}
                  </p>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {roleLabels[role]}
                  </span>
                </div>

                {userEmail && hasDistinctFullName ? (
                  <p className="mt-0.5 max-w-64 truncate text-xs text-slate-500">
                    {userEmail}
                  </p>
                ) : null}
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
