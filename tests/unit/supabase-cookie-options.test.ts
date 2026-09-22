import { describe, expect, it } from "vitest";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

describe("Supabase SSR cookie options", () => {
  it("requires HTTPS cookies in production", () => {
    expect(getSupabaseCookieOptions(true)).toEqual({
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: true,
    });
  });

  it("allows the local HTTP development environment", () => {
    expect(getSupabaseCookieOptions(false)).toEqual({
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: false,
    });
  });
});
