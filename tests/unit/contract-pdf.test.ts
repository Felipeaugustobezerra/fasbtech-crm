import { PDFDocument } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";

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

  async function render(content: string) {
    const drawn: Array<{ page: number; text: string; y: number; width: number }> = [];
    const create = PDFDocument.create.bind(PDFDocument);
    const createSpy = vi.spyOn(PDFDocument, "create").mockImplementation(async (...args) => {
      const document = await create(...args);
      const addPage = document.addPage.bind(document);

      vi.spyOn(document, "addPage").mockImplementation((...pageArgs) => {
        const page = addPage(...pageArgs);
        const pageNumber = document.getPageCount();
        const drawText = page.drawText.bind(page);

        vi.spyOn(page, "drawText").mockImplementation((text, options) => {
          drawn.push({
            page: pageNumber,
            text,
            y: options?.y ?? 0,
            width: options?.font?.widthOfTextAtSize(text, options?.size ?? 11) ?? 0,
          });
          return drawText(text, options);
        });

        return page;
      });

      return document;
    });

    try {
      const bytes = await generateContractPdf({ ...snapshot, content });
      const document = await PDFDocument.load(bytes);
      return { drawn, pageCount: document.getPageCount() };
    } finally {
      createSpy.mockRestore();
    }
  }

  it.each([
    ["LF", "Primeira linha\nSegunda linha"],
    ["CRLF", "Primeira linha\r\nSegunda linha"],
  ])("preserves %s line breaks without question marks", async (_kind, content) => {
    const { drawn } = await render(content);

    expect(drawn.map((entry) => entry.text)).toEqual(["Primeira linha", "Segunda linha"]);
    expect(drawn[0].y - drawn[1].y).toBe(16);
    expect(drawn.every((entry) => !entry.text.includes("?"))).toBe(true);
  });

  it("adds visual space between paragraphs, including whitespace-only lines", async () => {
    const { drawn } = await render("Parágrafo um.\n \nParágrafo dois.\n\nParágrafo três.");

    expect(drawn.map((entry) => entry.text)).toEqual([
      "Parágrafo um.",
      "Parágrafo dois.",
      "Parágrafo três.",
    ]);
    expect(drawn[0].y - drawn[1].y).toBe(40);
    expect(drawn[1].y - drawn[2].y).toBe(40);
  });

  it("wraps prose and long unbroken words inside the page margins", async () => {
    const { drawn } = await render(`Início ${"palavra ".repeat(100)}${"x".repeat(150)}`);

    expect(drawn.length).toBeGreaterThan(2);
    expect(drawn.every((entry) => entry.width <= 595.28 - 112)).toBe(true);
  });

  it("paginates long content without losing its final line", async () => {
    const { drawn, pageCount } = await render(Array.from({ length: 130 }, (_, index) => `Linha ${index + 1}`).join("\n"));

    expect(pageCount).toBeGreaterThan(1);
    expect(drawn[0].text).toBe("Linha 1");
    expect(drawn.at(-1)?.text).toBe("Linha 130");
    expect(new Set(drawn.map((entry) => entry.page)).size).toBe(pageCount);
  });

  it("retains Portuguese characters and euro while replacing unsupported glyphs", async () => {
    const { drawn } = await render("Cláusula: ação, João, € 100.\nSímbolo Ω indisponível.");

    expect(drawn.map((entry) => entry.text)).toEqual([
      "Cláusula: ação, João, € 100.",
      "Símbolo ? indisponível.",
    ]);
  });
});
