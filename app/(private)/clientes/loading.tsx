export default function ClientsLoading() {
  return (
    <section
      aria-label="A carregar Clientes"
      aria-busy="true"
      className="mx-auto w-full max-w-7xl animate-pulse"
    >
      <span className="sr-only" role="status">
        A carregar Clientes.
      </span>
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-52 rounded bg-slate-200" />
      <div className="mt-4 h-5 w-full max-w-xl rounded bg-slate-200" />

      <div className="mt-8 h-20 rounded-xl border border-slate-200 bg-white" />
      <div className="mt-5 h-80 rounded-xl border border-slate-200 bg-white" />
    </section>
  );
}
