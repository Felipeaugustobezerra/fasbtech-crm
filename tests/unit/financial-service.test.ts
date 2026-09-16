import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateFinancialEntryInput,
  UpdateFinancialEntryInput,
} from "@/schemas/financial";
import {
  archiveFinancialEntry,
  changeFinancialEntryStatus,
  createFinancialEntry,
  setFinancialGoal,
  updateFinancialEntry,
} from "@/services/financial/financial.service";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const entryId = "11111111-1111-4111-8111-111111111111";
const clientId = "22222222-2222-4222-8222-222222222222";
const goalId = "33333333-3333-4333-8333-333333333333";

const entryContent: UpdateFinancialEntryInput = {
  type: "INCOME",
  description: "Consultoria mensal",
  amount: "1250.50",
  reference_date: "2026-09-14",
  client_id: clientId,
  payment_nature: "RECURRING",
  category: "Serviços",
  due_date: "2026-09-30",
  notes: "Contrato mensal",
};

const createInput: CreateFinancialEntryInput = { ...entryContent };

async function captureError(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }

    throw error;
  }

  throw new Error("EXPECTED_OPERATION_TO_FAIL");
}

describe("financial service", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
    mocks.rpc.mockReset();
    mocks.createSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: entryId, error: null });
  });

  it("creates an entry through one create_financial_entry RPC", async () => {
    const result = await createFinancialEntry(createInput);

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("create_financial_entry", {
      p_type: "INCOME",
      p_description: "Consultoria mensal",
      p_amount: "1250.50",
      p_reference_date: "2026-09-14",
      p_client_id: clientId,
      p_payment_nature: "RECURRING",
      p_category: "Serviços",
      p_due_date: "2026-09-30",
      p_notes: "Contrato mensal",
    });
    expect(result).toBe(entryId);
  });

  it("preserves optional values and the decimal string on create", async () => {
    await createFinancialEntry({
      type: "EXPENSE",
      description: "Despesa interna",
      amount: "10.00",
      reference_date: "2026-09-14",
      client_id: null,
      category: null,
      due_date: null,
      notes: undefined,
    });

    expect(mocks.rpc).toHaveBeenCalledWith("create_financial_entry", {
      p_type: "EXPENSE",
      p_description: "Despesa interna",
      p_amount: "10.00",
      p_reference_date: "2026-09-14",
      p_client_id: null,
      p_payment_nature: undefined,
      p_category: null,
      p_due_date: null,
      p_notes: undefined,
    });
  });

  it("updates only editable fields through one update RPC", async () => {
    const untrustedInput = {
      ...entryContent,
      status: "REALIZED",
      realized_date: "2026-09-14",
      organization_id: "caller-organization",
      created_by: "caller-creator",
      updated_by: "caller-updater",
      archived_at: "2026-09-14T10:00:00.000Z",
    };

    const result = await updateFinancialEntry(entryId, untrustedInput);

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("update_financial_entry", {
      p_entry_id: entryId,
      p_type: "INCOME",
      p_description: "Consultoria mensal",
      p_amount: "1250.50",
      p_reference_date: "2026-09-14",
      p_client_id: clientId,
      p_payment_nature: "RECURRING",
      p_category: "Serviços",
      p_due_date: "2026-09-30",
      p_notes: "Contrato mensal",
    });
    expect(result).toBe(entryId);

    const args = mocks.rpc.mock.calls[0]?.[1];

    expect(args).not.toHaveProperty("status");
    expect(args).not.toHaveProperty("realized_date");
    expect(args).not.toHaveProperty("organization_id");
    expect(args).not.toHaveProperty("created_by");
    expect(args).not.toHaveProperty("updated_by");
    expect(args).not.toHaveProperty("archived_at");
  });

  it.each([
    {
      status: "PENDING" as const,
      realized_date: undefined,
    },
    {
      status: "REALIZED" as const,
      realized_date: "2026-09-14",
    },
    {
      status: "CANCELED" as const,
      realized_date: null,
    },
  ])("maps the $status change to its dedicated RPC", async (input) => {
    const result = await changeFinancialEntryStatus({
      entry_id: entryId,
      ...input,
    });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith(
      "change_financial_entry_status",
      {
        p_entry_id: entryId,
        p_status: input.status,
        p_realized_date: input.realized_date,
      },
    );
    expect(result).toBe(entryId);
  });

  it("archives through one RPC with only the entry ID", async () => {
    const result = await archiveFinancialEntry({ entry_id: entryId });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("archive_financial_entry", {
      p_entry_id: entryId,
    });
    expect(result).toBe(entryId);
  });

  it("sets a goal without converting its decimal amount", async () => {
    mocks.rpc.mockResolvedValue({ data: goalId, error: null });

    const result = await setFinancialGoal({
      year: 2026,
      month: 9,
      target_amount: "5000.00",
    });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("set_financial_goal", {
      p_year: 2026,
      p_month: 9,
      p_target_amount: "5000.00",
    });
    expect(result).toBe(goalId);
  });

  it("does not forward caller authorization or audit fields", async () => {
    const untrustedInput = {
      ...createInput,
      organization_id: "caller-organization",
      user_id: "caller-user",
      role: "OWNER",
      created_by: "caller-creator",
      updated_by: "caller-updater",
    };

    await createFinancialEntry(untrustedInput);

    const args = mocks.rpc.mock.calls[0]?.[1];

    expect(args).not.toHaveProperty("organization_id");
    expect(args).not.toHaveProperty("user_id");
    expect(args).not.toHaveProperty("role");
    expect(args).not.toHaveProperty("created_by");
    expect(args).not.toHaveProperty("updated_by");
  });

  it.each([
    {
      label: "authentication",
      rpcCode: "P0001",
      rpcMessage: "AUTHENTICATION_REQUIRED",
      expectedCode: "AUTHENTICATION_REQUIRED",
    },
    {
      label: "authorization",
      rpcCode: "P0001",
      rpcMessage: "AUTHORIZATION_DENIED",
      expectedCode: "AUTHORIZATION_DENIED",
    },
    {
      label: "hidden or absent entry",
      rpcCode: "P0001",
      rpcMessage: "FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN",
      expectedCode: "NOT_FOUND",
    },
    {
      label: "validation",
      rpcCode: "P0001",
      rpcMessage: "FINANCIAL_AMOUNT_INVALID",
      expectedCode: "VALIDATION_ERROR",
    },
    {
      label: "conflict",
      rpcCode: "23505",
      rpcMessage: "internal unique detail",
      expectedCode: "CONFLICT",
    },
    {
      label: "database",
      rpcCode: "XX000",
      rpcMessage: "internal database detail",
      expectedCode: "DATABASE_ERROR",
    },
  ])(
    "maps $label failures to a safe code and preserves the cause",
    async ({ rpcCode, rpcMessage, expectedCode }) => {
      const originalError = { code: rpcCode, message: rpcMessage };
      mocks.rpc.mockResolvedValue({ data: null, error: originalError });

      const error = await captureError(createFinancialEntry(createInput));

      expect(error.message).toBe(expectedCode);
      expect(error.cause).toBe(originalError);

      if (rpcMessage !== expectedCode) {
        expect(error.message).not.toContain(rpcMessage);
      }
    },
  );

  it("maps a Postgres permission failure to authorization denied", async () => {
    const originalError = {
      code: "42501",
      message: "internal permission detail",
    };
    mocks.rpc.mockResolvedValue({ data: null, error: originalError });

    const error = await captureError(createFinancialEntry(createInput));

    expect(error.message).toBe("AUTHORIZATION_DENIED");
    expect(error.cause).toBe(originalError);
  });

  it("treats an empty RPC result as a database failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });

    const error = await captureError(createFinancialEntry(createInput));

    expect(error.message).toBe("DATABASE_ERROR");
    expect(error.cause).toEqual(new Error("FINANCIAL_RPC_EMPTY_RESULT"));
  });

  it("maps an unexpected client failure and preserves its cause", async () => {
    const originalError = new Error("server client unavailable");
    mocks.createSupabaseClient.mockRejectedValue(originalError);

    const error = await captureError(createFinancialEntry(createInput));

    expect(error.message).toBe("UNEXPECTED_ERROR");
    expect(error.cause).toBe(originalError);
  });
});
