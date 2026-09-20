"use client";

export default function ContractsError({ retry }: Readonly<{ error: Error & { digest?: string }; retry: () => void }>) {
  return <section role="alert" className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6"><h1 className="text-xl font-semibold text-red-950">Não foi possível carregar Contratos</h1><p className="mt-2 text-sm text-red-800">Tente novamente. Se o problema persistir, confirme a sua sessão.</p><button onClick={retry} className="mt-5 min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white">Tentar novamente</button></section>;
}
