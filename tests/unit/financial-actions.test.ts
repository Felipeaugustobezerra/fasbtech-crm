import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  archiveFinancialEntryAction,
  changeFinancialEntryStatusAction,
  createFinancialEntryAction,
  setFinancialGoalAction,
  updateFinancialEntryAction,
} from "@/app/(private)/financeiro/actions";

const mocks = vi.hoisted(() => ({
  createFinancialEntry: vi.fn(),
  updateFinancialEntry: vi.fn(),
  changeFinancialEntryStatus: vi.fn(),
  archiveFinancialEntry: vi.fn(),
  setFinancialGoal: vi.fn(),
}));

vi.mock("@/services/financial/financial.service", () => mocks);

const entryId = "11111111-1111-4111-8111-111111111111";
const goalId = "22222222-2222-4222-8222-222222222222";
const entryInput = {
  type: "INCOME",
  description: "  Projeto Website  ",
  amount: "1250.50",
  reference_date: " 2026-09-15 ",
  client_id: "",
  payment_nature: "ONE_TIME",
  category: " ",
  due_date: "",
  notes: null,
};

describe("financial actions", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) {
      mock.mockReset().mockResolvedValue(entryId);
    }
    mocks.setFinancialGoal.mockResolvedValue(goalId);
  });

  it("creates a financial entry with server-validated normalized input", async () => {
    expect(await createFinancialEntryAction(entryInput)).toEqual({
      success: true,
      data: { financialEntryId: entryId },
    });
    expect(mocks.createFinancialEntry).toHaveBeenCalledExactlyOnceWith({
      type: "INCOME",
      description: "Projeto Website",
      amount: "1250.50",
      reference_date: "2026-09-15",
      client_id: null,
      payment_nature: "ONE_TIME",
      category: null,
      due_date: null,
      notes: null,
    });
  });

  it.each([
    { ...entryInput, description: "" },
    { ...entryInput, amount: "12.345" },
    { ...entryInput, status: "REALIZED" },
    { ...entryInput, organization_id: entryId },
    { ...entryInput, created_by: entryId },
  ])("rejects invalid create input without calling the Service: %j", async (input) => {
    expect(await createFinancialEntryAction(input)).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    expect(mocks.createFinancialEntry).not.toHaveBeenCalled();
  });

  it("returns stable field errors", async () => {
    expect(await createFinancialEntryAction({ ...entryInput, description: " " }))
      .toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          fieldErrors: { description: ["Informe a descrição da movimentação."] },
        },
      });
  });

  it("updates using an explicit validated ID and normalized content", async () => {
    expect(await updateFinancialEntryAction(entryId, entryInput)).toEqual({
      success: true,
      data: { financialEntryId: entryId },
    });
    expect(mocks.updateFinancialEntry).toHaveBeenCalledExactlyOnceWith(entryId, {
      type: "INCOME",
      description: "Projeto Website",
      amount: "1250.50",
      reference_date: "2026-09-15",
      client_id: null,
      payment_nature: "ONE_TIME",
      category: null,
      due_date: null,
      notes: null,
    });
  });

  it("rejects invalid update IDs and payloads", async () => {
    expect(await updateFinancialEntryAction("invalid", entryInput)).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: { entry_id: ["Informe uma movimentação financeira válida."] },
      },
    });
    expect(await updateFinancialEntryAction(entryId, {
      ...entryInput,
      realized_date: "2026-09-15",
    })).toMatchObject({ success: false, error: { code: "VALIDATION_ERROR" } });
    expect(mocks.updateFinancialEntry).not.toHaveBeenCalled();
  });

  it("changes status only through its Service", async () => {
    const input = {
      entry_id: entryId,
      status: "REALIZED",
      realized_date: " 2026-09-15 ",
    };
    expect(await changeFinancialEntryStatusAction(input)).toEqual({
      success: true,
      data: { financialEntryId: entryId },
    });
    expect(mocks.changeFinancialEntryStatus).toHaveBeenCalledExactlyOnceWith({
      entry_id: entryId,
      status: "REALIZED",
      realized_date: "2026-09-15",
    });
  });

  it("rejects an invalid status/date combination", async () => {
    expect(await changeFinancialEntryStatusAction({
      entry_id: entryId,
      status: "PENDING",
      realized_date: "2026-09-15",
    })).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: { realized_date: [expect.any(String)] },
      },
    });
    expect(mocks.changeFinancialEntryStatus).not.toHaveBeenCalled();
  });

  it("archives using only the validated entry ID", async () => {
    expect(await archiveFinancialEntryAction({ entry_id: entryId })).toEqual({
      success: true,
      data: { financialEntryId: entryId },
    });
    expect(mocks.archiveFinancialEntry).toHaveBeenCalledExactlyOnceWith({
      entry_id: entryId,
    });
  });

  it("sets a financial goal with a decimal-safe amount", async () => {
    const input = { year: 2026, month: 9, target_amount: "10000.00" };
    expect(await setFinancialGoalAction(input)).toEqual({
      success: true,
      data: { financialGoalId: goalId },
    });
    expect(mocks.setFinancialGoal).toHaveBeenCalledExactlyOnceWith(input);
  });

  const operations = [
    {
      service: "changeFinancialEntryStatus",
      run: (extra: object) => changeFinancialEntryStatusAction({
        entry_id: entryId,
        status: "PENDING",
        ...extra,
      }),
    },
    {
      service: "archiveFinancialEntry",
      run: (extra: object) => archiveFinancialEntryAction({ entry_id: entryId, ...extra }),
    },
    {
      service: "setFinancialGoal",
      run: (extra: object) => setFinancialGoalAction({
        year: 2026,
        month: 9,
        target_amount: "10000.00",
        ...extra,
      }),
    },
  ] satisfies Array<{
    service: keyof typeof mocks;
    run: (extra: object) => Promise<unknown>;
  }>;

  it.each(operations)("rejects unexpected authorization fields for $service", async ({ run }) => {
    expect(await run({ organization_id: entryId, role: "OWNER" })).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    for (const mock of Object.values(mocks)) expect(mock).not.toHaveBeenCalled();
  });

  it.each([
    "VALIDATION_ERROR",
    "AUTHENTICATION_REQUIRED",
    "AUTHORIZATION_DENIED",
    "NOT_FOUND",
    "CONFLICT",
    "DATABASE_ERROR",
    "UNEXPECTED_ERROR",
  ])("preserves safe Service code %s without leaking internal details", async (code) => {
    mocks.createFinancialEntry.mockRejectedValue(
      new Error(code, { cause: { sql: "secret SQL", detail: "private detail" } }),
    );
    const result = await createFinancialEntryAction(entryInput);

    expect(result).toMatchObject({
      success: false,
      error: { code, message: expect.any(String) },
    });
    expect(JSON.stringify(result)).not.toMatch(/secret|private|cause|stack|sql/i);
  });

  it.each([new Error("internal RPC details"), "internal failure", null])(
    "sanitizes an unknown Service failure",
    async (failure) => {
      mocks.createFinancialEntry.mockRejectedValue(failure);
      expect(await createFinancialEntryAction(entryInput)).toEqual({
        success: false,
        error: {
          code: "UNEXPECTED_ERROR",
          message: "Ocorreu um erro inesperado. Tente novamente.",
        },
      });
    },
  );

  it("records an RPC failure without financial content", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.createFinancialEntry.mockRejectedValueOnce(new Error("DATABASE_ERROR"));

    await createFinancialEntryAction(entryInput);

    const logged = spy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(logged)).toMatchObject({
      module: "financial",
      operation: "create_entry",
      code: "DATABASE_ERROR",
    });
    expect(logged).not.toContain("Projeto Website");
    expect(logged).not.toContain("1250.50");
    spy.mockRestore();
  });
});
