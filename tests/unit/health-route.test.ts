import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

describe("health route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports app and Auth availability without leaking endpoint or key", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      application: "operational",
      auth: "available",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://project.supabase.co/auth/v1/health"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("reports dependency failure while the app remains operational", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private endpoint failure")));

    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      application: "operational",
      auth: "unavailable",
    });
  });
});
