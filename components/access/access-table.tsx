import { MemberRoleForm } from "@/components/access/member-role-form";
import type { OrganizationMemberSummary } from "@/types/access";

type AccessTableProps = Readonly<{
  members: OrganizationMemberSummary[];
}>;

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
});

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
};

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function EmptyMembers() {
  return (
    <section
      aria-labelledby="access-empty-title"
      className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="size-6"
        >
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2
        id="access-empty-title"
        className="mt-4 text-lg font-semibold text-slate-950"
      >
        Nenhum utilizador visível
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Adicione um utilizador que já possua conta para começar a gerir os
        acessos da Organization.
      </p>
      <a
        href="#adicionar-utilizador"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Adicionar utilizador
      </a>
    </section>
  );
}

export function AccessTable({ members }: AccessTableProps) {
  if (members.length === 0) {
    return <EmptyMembers />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <caption className="sr-only">
            Utilizadores internos visíveis da Organization
          </caption>
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Nome
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Role
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Estado
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Entrada
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr
                key={member.membershipId}
                className="align-top hover:bg-slate-50"
              >
                <th
                  scope="row"
                  className="px-6 py-5 text-sm font-semibold text-slate-950"
                >
                  {member.fullName}
                </th>
                <td className="px-6 py-4">
                  <MemberRoleForm
                    membershipId={member.membershipId}
                    fullName={member.fullName}
                    initialRole={member.role}
                  />
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {statusLabels[member.status] ?? member.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                  <time dateTime={member.membershipCreatedAt}>
                    {formatDate(member.membershipCreatedAt)}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
