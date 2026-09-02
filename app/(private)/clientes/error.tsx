"use client";

export default function ClientsError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <section
      aria-labelledby="clients-error-title"
      className="mx-auto w-full max-w-3xl rounded-xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm"
    >
      <h1
        id="clients-error-title"
        className="text-2xl font-semibold text-slate-950"
      >
        Não foi possível carregar os Clientes
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Ocorreu um problema ao obter os Clientes. Tente novamente.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Tentar novamente
      </button>
    </section>
  );
}
