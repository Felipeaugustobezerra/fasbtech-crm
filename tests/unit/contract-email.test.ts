import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendContractEmail } from "@/lib/contracts/email";

const emailMocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = emailMocks;
  },
}));

describe("contract email", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("CONTRACTS_EMAIL_FROM", "contracts@example.test");
    emailMocks.send.mockReset().mockResolvedValue({
      data: { id: "email-id" },
      error: null,
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("sends the private PDF as an in-memory attachment", async () => {
    await expect(
      sendContractEmail({
        recipient: "client@example.test",
        contractTitle: "Contrato principal",
        fileName: "contract.pdf",
        pdf: new Uint8Array([1, 2, 3]),
      }),
    ).resolves.toBe("email-id");

    const message = emailMocks.send.mock.calls[0][0];
    expect(message).toEqual(
      expect.objectContaining({
        from: "contracts@example.test",
        to: "client@example.test",
        subject: "Contrato principal",
      }),
    );
    expect(message.attachments[0].filename).toBe("contract.pdf");
    expect(Array.from(message.attachments[0].content as Uint8Array)).toEqual([
      1, 2, 3,
    ]);
  });

  it("fails when the provider does not confirm the send", async () => {
    emailMocks.send.mockResolvedValue({
      data: null,
      error: { message: "provider failed" },
    });

    await expect(
      sendContractEmail({
        recipient: "client@example.test",
        contractTitle: "Contrato",
        fileName: "contract.pdf",
        pdf: new Uint8Array([1]),
      }),
    ).rejects.toThrow("CONTRACT_EMAIL_SEND_FAILED");
  });

  it("fails safely before contacting Resend when configuration is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    await expect(
      sendContractEmail({
        recipient: "client@example.test",
        contractTitle: "Contrato",
        fileName: "contract.pdf",
        pdf: new Uint8Array([1]),
      }),
    ).rejects.toThrow("CONTRACT_EMAIL_RESEND_API_KEY_MISSING");
    expect(emailMocks.send).not.toHaveBeenCalled();

    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("CONTRACTS_EMAIL_FROM", "");
    await expect(
      sendContractEmail({
        recipient: "client@example.test",
        contractTitle: "Contrato",
        fileName: "contract.pdf",
        pdf: new Uint8Array([1]),
      }),
    ).rejects.toThrow("CONTRACT_EMAIL_CONTRACTS_EMAIL_FROM_MISSING");
    expect(emailMocks.send).not.toHaveBeenCalled();
  });

  it("rejects an invalid sender without exposing its value", async () => {
    vi.stubEnv("CONTRACTS_EMAIL_FROM", "invalid\r\nSensitive-Header: value");

    await expect(
      sendContractEmail({
        recipient: "client@example.test",
        contractTitle: "Contrato",
        fileName: "contract.pdf",
        pdf: new Uint8Array([1]),
      }),
    ).rejects.toThrow("CONTRACT_EMAIL_SENDER_INVALID");
    expect(emailMocks.send).not.toHaveBeenCalled();
  });

  it("wraps provider exceptions with a stable server-only cause", async () => {
    emailMocks.send.mockRejectedValueOnce(new Error("provider private detail"));

    await expect(
      sendContractEmail({
        recipient: "client@example.test",
        contractTitle: "Contrato",
        fileName: "contract.pdf",
        pdf: new Uint8Array([1]),
      }),
    ).rejects.toMatchObject({
      message: "CONTRACT_EMAIL_SEND_FAILED",
      cause: expect.objectContaining({ message: "provider private detail" }),
    });
  });
});
