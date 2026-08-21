import {
  AssignClientAccessForm,
  type EligibleClientAccessMember,
} from "@/components/access/assign-client-access-form";
import { RemoveClientAccess } from "@/components/access/remove-client-access";
import type { ClientAccessSummary } from "@/types/access";

type ClientAccessSectionProps = Readonly<{
  clientId: string;
  accesses: ClientAccessSummary[];
  canManageClientAccess: boolean;
  candidates: EligibleClientAccessMember[];
}>;

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
});

const roleLabels = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Membro",
} as const;

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function ClientAccessSection({
  clientId,
  accesses,
  canManageClientAccess,
  candidates,
}: ClientAccessSectionProps) {
  return (
    <section
      aria-labelledby="client-access-title"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2
          id="client-access-title"
          className="text-lg font-semibold text-slate-950"
        >
          Acessos ao Cliente
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Utilizadores com acesso visível para o seu contexto atual.
        </p>
      </header>

      <div className="px-5 py-5 sm:px-6">
        {accesses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Nenhum acesso visível para este Cliente.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200" aria-label="Acessos visíveis">
            {accesses.map((access) => (
              <li
                key={access.assignmentId}
                className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {access.fullName}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {roleLabels[access.role]}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>
                      Atribuído em{" "}
                      <time dateTime={access.assignedAt}>
                        {formatDate(access.assignedAt)}
                      </time>
                    </span>
                  </div>
                </div>

                {canManageClientAccess ? (
                  <RemoveClientAccess
                    clientId={clientId}
                    membershipId={access.membershipId}
                    fullName={access.fullName}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManageClientAccess ? (
        <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
          <h3 className="text-base font-semibold text-slate-950">
            Atribuir acesso
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Selecione um MEMBER ativo que ainda não possua acesso ao Cliente.
          </p>
          <div className="mt-4 max-w-xl">
            <AssignClientAccessForm
              clientId={clientId}
              candidates={candidates}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
