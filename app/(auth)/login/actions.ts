"use server";

import { loginSchema, type LoginInput } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/server";
import { logServerEvent } from "@/lib/observability/server-logger";

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

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsedInput.data);

    if (!error) return { success: true };

    logServerEvent({
      level: "warn",
      module: "auth",
      operation: "login",
      code: "AUTH_LOGIN_FAILED",
    });
  } catch {
    logServerEvent({
      level: "error",
      module: "auth",
      operation: "login",
      code: "AUTH_LOGIN_UNAVAILABLE",
    });
  }

  return {
    success: false,
    message: "Não foi possível entrar. Verifique as suas credenciais.",
  };
}
