import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateDemandInput,
  SetDemandTagsInput,
  UpdateDemandInput,
} from "@/schemas/demand";
import {
  archiveDemand,
  changeDemandStatus,
  createDemand,
  setDemandAssignees,
  setDemandTags,
  updateDemand,
} from "@/services/demands/demand.service";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const demandId = "11111111-1111-4111-8111-111111111111";
const clientId = "22222222-2222-4222-8222-222222222222";
const firstMembershipId = "33333333-3333-4333-8333-333333333333";
const secondMembershipId = "33333333-3333-4333-8333-333333333334";
const firstTagId = "44444444-4444-4444-8444-444444444444";
const secondTagId = "44444444-4444-4444-8444-444444444445";

const demandContent: UpdateDemandInput = {
  title: "Atualizar website",
  description: "Atualizar o website institucional.",
  priority: "HIGH",
  start_date: "2026-09-10",
  due_date: "2026-09-30",
  notes: "Publicar após aprovação.",
};

const createInput: CreateDemandInput = {
  client_id: clientId,
  ...demandContent,
  assignee_membership_ids: [firstMembershipId, secondMembershipId],
};

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

describe("demand service", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
    mocks.rpc.mockReset();
    mocks.createSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: demandId, error: null });
  });

  it("creates a Demand through create_demand with the exact functional payload", async () => {
    const result = await createDemand(createInput);

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("create_demand", {
      p_client_id: clientId,
      p_title: "Atualizar website",
      p_description: "Atualizar o website institucional.",
      p_priority: "HIGH",
      p_start_date: "2026-09-10",
      p_due_date: "2026-09-30",
      p_notes: "Publicar após aprovação.",
      p_assignee_membership_ids: [
        firstMembershipId,
        secondMembershipId,
      ],
    });
    expect(result).toBe(demandId);
  });

  it("leaves optional create arguments undefined for database defaults", async () => {
    await createDemand({
      client_id: clientId,
      title: "Demanda mínima",
      description: undefined,
      notes: undefined,
    });

    expect(mocks.rpc).toHaveBeenCalledWith("create_demand", {
      p_client_id: clientId,
      p_title: "Demanda mínima",
      p_description: undefined,
      p_priority: undefined,
      p_start_date: undefined,
      p_due_date: undefined,
      p_notes: undefined,
      p_assignee_membership_ids: undefined,
    });
  });

  it("does not forward create authorization, audit or system fields", async () => {
    const untrustedInput = {
      ...createInput,
      organization_id: "caller-organization",
      status: "COMPLETED",
      created_by: "caller-creator",
      updated_by: "caller-updater",
      user_id: "caller-user",
      role: "OWNER",
      archived_at: "2026-09-09T00:00:00.000Z",
    };

    await createDemand(untrustedInput);

    const args = mocks.rpc.mock.calls[0]?.[1];

    expect(args).not.toHaveProperty("organization_id");
    expect(args).not.toHaveProperty("status");
    expect(args).not.toHaveProperty("created_by");
    expect(args).not.toHaveProperty("updated_by");
    expect(args).not.toHaveProperty("user_id");
    expect(args).not.toHaveProperty("role");
    expect(args).not.toHaveProperty("archived_at");
  });

  it("updates only editable Demand content through update_demand", async () => {
    const untrustedInput = {
      ...demandContent,
      client_id: "caller-client",
      organization_id: "caller-organization",
      status: "CANCELED",
      assignee_membership_ids: [firstMembershipId],
      existing_tag_ids: [firstTagId],
      archived_at: "2026-09-09T00:00:00.000Z",
    };

    const result = await updateDemand(demandId, untrustedInput);

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("update_demand", {
      p_demand_id: demandId,
      p_title: "Atualizar website",
      p_description: "Atualizar o website institucional.",
      p_priority: "HIGH",
      p_start_date: "2026-09-10",
      p_due_date: "2026-09-30",
      p_notes: "Publicar após aprovação.",
    });
    expect(result).toBe(demandId);
  });

  it("changes Status through its independent RPC without a TypeScript state machine", async () => {
    const result = await changeDemandStatus({
      demand_id: demandId,
      status: "COMPLETED",
    });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("change_demand_status", {
      p_demand_id: demandId,
      p_status: "COMPLETED",
    });
    expect(result).toBe(demandId);
  });

  it.each([
    { label: "empty", membershipIds: [] },
    {
      label: "multiple",
      membershipIds: [firstMembershipId, secondMembershipId],
    },
  ])(
    "forwards an $label assignee set without local eligibility logic",
    async ({ membershipIds }) => {
      const result = await setDemandAssignees({
        demand_id: demandId,
        membership_ids: membershipIds,
      });

      expect(mocks.rpc).toHaveBeenCalledOnce();
      expect(mocks.rpc).toHaveBeenCalledWith("set_demand_assignees", {
        p_demand_id: demandId,
        p_membership_ids: membershipIds,
      });
      expect(result).toBe(demandId);
    },
  );

  it.each([
    {
      label: "existing IDs",
      input: {
        demand_id: demandId,
        existing_tag_ids: [firstTagId, secondTagId],
        new_tag_names: [],
      },
    },
    {
      label: "new names",
      input: {
        demand_id: demandId,
        existing_tag_ids: [],
        new_tag_names: ["Urgente", "urgente"],
      },
    },
    {
      label: "existing IDs and new names",
      input: {
        demand_id: demandId,
        existing_tag_ids: [firstTagId],
        new_tag_names: ["Website"],
      },
    },
    {
      label: "empty sets",
      input: {
        demand_id: demandId,
        existing_tag_ids: [],
        new_tag_names: [],
      },
    },
  ] satisfies Array<{ label: string; input: SetDemandTagsInput }>)(
    "forwards $label to set_demand_tags without authoritative normalization",
    async ({ input }) => {
      const result = await setDemandTags(input);

      expect(mocks.rpc).toHaveBeenCalledOnce();
      expect(mocks.rpc).toHaveBeenCalledWith("set_demand_tags", {
        p_demand_id: demandId,
        p_tag_ids: input.existing_tag_ids,
        p_new_tag_names: input.new_tag_names,
      });
      expect(result).toBe(demandId);
    },
  );

  it("archives through archive_demand using only the Demand ID", async () => {
    const result = await archiveDemand({ demand_id: demandId });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("archive_demand", {
      p_demand_id: demandId,
    });
    expect(result).toBe(demandId);
  });

  it.each([
    {
      label: "create",
      operation: () => createDemand(createInput),
      rpcMessage: "CLIENT_NOT_FOUND_OR_FORBIDDEN",
      expectedCode: "NOT_FOUND",
    },
    {
      label: "update",
      operation: () => updateDemand(demandId, demandContent),
      rpcMessage: "DEMAND_NOT_FOUND_OR_FORBIDDEN",
      expectedCode: "NOT_FOUND",
    },
    {
      label: "Status change",
      operation: () =>
        changeDemandStatus({ demand_id: demandId, status: "REVIEW" }),
      rpcMessage: "DEMAND_STATUS_INVALID",
      expectedCode: "VALIDATION_ERROR",
    },
    {
      label: "assignee replacement",
      operation: () =>
        setDemandAssignees({
          demand_id: demandId,
          membership_ids: [firstMembershipId],
        }),
      rpcMessage: "DEMAND_ASSIGNEE_INVALID",
      expectedCode: "VALIDATION_ERROR",
    },
    {
      label: "Tag replacement",
      operation: () =>
        setDemandTags({
          demand_id: demandId,
          existing_tag_ids: [],
          new_tag_names: ["Website"],
        }),
      rpcMessage: "DEMAND_TAG_RESOLUTION_FAILED",
      expectedCode: "DATABASE_ERROR",
    },
    {
      label: "archive",
      operation: () => archiveDemand({ demand_id: demandId }),
      rpcMessage: "DEMAND_NOT_FOUND_OR_FORBIDDEN",
      expectedCode: "NOT_FOUND",
    },
  ])(
    "maps the $label RPC error safely and preserves its cause",
    async ({ operation, rpcMessage, expectedCode }) => {
      const originalError = { code: "P0001", message: rpcMessage };
      mocks.rpc.mockResolvedValue({ data: null, error: originalError });

      const error = await captureError(operation());

      expect(error.message).toBe(expectedCode);
      expect(error.cause).toBe(originalError);
    },
  );

  it("maps the controlled authentication error explicitly", async () => {
    const originalError = {
      code: "P0001",
      message: "AUTHENTICATION_REQUIRED",
    };
    mocks.rpc.mockResolvedValue({ data: null, error: originalError });

    const error = await captureError(createDemand(createInput));

    expect(error.message).toBe("AUTHENTICATION_REQUIRED");
    expect(error.cause).toBe(originalError);
  });

  it("maps unknown database errors without exposing their message", async () => {
    const originalError = {
      code: "23505",
      message: "internal constraint detail",
    };
    mocks.rpc.mockResolvedValue({ data: null, error: originalError });

    const error = await captureError(createDemand(createInput));

    expect(error.message).toBe("DATABASE_ERROR");
    expect(error.cause).toBe(originalError);
  });

  it("treats an empty RPC result as a database failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });

    const error = await captureError(createDemand(createInput));

    expect(error.message).toBe("DATABASE_ERROR");
    expect(error.cause).toBeInstanceOf(Error);
    expect(error.cause).toEqual(new Error("DEMAND_RPC_EMPTY_RESULT"));
  });

  it("maps an unexpected server-client failure and preserves its cause", async () => {
    const originalError = new Error("server client unavailable");
    mocks.createSupabaseClient.mockRejectedValue(originalError);

    const error = await captureError(createDemand(createInput));

    expect(error.message).toBe("UNEXPECTED_ERROR");
    expect(error.cause).toBe(originalError);
  });
});
