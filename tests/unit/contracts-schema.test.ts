import { describe, expect, it } from "vitest";

import {
  activateContractTemplateSchema,
  cancelContractSchema,
  contractDraftDataSchema,
  contractSnapshotSchema,
  contractStatusSchema,
  createContractSchema,
  createContractTemplateSchema,
  deactivateContractTemplateSchema,
  documentTypeSchema,
  generateContractSchema,
  markContractSentSchema,
  markContractSignedSchema,
  updateContractTemplateSchema,
  updateDraftContractSchema,
} from "@/schemas/contracts";
import { CONTRACT_STATUSES, DOCUMENT_TYPES } from "@/types/contracts";

const clientId = "11111111-1111-4111-8111-111111111111";
const templateId = "22222222-2222-4222-8222-222222222222";
const contractId = "33333333-3333-4333-8333-333333333333";
const documentId = "44444444-4444-4444-8444-444444444444";

const validSnapshot = {
  schema_version: 1,
  content: "  Conteúdo final  ",
  client: {
    id: clientId,
    data: {
      name: "Cliente",
      contacts: [{ type: "email", primary: true }],
    },
    tax_id: "  PT123456789  ",
    tax_id_type: "  NIF  ",
  },
  manual_fields: { reference: "A-001", discount: null },
  template: { id: templateId, name: "  Contrato de Serviços  " },
};

const validDocumentReference = {
  document_id: documentId,
  object_path: `org/contracts/${contractId}/${documentId}/ORIGINAL_PDF.pdf`,
  file_name: "  contrato.pdf  ",
  mime_type: "application/pdf",
  size_bytes: 1024,
} as const;

describe("contract domains", () => {
  it.each(CONTRACT_STATUSES)("accepts the official %s Status", (status) => {
    expect(contractStatusSchema.safeParse(status).success).toBe(true);
  });

  it.each(DOCUMENT_TYPES)("accepts the official %s Document type", (type) => {
    expect(documentTypeSchema.safeParse(type).success).toBe(true);
  });

  it.each([
    [contractStatusSchema, "ARCHIVED"],
    [documentTypeSchema, "CONTRACT_PDF"],
  ])("rejects a value outside the official domain", (schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe("Contract JSON schemas", () => {
  it("accepts recursive JSON in draft_data without unsafe values", () => {
    expect(
      contractDraftDataSchema.safeParse({
        string: "value",
        number: 10,
        boolean: true,
        nullable: null,
        array: ["value", { nested: false }],
      }).success,
    ).toBe(true);
  });

  it.each([undefined, BigInt(1), new Date()])(
    "rejects the non-JSON draft value %s",
    (value) => {
      expect(
        contractDraftDataSchema.safeParse({ invalid: value }).success,
      ).toBe(false);
    },
  );

  it("validates and normalizes the complete snapshot", () => {
    expect(contractSnapshotSchema.parse(validSnapshot)).toEqual({
      ...validSnapshot,
      content: "Conteúdo final",
      client: {
        ...validSnapshot.client,
        tax_id: "PT123456789",
        tax_id_type: "NIF",
      },
      template: {
        ...validSnapshot.template,
        name: "Contrato de Serviços",
      },
    });
  });

  it("preserves explicitly null fiscal values in the snapshot", () => {
    const result = contractSnapshotSchema.parse({
      ...validSnapshot,
      client: { ...validSnapshot.client, tax_id: null, tax_id_type: null },
    });

    expect(result.client.tax_id).toBeNull();
    expect(result.client.tax_id_type).toBeNull();
  });

  it.each([
    { ...validSnapshot, schema_version: 0 },
    { ...validSnapshot, content: "   " },
    { ...validSnapshot, client: { ...validSnapshot.client, id: "invalid" } },
    { ...validSnapshot, template: { ...validSnapshot.template, name: "" } },
    { ...validSnapshot, unexpected: true },
  ])("rejects an invalid snapshot %#", (snapshot) => {
    expect(contractSnapshotSchema.safeParse(snapshot).success).toBe(false);
  });
});

describe("Template operation schemas", () => {
  it("normalizes a valid Template creation", () => {
    expect(
      createContractTemplateSchema.parse({
        name: "  Contrato de Serviços  ",
        content: "  Conteúdo {{client.name}}  ",
      }),
    ).toEqual({
      name: "Contrato de Serviços",
      content: "Conteúdo {{client.name}}",
    });
  });

  it("validates Template update and activation identifiers", () => {
    expect(
      updateContractTemplateSchema.safeParse({
        template_id: templateId,
        name: "Template",
        content: "Content",
      }).success,
    ).toBe(true);
    expect(
      activateContractTemplateSchema.safeParse({ template_id: templateId })
        .success,
    ).toBe(true);
    expect(
      deactivateContractTemplateSchema.safeParse({ template_id: templateId })
        .success,
    ).toBe(true);
  });

  it.each([
    ["organization_id", clientId],
    ["created_by", clientId],
    ["updated_by", clientId],
    ["is_active", true],
    ["created_at", "2026-09-17T10:00:00.000Z"],
  ])("rejects the controlled Template field %s", (field, value) => {
    expect(
      createContractTemplateSchema.safeParse({
        name: "Template",
        content: "Content",
        [field]: value,
      }).success,
    ).toBe(false);
  });
});

describe("DRAFT Contract operation schemas", () => {
  it("accepts and normalizes creation with typed draft_data", () => {
    expect(
      createContractSchema.parse({
        client_id: clientId,
        template_id: templateId,
        title: "  Contrato principal  ",
        draft_data: { scope: ["A", "B"] },
      }),
    ).toEqual({
      client_id: clientId,
      template_id: templateId,
      title: "Contrato principal",
      draft_data: { scope: ["A", "B"] },
    });
  });

  it("defaults omitted draft_data to an empty JSON object", () => {
    expect(
      createContractSchema.parse({
        client_id: clientId,
        template_id: templateId,
        title: "Contrato",
      }).draft_data,
    ).toEqual({});
  });

  it("accepts complete editable content in update", () => {
    expect(
      updateDraftContractSchema.safeParse({
        contract_id: contractId,
        client_id: clientId,
        template_id: templateId,
        title: "Contrato atualizado",
        draft_data: { revision: 2 },
      }).success,
    ).toBe(true);
  });

  it.each([
    ["status", "GENERATED"],
    ["snapshot", validSnapshot],
    ["generated_at", "2026-09-17T10:00:00.000Z"],
    ["sent_at", null],
    ["signed_at", null],
    ["canceled_at", null],
    ["organization_id", clientId],
    ["created_by", clientId],
    ["updated_by", clientId],
  ])("rejects the non-editable DRAFT field %s", (field, value) => {
    expect(
      createContractSchema.safeParse({
        client_id: clientId,
        template_id: templateId,
        title: "Contrato",
        [field]: value,
      }).success,
    ).toBe(false);
  });
});

describe("post-generation operation schemas", () => {
  it("accepts only snapshot and ORIGINAL_PDF reference for generation", () => {
    const result = generateContractSchema.parse({
      contract_id: contractId,
      snapshot: validSnapshot,
      ...validDocumentReference,
    });

    expect(result.snapshot.content).toBe("Conteúdo final");
    expect(result.file_name).toBe("contrato.pdf");
  });

  it.each([
    ["title", "Novo título"],
    ["client_id", clientId],
    ["template_id", templateId],
    ["draft_data", {}],
    ["status", "GENERATED"],
    ["generated_at", "2026-09-17T10:00:00.000Z"],
  ])("rejects the generation field %s", (field, value) => {
    expect(
      generateContractSchema.safeParse({
        contract_id: contractId,
        snapshot: validSnapshot,
        ...validDocumentReference,
        [field]: value,
      }).success,
    ).toBe(false);
  });

  it("normalizes and validates the recipient e-mail", () => {
    expect(
      markContractSentSchema.parse({
        contract_id: contractId,
        recipient_email: "  CUSTOMER@EXAMPLE.COM  ",
      }),
    ).toEqual({
      contract_id: contractId,
      recipient_email: "customer@example.com",
    });
  });

  it("rejects an invalid recipient e-mail", () => {
    expect(
      markContractSentSchema.safeParse({
        contract_id: contractId,
        recipient_email: "invalid-email",
      }).success,
    ).toBe(false);
  });

  it("requires a valid signed-copy document reference", () => {
    expect(
      markContractSignedSchema.safeParse({
        contract_id: contractId,
        ...validDocumentReference,
        object_path: `org/contracts/${contractId}/${documentId}/SIGNED_COPY.pdf`,
      }).success,
    ).toBe(true);
    expect(
      markContractSignedSchema.safeParse({ contract_id: contractId }).success,
    ).toBe(false);
  });

  it.each([
    { ...validDocumentReference, mime_type: "text/plain" },
    { ...validDocumentReference, size_bytes: 0 },
    { ...validDocumentReference, document_id: "invalid-document" },
  ])("rejects an invalid Document reference %#", (reference) => {
    expect(
      markContractSignedSchema.safeParse({
        contract_id: contractId,
        ...reference,
      }).success,
    ).toBe(false);
  });

  it("allows cancellation with only a valid Contract ID", () => {
    expect(cancelContractSchema.parse({ contract_id: contractId })).toEqual({
      contract_id: contractId,
    });
  });

  it.each([
    [markContractSentSchema, { recipient_email: "client@example.com" }],
    [markContractSignedSchema, validDocumentReference],
    [cancelContractSchema, {}],
  ])("rejects administrative fields after generation", (schema, input) => {
    expect(
      schema.safeParse({
        contract_id: contractId,
        ...input,
        organization_id: clientId,
      }).success,
    ).toBe(false);
  });
});
