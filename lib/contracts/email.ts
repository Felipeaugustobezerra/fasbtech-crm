import { Resend } from "resend";
import { z } from "zod";

type SendContractEmailInput = {
  recipient: string;
  contractTitle: string;
  fileName: string;
  pdf: Uint8Array;
};

function requireEnvironment(name: "RESEND_API_KEY" | "CONTRACTS_EMAIL_FROM") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`CONTRACT_EMAIL_${name}_MISSING`);
  return value;
}

function requireSender() {
  const sender = requireEnvironment("CONTRACTS_EMAIL_FROM");
  const address =
    sender.match(/^[^<>\r\n]+ <([^<>\s]+@[^<>\s]+)>$/u)?.[1] ?? sender;

  if (!address || !z.email().safeParse(address).success) {
    throw new Error("CONTRACT_EMAIL_SENDER_INVALID");
  }

  return sender;
}

export async function sendContractEmail({
  recipient,
  contractTitle,
  fileName,
  pdf,
}: SendContractEmailInput): Promise<string> {
  const apiKey = requireEnvironment("RESEND_API_KEY");
  const sender = requireSender();

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipient,
      subject: contractTitle,
      text: "Segue em anexo o contrato solicitado.",
      attachments: [{ filename: fileName, content: Buffer.from(pdf) }],
    });

    if (error || !data?.id) {
      throw new Error("CONTRACT_EMAIL_SEND_FAILED", { cause: error });
    }

    return data.id;
  } catch (cause) {
    if (cause instanceof Error && cause.message === "CONTRACT_EMAIL_SEND_FAILED") {
      throw cause;
    }

    throw new Error("CONTRACT_EMAIL_SEND_FAILED", { cause });
  }
}
