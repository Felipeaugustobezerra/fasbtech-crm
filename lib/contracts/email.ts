import { Resend } from "resend";

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

export async function sendContractEmail({
  recipient,
  contractTitle,
  fileName,
  pdf,
}: SendContractEmailInput): Promise<string> {
  const resend = new Resend(requireEnvironment("RESEND_API_KEY"));
  const { data, error } = await resend.emails.send({
    from: requireEnvironment("CONTRACTS_EMAIL_FROM"),
    to: recipient,
    subject: contractTitle,
    text: "Segue em anexo o contrato solicitado.",
    attachments: [{ filename: fileName, content: Buffer.from(pdf) }],
  });

  if (error || !data?.id) {
    throw new Error("CONTRACT_EMAIL_SEND_FAILED", { cause: error });
  }

  return data.id;
}
