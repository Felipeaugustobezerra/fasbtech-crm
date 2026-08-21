export default function AccessLoading() {
  return (
    <section
      aria-label="A carregar acessos"
      aria-busy="true"
      className="mx-auto w-full max-w-7xl animate-pulse"
    >
      <span className="sr-only" role="status">
        A carregar utilizadores internos.
      </span>
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-52 rounded bg-slate-200" />
      <div className="mt-4 h-5 w-full max-w-xl rounded bg-slate-200" />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-80 rounded-xl border border-slate-200 bg-white" />
        <div className="h-96 rounded-xl border border-slate-200 bg-white" />
      </div>
    </section>
  );
}
