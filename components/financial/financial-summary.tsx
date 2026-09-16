import { formatEuro, formatProgress } from "@/components/financial/financial-format";
import type { FinancialSummary as Summary } from "@/types/financial";

export function FinancialSummary({ summary, periodLabel }: Readonly<{ summary: Summary; periodLabel: string }>) {
  const cards = [
    ["Entradas realizadas", formatEuro(summary.monthly_income)],
    ["Saídas realizadas", formatEuro(summary.monthly_expense)],
    ["Saldo em caixa", formatEuro(summary.cash_balance)],
    ["Meta mensal", summary.goal_target === null ? "Não definida" : formatEuro(summary.goal_target)],
  ] as const;

  return <section aria-labelledby="financial-summary-title"><div className="flex flex-wrap items-end justify-between gap-2"><div><h2 id="financial-summary-title" className="text-xl font-semibold text-slate-950">Resumo financeiro</h2><p className="mt-1 text-sm text-slate-600">Indicadores autorizados para {periodLabel}.</p></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p></article>)}</div><div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><h3 className="font-semibold text-slate-950">Progresso da meta</h3><span className="text-sm font-semibold text-blue-700">{summary.goal_progress === null ? "Sem meta" : formatProgress(summary.goal_progress)}</span></div>{summary.goal_progress === null ? <p className="mt-2 text-sm text-slate-600">Defina uma meta para acompanhar o progresso mensal.</p> : <progress className="mt-3 h-2 w-full accent-blue-700" value={Math.min(Number(summary.goal_progress), 1)} max={1} aria-label="Progresso da meta mensal">{formatProgress(summary.goal_progress)}</progress>}</div></section>;
}
