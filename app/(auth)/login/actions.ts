"use server";

import { loginSchema, type LoginInput } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/server";

type LoginResult =
  | { success: true }
  | { success: false; message: string };

export async function login(input: LoginInput): Promise<LoginResult> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Verifique o e-mail e a senha informados.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsedInput.data);

  if (error) {
    return {
      success: false,
      message: "Não foi possível entrar. Verifique as suas credenciais.",
    };
  }

  return { success: true };
}
