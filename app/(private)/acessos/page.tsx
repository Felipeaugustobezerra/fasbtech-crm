import { notFound } from "next/navigation";

import { AccessTable } from "@/components/access/access-table";
import { AddMemberForm } from "@/components/access/add-member-form";
import { listOrganizationMembers } from "@/lib/access/queries";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function AccessPage() {
  const context = await resolveFoundationContext();

  if (context.status !== "READY" || context.membership.role !== "OWNER") {
    notFound();
  }

  const members = await listOrganizationMembers();

  return (
    <section className="mx-auto w-full max-w-7xl" aria-labelledby="access-title">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Administração
          </p>
          <h1
            id="access-title"
            className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
          >
            Acessos
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Gerencie os utilizadores internos e as respetivas roles na
            Organization.
          </p>
        </div>

        <a
          href="#adicionar-utilizador"
          className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Adicionar utilizador
        </a>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <section aria-labelledby="members-title" className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                id="members-title"
                className="text-lg font-semibold text-slate-950"
              >
                Utilizadores internos
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {members.length === 1
                  ? "1 Membership visível"
                  : `${members.length} Memberships visíveis`}
              </p>
            </div>
          </div>

          <AccessTable members={members} />
        </section>

        <aside
          id="adicionar-utilizador"
          aria-labelledby="add-member-title"
          className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2
            id="add-member-title"
            className="text-lg font-semibold text-slate-950"
          >
            Adicionar utilizador
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vincule à Organization um utilizador que já possua conta no
            FASBtech CRM.
          </p>
          <div className="mt-5">
            <AddMemberForm />
          </div>
        </aside>
      </div>
    </section>
  );
}
