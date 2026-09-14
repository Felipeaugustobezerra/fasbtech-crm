import { describe, expect, it } from "vitest";

import {
  archiveFinancialEntrySchema,
  changeFinancialEntryStatusSchema,
  createFinancialEntrySchema,
  financialDecimalSchema,
  financialPaymentNatureSchema,
  financialStatusSchema,
  financialTypeSchema,
  setFinancialGoalSchema,
  updateFinancialEntrySchema,
} from "@/schemas/financial";
import {
  FINANCIAL_PAYMENT_NATURES,
  FINANCIAL_STATUSES,
  FINANCIAL_TYPES,
} from "@/types/financial";

const entryId = "11111111-1111-4111-8111-111111111111";
const clientId = "22222222-2222-4222-8222-222222222222";

const validEntry = {
  type: "INCOME",
  description: "Consultoria",
  amount: "1250.50",
  reference_date: "2026-09-14",
} as const;

describe("financial domains", () => {
  it.each(FINANCIAL_TYPES)("accepts the official %s type", (type) => {
    expect(financialTypeSchema.safeParse(type).success).toBe(true);
  });

  it.each(FINANCIAL_STATUSES)("accepts the official %s Status", (status) => {
    expect(financialStatusSchema.safeParse(status).success).toBe(true);
  });

  it.each(FINANCIAL_PAYMENT_NATURES)(
    "accepts the official %s payment nature",
    (paymentNature) => {
      expect(financialPaymentNatureSchema.safeParse(paymentNature).success).toBe(
        true,
      );
    },
  );

  it.each([
    [financialTypeSchema, "TRANSFER"],
    [financialStatusSchema, "ARCHIVED"],
    [financialPaymentNatureSchema, "INSTALLMENT"],
  ])("rejects a value outside a financial domain", (schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe("financialDecimalSchema", () => {
  it.each(["1", "0.01", "10.5", "9999999999.99"])(
    "accepts the positive decimal string %s",
    (amount) => {
      expect(financialDecimalSchema.safeParse(amount).success).toBe(true);
    },
  );

  it("trims a valid decimal without converting it to number", () => {
    expect(financialDecimalSchema.parse(" 1250.50 ")).toBe("1250.50");
  });

  it.each([
    10.5,
    "0",
    "0.00",
    "-1",
    "1.001",
    "1,50",
    "1e2",
    "10000000000.00",
  ])("rejects the unsafe or invalid monetary value %s", (amount) => {
    expect(financialDecimalSchema.safeParse(amount).success).toBe(false);
  });
});

describe("createFinancialEntrySchema", () => {
  it("accepts and normalizes a valid financial entry", () => {
    expect(
      createFinancialEntrySchema.safeParse({
        ...validEntry,
        description: "  Consultoria mensal  ",
        client_id: clientId,
        payment_nature: "RECURRING",
        category: "  Serviços  ",
        due_date: " 2026-09-30 ",
        notes: "  Contrato mensal  ",
      }),
    ).toEqual({
      success: true,
      data: {
        ...validEntry,
        description: "Consultoria mensal",
        client_id: clientId,
        payment_nature: "RECURRING",
        category: "Serviços",
        due_date: "2026-09-30",
        notes: "Contrato mensal",
      },
    });
  });

  it("normalizes empty optional text and dates to null", () => {
    const result = createFinancialEntrySchema.parse({
      ...validEntry,
      category: "   ",
      due_date: "",
      notes: null,
    });

    expect(result.category).toBeNull();
    expect(result.due_date).toBeNull();
    expect(result.notes).toBeNull();
  });

  it("accepts an internal movement without a Client", () => {
    expect(createFinancialEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it("normalizes an empty optional Client to null", () => {
    expect(
      createFinancialEntrySchema.parse({ ...validEntry, client_id: "   " })
        .client_id,
    ).toBeNull();
  });

  it("rejects an empty description", () => {
    expect(
      createFinancialEntrySchema.safeParse({
        ...validEntry,
        description: "   ",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid Client UUID", () => {
    expect(
      createFinancialEntrySchema.safeParse({
        ...validEntry,
        client_id: "invalid-client",
      }).success,
    ).toBe(false);
  });

  it.each([
    ["reference_date", "2026-02-29"],
    ["reference_date", "2026-09-14T12:00:00.000Z"],
    ["due_date", "2026-13-01"],
  ])("rejects an invalid civil DATE in %s", (field, value) => {
    expect(
      createFinancialEntrySchema.safeParse({
        ...validEntry,
        [field]: value,
      }).success,
    ).toBe(false);
  });

  it.each([
    ["status", "PENDING"],
    ["realized_date", "2026-09-14"],
    ["organization_id", clientId],
    ["created_by", clientId],
    ["updated_by", clientId],
    ["created_at", "2026-09-14T10:00:00.000Z"],
    ["updated_at", "2026-09-14T10:00:00.000Z"],
    ["archived_at", null],
  ])("rejects the controlled creation field %s", (field, value) => {
    expect(
      createFinancialEntrySchema.safeParse({
        ...validEntry,
        [field]: value,
      }).success,
    ).toBe(false);
  });
});

describe("updateFinancialEntrySchema", () => {
  it("accepts complete editable financial content", () => {
    expect(
      updateFinancialEntrySchema.safeParse({
        ...validEntry,
        type: "EXPENSE",
        client_id: null,
        category: "  Operacional  ",
      }),
    ).toEqual({
      success: true,
      data: {
        ...validEntry,
        type: "EXPENSE",
        client_id: null,
        category: "Operacional",
      },
    });
  });

  it.each([
    ["entry_id", entryId],
    ["status", "REALIZED"],
    ["realized_date", "2026-09-14"],
    ["organization_id", clientId],
    ["created_by", clientId],
    ["updated_by", clientId],
    ["archived_at", null],
  ])("rejects the non-editable update field %s", (field, value) => {
    expect(
      updateFinancialEntrySchema.safeParse({
        ...validEntry,
        [field]: value,
      }).success,
    ).toBe(false);
  });
});

describe("changeFinancialEntryStatusSchema", () => {
  it("accepts PENDING without a realized date", () => {
    expect(
      changeFinancialEntryStatusSchema.safeParse({
        entry_id: entryId,
        status: "PENDING",
      }).success,
    ).toBe(true);
  });

  it("accepts REALIZED with a civil realized date", () => {
    expect(
      changeFinancialEntryStatusSchema.safeParse({
        entry_id: entryId,
        status: "REALIZED",
        realized_date: "2026-09-14",
      }).success,
    ).toBe(true);
  });

  it("requires realized_date for REALIZED", () => {
    expect(
      changeFinancialEntryStatusSchema.safeParse({
        entry_id: entryId,
        status: "REALIZED",
      }).success,
    ).toBe(false);
  });

  it.each(["PENDING", "CANCELED"])(
    "rejects realized_date for %s",
    (status) => {
      expect(
        changeFinancialEntryStatusSchema.safeParse({
          entry_id: entryId,
          status,
          realized_date: "2026-09-14",
        }).success,
      ).toBe(false);
    },
  );

  it("accepts CANCELED with null so the RPC preserves the stored date", () => {
    expect(
      changeFinancialEntryStatusSchema.safeParse({
        entry_id: entryId,
        status: "CANCELED",
        realized_date: null,
      }).success,
    ).toBe(true);
  });

  it("rejects controlled fields in a Status change", () => {
    expect(
      changeFinancialEntryStatusSchema.safeParse({
        entry_id: entryId,
        status: "PENDING",
        organization_id: clientId,
      }).success,
    ).toBe(false);
  });
});

describe("archiveFinancialEntrySchema", () => {
  it("accepts only a valid entry ID", () => {
    expect(archiveFinancialEntrySchema.parse({ entry_id: entryId })).toEqual({
      entry_id: entryId,
    });
  });

  it("rejects archive timestamps supplied by the caller", () => {
    expect(
      archiveFinancialEntrySchema.safeParse({
        entry_id: entryId,
        archived_at: "2026-09-14T10:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("setFinancialGoalSchema", () => {
  it("accepts a valid monthly goal without converting the amount", () => {
    expect(
      setFinancialGoalSchema.parse({
        year: 2026,
        month: 9,
        target_amount: "5000.00",
      }),
    ).toEqual({ year: 2026, month: 9, target_amount: "5000.00" });
  });

  it.each([
    { year: 0, month: 9, target_amount: "100" },
    { year: 2026.5, month: 9, target_amount: "100" },
    { year: 2026, month: 0, target_amount: "100" },
    { year: 2026, month: 13, target_amount: "100" },
    { year: 2026, month: 9, target_amount: "0" },
  ])("rejects an invalid goal %#", (goal) => {
    expect(setFinancialGoalSchema.safeParse(goal).success).toBe(false);
  });

  it("rejects administrative goal fields", () => {
    expect(
      setFinancialGoalSchema.safeParse({
        year: 2026,
        month: 9,
        target_amount: "100",
        organization_id: clientId,
      }).success,
    ).toBe(false);
  });
});
