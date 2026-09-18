import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildContractDocumentPath,
  downloadContractDocument,
  removeOrphanContractDocument,
  uploadContractDocument,
} from "@/lib/contracts/storage";

const storageMocks = vi.hoisted(() => ({
  from: vi.fn(),
  upload: vi.fn(),
  download: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    storage: { from: storageMocks.from },
  })),
}));

describe("contract storage", () => {
  beforeEach(() => {
    storageMocks.from.mockReset().mockReturnValue(storageMocks);
    storageMocks.upload.mockReset().mockResolvedValue({ error: null });
    storageMocks.download.mockReset().mockResolvedValue({
      data: { arrayBuffer: async () => new TextEncoder().encode("pdf").buffer },
      error: null,
    });
    storageMocks.remove.mockReset().mockResolvedValue({ error: null });
  });

  it("builds the canonical path and uploads without replacement", async () => {
    const path = buildContractDocumentPath({
      organizationId: "org",
      contractId: "contract",
      documentId: "document",
      kind: "ORIGINAL_PDF",
    });
    await uploadContractDocument(path, new Uint8Array([1, 2, 3]));

    expect(path).toBe("org/contracts/contract/document/ORIGINAL_PDF.pdf");
    expect(storageMocks.from).toHaveBeenCalledWith("private-files");
    const [, uploaded, options] = storageMocks.upload.mock.calls[0];
    expect(Array.from(uploaded as Uint8Array)).toEqual([1, 2, 3]);
    expect(options).toEqual({ contentType: "application/pdf", upsert: false });
  });

  it("downloads private bytes and removes only the explicit orphan path", async () => {
    await expect(downloadContractDocument("private/path.pdf")).resolves.toEqual(
      new Uint8Array([112, 100, 102]),
    );
    await removeOrphanContractDocument("private/path.pdf");

    expect(storageMocks.download).toHaveBeenCalledWith("private/path.pdf");
    expect(storageMocks.remove).toHaveBeenCalledWith(["private/path.pdf"]);
  });
});
