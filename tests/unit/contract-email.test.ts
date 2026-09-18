import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendContractEmail } from "@/lib/contracts/email";

const emailMocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = emailMocks;
  },
}));

describe("contract email", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTRACTS_EMAIL_FROM = "contracts@example.test";
    emailMocks.send.mockReset().mockResolvedValue({
      data: { id: "email-id" },
      error: null,
    });
  });

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
});
