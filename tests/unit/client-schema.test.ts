import { describe, expect, it } from "vitest";

import { clientSchema } from "@/schemas/client";

describe("clientSchema", () => {
  it("accepts a valid client", () => {
    const result = clientSchema.safeParse({
      name: "  Cliente Exemplo  ",
      company_name: "  Empresa Exemplo  ",
      email: "  cliente@example.com  ",
      phone: "  +351 900 000 000  ",
      tax_id: "  123456789  ",
      tax_id_type: "  NIF  ",
      address_line_1: "  Rua Exemplo, 10  ",
      address_line_2: "  Sala 2  ",
      city: "  Porto  ",
      region: "  Porto  ",
      postal_code: "  4000-000  ",
      country_code: "  PT  ",
      notes: "  Cliente prioritário  ",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      name: "Cliente Exemplo",
      company_name: "Empresa Exemplo",
      email: "cliente@example.com",
      phone: "+351 900 000 000",
      tax_id: "123456789",
      tax_id_type: "NIF",
      address_line_1: "Rua Exemplo, 10",
      address_line_2: "Sala 2",
      city: "Porto",
      region: "Porto",
      postal_code: "4000-000",
      country_code: "PT",
      notes: "Cliente prioritário",
    });
  });

  it("normalizes empty optional fields to undefined", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      company_name: "   ",
      email: "",
      phone: " ",
      tax_id: "",
      tax_id_type: "   ",
      address_line_1: "",
      address_line_2: " ",
      city: "",
      region: "   ",
      postal_code: "",
      country_code: " ",
      notes: "",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      name: "Cliente Exemplo",
      company_name: undefined,
      email: undefined,
      phone: undefined,
      tax_id: undefined,
      tax_id_type: undefined,
      address_line_1: undefined,
      address_line_2: undefined,
      city: undefined,
      region: undefined,
      postal_code: undefined,
      country_code: undefined,
      notes: undefined,
    });
  });

  it("rejects an empty name", () => {
    const result = clientSchema.safeParse({
      name: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email when informed", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      email: "email-invalido",
    });

    expect(result.success).toBe(false);
  });

  it("rejects tax_id without tax_id_type", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      tax_id: "123456789",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(
      result.error.issues.some(
        (issue) =>
          issue.path[0] === "tax_id_type" &&
          issue.message === "Informe o tipo da identificação fiscal.",
      ),
    ).toBe(true);
  });

  it("rejects tax_id_type without tax_id", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      tax_id_type: "NIF",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(
      result.error.issues.some(
        (issue) =>
          issue.path[0] === "tax_id" &&
          issue.message === "Informe a identificação fiscal.",
      ),
    ).toBe(true);
  });

  it("accepts tax_id and an open tax_id_type together", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      tax_id: "123456789",
      tax_id_type: "IDENTIFICADOR_PERSONALIZADO",
    });

    expect(result.success).toBe(true);
  });

  it("rejects the system-controlled field id", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });

    expect(result.success).toBe(false);
  });

  it("rejects the system-controlled field organization_id", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });

    expect(result.success).toBe(false);
  });

  it("rejects the system-controlled field created_by", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      created_by: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(false);
  });

  it("rejects the system-controlled field updated_by", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      updated_by: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(false);
  });

  it("rejects the system-controlled field created_at", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      created_at: "2026-08-16T12:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("rejects the system-controlled field updated_at", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      updated_at: "2026-08-16T12:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("rejects the system-controlled field archived_at", () => {
    const result = clientSchema.safeParse({
      name: "Cliente Exemplo",
      archived_at: "2026-08-16T12:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});
