import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addOrganizationMember,
  assignClientAccess,
  removeClientAccess,
  updateOrganizationMemberRole,
} from "@/services/access/access.service";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const clientId = "11111111-1111-4111-8111-111111111111";
const membershipId = "22222222-2222-4222-8222-222222222222";
const assignmentId = "33333333-3333-4333-8333-333333333333";

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

describe("access service", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
    mocks.rpc.mockReset();
    mocks.createSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
  });

  it("adds an Organization Member with only email and role", async () => {
    mocks.rpc.mockResolvedValue({ data: membershipId, error: null });

    const result = await addOrganizationMember({
      email: "member@example.com",
      role: "MEMBER",
    });

    expect(mocks.rpc).toHaveBeenCalledWith("add_organization_member", {
      p_email: "member@example.com",
      p_role: "MEMBER",
    });
    expect(result).toBe(membershipId);
  });

  it("updates a Membership role with the exact RPC arguments", async () => {
    mocks.rpc.mockResolvedValue({ data: membershipId, error: null });

    const result = await updateOrganizationMemberRole(membershipId, "ADMIN");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "update_organization_member_role",
      {
        p_membership_id: membershipId,
        p_role: "ADMIN",
      },
    );
    expect(result).toBe(membershipId);
  });

  it("assigns Client access through the Membership relationship", async () => {
    mocks.rpc.mockResolvedValue({ data: assignmentId, error: null });

    const result = await assignClientAccess(clientId, membershipId);

    expect(mocks.rpc).toHaveBeenCalledWith("assign_client_access", {
      p_client_id: clientId,
      p_membership_id: membershipId,
    });
    expect(result).toBe(assignmentId);
  });

  it("removes Client access using only Client and Membership IDs", async () => {
    mocks.rpc.mockResolvedValue({ data: assignmentId, error: null });

    const result = await removeClientAccess(clientId, membershipId);

    expect(mocks.rpc).toHaveBeenCalledWith("remove_client_access", {
      p_client_id: clientId,
      p_membership_id: membershipId,
    });
    expect(result).toBe(assignmentId);
  });

  it("does not forward caller-controlled administrative fields", async () => {
    mocks.rpc.mockResolvedValue({ data: membershipId, error: null });
    const input = {
      email: "member@example.com",
      role: "MEMBER",
      organization_id: "organization-from-caller",
      user_id: "user-from-caller",
      created_by: "creator-from-caller",
      status: "ACTIVE",
    } as const;

    await addOrganizationMember(input);

    expect(mocks.rpc).toHaveBeenCalledWith("add_organization_member", {
      p_email: "member@example.com",
      p_role: "MEMBER",
    });
  });

  it.each([
    {
      operation: () =>
        addOrganizationMember({
          email: "member@example.com",
          role: "MEMBER",
        }),
      serviceError: "ACCESS_MEMBER_ADD_FAILED",
    },
    {
      operation: () => updateOrganizationMemberRole(membershipId, "MEMBER"),
      serviceError: "ACCESS_MEMBER_ROLE_UPDATE_FAILED",
    },
    {
      operation: () => assignClientAccess(clientId, membershipId),
      serviceError: "CLIENT_ACCESS_ASSIGN_FAILED",
    },
    {
      operation: () => removeClientAccess(clientId, membershipId),
      serviceError: "CLIENT_ACCESS_REMOVE_FAILED",
    },
  ])(
    "preserves the original RPC error behind $serviceError",
    async ({ operation, serviceError }) => {
      const originalError = {
        code: "P0001",
        message: "internal authorization detail",
      };
      mocks.rpc.mockResolvedValue({ data: null, error: originalError });

      const error = await captureError(operation());

      expect(error.message).toBe(serviceError);
      expect(error.cause).toBe(originalError);
    },
  );

  it.each([
    {
      operation: () =>
        addOrganizationMember({
          email: "member@example.com",
          role: "MEMBER",
        }),
      serviceError: "ACCESS_MEMBER_ADD_FAILED",
    },
    {
      operation: () => updateOrganizationMemberRole(membershipId, "MEMBER"),
      serviceError: "ACCESS_MEMBER_ROLE_UPDATE_FAILED",
    },
    {
      operation: () => assignClientAccess(clientId, membershipId),
      serviceError: "CLIENT_ACCESS_ASSIGN_FAILED",
    },
    {
      operation: () => removeClientAccess(clientId, membershipId),
      serviceError: "CLIENT_ACCESS_REMOVE_FAILED",
    },
  ])(
    "treats an empty RPC result as $serviceError",
    async ({ operation, serviceError }) => {
      mocks.rpc.mockResolvedValue({ data: null, error: null });

      const error = await captureError(operation());

      expect(error.message).toBe(serviceError);
      expect(error.cause).toBeInstanceOf(Error);
      expect((error.cause as Error).message).toBe("ACCESS_RPC_EMPTY_RESULT");
    },
  );
});
