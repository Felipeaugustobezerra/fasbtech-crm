import Link from "next/link";

type Props = Readonly<{
  label: string;
  value: string | number;
  href?: string;
  detail?: string;
}>;

export function DashboardCard({ label, value, href, detail }: Props) {
  const content = (
    <>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}

export function DashboardSectionError({ label }: Readonly<{ label: string }>) {
  return (
    <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p className="font-medium text-amber-950">{label} indisponível</p>
      <p className="mt-1 text-sm text-amber-800">
        Não foi possível carregar estes dados agora.
      </p>
    </div>
  );
}
