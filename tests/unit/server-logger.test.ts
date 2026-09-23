import { describe, expect, it, vi } from "vitest";

import {
  getSafeDiagnosticCode,
  logServerEvent,
} from "@/lib/observability/server-logger";

describe("server logger", () => {
  it("keeps only allowlisted diagnostic codes from an error cause", () => {
    const error = new Error("UNEXPECTED_ERROR", {
      cause: new Error("CONTRACT_DOCUMENT_UPLOAD_FAILED", {
        cause: new Error("secret provider payload"),
      }),
    });

    expect(getSafeDiagnosticCode(error)).toBe(
      "CONTRACT_DOCUMENT_UPLOAD_FAILED",
    );
    expect(getSafeDiagnosticCode(new Error("secret provider payload"))).toBeUndefined();
  });

  it("writes one structured event without serializing raw errors", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logServerEvent({
      level: "error",
      module: "contracts",
      operation: "generate_pdf",
      code: "UNEXPECTED_ERROR",
      diagnosticCode: "CONTRACT_PDF_GENERATION_FAILED",
    });

    const output = spy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(output)).toMatchObject({
      level: "error",
      module: "contracts",
      operation: "generate_pdf",
      code: "UNEXPECTED_ERROR",
      diagnosticCode: "CONTRACT_PDF_GENERATION_FAILED",
      eventId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(output).not.toContain("snapshot");
    spy.mockRestore();
  });
});
