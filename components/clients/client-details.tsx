import type { Client } from "@/types/client";

type ClientDetailsProps = Readonly<{
  client: Client;
}>;

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Não informado" : dateFormatter.format(date);
}

function DetailItem({
  term,
  children,
}: Readonly<{
  term: string;
  children: React.ReactNode;
}>) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{term}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-950">{children}</dd>
    </div>
  );
}

function getFiscalIdentification(client: Client) {
  if (!client.tax_id || !client.tax_id_type) {
    return "Não informado";
  }

  return `${client.tax_id_type}: ${client.tax_id}`;
}

function getAddressLines(client: Client) {
  return [
    client.address_line_1,
    client.address_line_2,
    [client.postal_code, client.city].filter(Boolean).join(" "),
    client.region,
    client.country_code,
  ].filter((value): value is string => Boolean(value));
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const addressLines = getAddressLines(client);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section
        aria-labelledby="client-general-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2
          id="client-general-title"
          className="text-lg font-semibold text-slate-950"
        >
          Informações gerais
        </h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem term="Nome">{client.name}</DetailItem>
          <DetailItem term="Empresa">
            {client.company_name ?? "Não informado"}
          </DetailItem>
          <DetailItem term="E-mail">
            {client.email ?? "Não informado"}
          </DetailItem>
          <DetailItem term="Telefone">
            {client.phone ?? "Não informado"}
          </DetailItem>
          <div className="sm:col-span-2">
            <DetailItem term="Identificação fiscal">
              {getFiscalIdentification(client)}
            </DetailItem>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="client-address-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2
          id="client-address-title"
          className="text-lg font-semibold text-slate-950"
        >
          Endereço
        </h2>
        {addressLines.length > 0 ? (
          <address className="mt-5 space-y-1 text-sm leading-6 text-slate-700 not-italic">
            {addressLines.map((line, index) => (
              <p key={`${index}-${line}`}>{line}</p>
            ))}
          </address>
        ) : (
          <p className="mt-5 text-sm text-slate-600">Não informado</p>
        )}
      </section>

      <section
        aria-labelledby="client-notes-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
      >
        <h2
          id="client-notes-title"
          className="text-lg font-semibold text-slate-950"
        >
          Observações
        </h2>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {client.notes ?? "Não informado"}
        </p>
      </section>

      <section
        aria-labelledby="client-dates-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
      >
        <h2
          id="client-dates-title"
          className="text-lg font-semibold text-slate-950"
        >
          Datas
        </h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem term="Criado em">
            {formatDate(client.created_at)}
          </DetailItem>
          <DetailItem term="Atualizado em">
            {formatDate(client.updated_at)}
          </DetailItem>
        </dl>
      </section>
    </div>
  );
}
