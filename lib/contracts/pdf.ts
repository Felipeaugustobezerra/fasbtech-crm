import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

import type { ContractSnapshot } from "@/types/contracts";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const PARAGRAPH_GAP = 8;
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
  if (value.trim().length === 0) return [""];

  const words = value.trim().split(/\s+/u);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, FONT_SIZE) <= CONTENT_WIDTH) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = "";
    }

    if (font.widthOfTextAtSize(word, FONT_SIZE) <= CONTENT_WIDTH) {
      current = word;
      continue;
    }

    for (const character of word) {
      const next = current + character;
      if (current && font.widthOfTextAtSize(next, FONT_SIZE) > CONTENT_WIDTH) {
        lines.push(current);
        current = character;
      } else {
        current = next;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

export async function generateContractPdf(
  snapshot: ContractSnapshot,
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const lines = snapshot.content
    .replace(/\r\n?/gu, "\n")
    .split("\n")
    .flatMap((line) => wrapLine(printableText(line, font), font));
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of lines) {
    if (line === "") {
      y -= LINE_HEIGHT + PARAGRAPH_GAP;
      continue;
    }

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
