import { describe, expect, it } from "vitest";

import { generateContractPdf } from "@/lib/contracts/pdf";
import type { ContractSnapshot } from "@/types/contracts";

const snapshot: ContractSnapshot = {
  schema_version: 1,
  content: "Contrato de prestação de serviços\n\nCláusula primeira.",
  client: {
    id: "11111111-1111-4111-8111-111111111111",
    data: { name: "Cliente" },
    tax_id: "PT123",
    tax_id_type: "NIF",
  },
  manual_fields: {},
  template: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Prestação de serviços",
  },
};

describe("contract PDF", () => {
  it("generates a PDF from the frozen snapshot content", async () => {
    const pdf = await generateContractPdf(snapshot);

    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(500);
  });
});
