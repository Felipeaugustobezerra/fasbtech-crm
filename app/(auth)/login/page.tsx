import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            FASBtech CRM
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Acesse a sua conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Entre com o e-mail e a senha cadastrados no Supabase.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
