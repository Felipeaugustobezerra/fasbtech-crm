import { logout } from "@/app/(private)/actions";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  userEmail?: string;
}>;

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[16rem_1fr]">
      <aside className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white md:min-h-screen md:border-b-0 md:border-r md:px-6 md:py-7">
        <div className="flex items-center justify-between md:block">
          <div>
            <p className="text-lg font-semibold tracking-tight">FASBtech CRM</p>
            <p className="mt-1 text-xs text-slate-400">Área administrativa</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 md:mt-8 md:inline-block">
            Início
          </span>
        </div>
        <p className="mt-5 hidden text-sm leading-6 text-slate-400 md:block">
          A navegação dos módulos será adicionada nas próximas sprints.
        </p>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-18 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-900">Painel administrativo</p>
            {userEmail ? (
              <p className="mt-0.5 max-w-52 truncate text-xs text-slate-500 sm:max-w-none">
                {userEmail}
              </p>
            ) : null}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Sair
            </button>
          </form>
        </header>

        <main className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
