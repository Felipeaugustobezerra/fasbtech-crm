import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

import type { ContractSnapshot } from "@/types/contracts";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function printableText(value: string, font: PDFFont) {
  return Array.from(value, (character) => {
    try {
      font.encodeText(character);
      return character;
    } catch {
      return "?";
    }
  }).join("");
}

function wrapLine(value: string, font: PDFFont) {
  if (value.length === 0) return [""];

  const words = value.split(/\s+/u);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, FONT_SIZE) <= CONTENT_WIDTH) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

export async function generateContractPdf(
  snapshot: ContractSnapshot,
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const content = printableText(snapshot.content, font);
  const lines = content.split(/\r?\n/u).flatMap((line) => wrapLine(line, font));
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of lines) {
    if (y < MARGIN) {
      page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }

    page.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      lineHeight: LINE_HEIGHT,
      font,
      color: rgb(0.08, 0.1, 0.14),
    });
    y -= LINE_HEIGHT;
  }

  document.setTitle(snapshot.template.name);
  document.setProducer("FASBtech CRM");

  return document.save();
}
