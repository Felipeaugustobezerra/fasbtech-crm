import { describe, expect, it } from "vitest";

import { buildSecurityHeaders } from "@/lib/security/headers";

function asRecord(headers: ReturnType<typeof buildSecurityHeaders>) {
  return Object.fromEntries(headers.map(({ key, value }) => [key, value]));
}

describe("security headers", () => {
  it("builds the production baseline with the configured Supabase origin", () => {
    const headers = asRecord(
      buildSecurityHeaders({
        isDevelopment: false,
        isProduction: true,
        supabaseUrl: "https://project.supabase.co/path",
      }),
    );

    expect(headers["Content-Security-Policy"]).toContain(
      "connect-src 'self' https://project.supabase.co",
    );
    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["Content-Security-Policy"]).toContain(
      "upgrade-insecure-requests",
    );
    expect(headers["Content-Security-Policy"]).not.toContain("'unsafe-eval'");
    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains",
    );
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("keeps development compatible without enabling production-only HSTS", () => {
    const headers = asRecord(
      buildSecurityHeaders({
        isDevelopment: true,
        isProduction: false,
        supabaseUrl: "http://127.0.0.1:54321",
      }),
    );

    expect(headers["Content-Security-Policy"]).toContain("'unsafe-eval'");
    expect(headers["Content-Security-Policy"]).toContain("ws:");
    expect(headers["Content-Security-Policy"]).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(headers["Strict-Transport-Security"]).toBeUndefined();
  });

  it("does not inject an invalid Supabase URL into the CSP", () => {
    const headers = asRecord(
      buildSecurityHeaders({
        isDevelopment: false,
        isProduction: true,
        supabaseUrl: "not-a-url",
      }),
    );

    expect(headers["Content-Security-Policy"]).toContain(
      "connect-src 'self';",
    );
    expect(headers["Content-Security-Policy"]).not.toContain("not-a-url");
  });
});
