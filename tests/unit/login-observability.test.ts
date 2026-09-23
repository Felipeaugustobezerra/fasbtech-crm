import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "@/app/(auth)/login/actions";

const mocks = vi.hoisted(() => ({ signInWithPassword: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: mocks }),
}));

describe("login observability", () => {
  beforeEach(() => {
    mocks.signInWithPassword.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("logs a rejected login without email or password", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { message: "private auth response" },
    });

    const result = await login({
      email: "user@example.test",
      password: "private-password",
    });

    expect(result).toEqual({
      success: false,
      message: "Não foi possível entrar. Verifique as suas credenciais.",
    });
    const logged = vi.mocked(console.warn).mock.calls[0]?.[0] as string;
    expect(JSON.parse(logged)).toMatchObject({
      level: "warn",
      module: "auth",
      operation: "login",
      code: "AUTH_LOGIN_FAILED",
    });
    expect(logged).not.toMatch(/user@example|private-password|private auth response/u);
  });

  it("returns a safe error and records an unavailable Auth service", async () => {
    mocks.signInWithPassword.mockRejectedValue(new Error("private network detail"));

    const result = await login({
      email: "user@example.test",
      password: "private-password",
    });

    expect(result.success).toBe(false);
    const logged = vi.mocked(console.error).mock.calls[0]?.[0] as string;
    expect(JSON.parse(logged)).toMatchObject({
      level: "error",
      module: "auth",
      operation: "login",
      code: "AUTH_LOGIN_UNAVAILABLE",
    });
    expect(logged).not.toMatch(/user@example|private-password|private network detail/u);
  });
});
