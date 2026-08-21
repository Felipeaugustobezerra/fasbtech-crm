import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addOrganizationMemberAction,
  assignClientAccessAction,
  removeClientAccessAction,
  updateOrganizationMemberRoleAction,
} from "@/app/(private)/acessos/actions";
import type { AddOrganizationMemberInput } from "@/schemas/access";
import type { OrganizationRole } from "@/types/access";

const mocks = vi.hoisted(() => ({
  addOrganizationMember: vi.fn(),
  assignClientAccess: vi.fn(),
  removeClientAccess: vi.fn(),
  revalidatePath: vi.fn(),
  updateOrganizationMemberRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/services/access/access.service", () => ({
  addOrganizationMember: mocks.addOrganizationMember,
  assignClientAccess: mocks.assignClientAccess,
  removeClientAccess: mocks.removeClientAccess,
  updateOrganizationMemberRole: mocks.updateOrganizationMemberRole,
}));

const clientId = "11111111-1111-4111-8111-111111111111";
const membershipId = "22222222-2222-4222-8222-222222222222";
const assignmentId = "33333333-3333-4333-8333-333333333333";

describe("access actions", () => {
  beforeEach(() => {
    mocks.addOrganizationMember.mockReset();
    mocks.assignClientAccess.mockReset();
    mocks.removeClientAccess.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.updateOrganizationMemberRole.mockReset();
  });

  it("validates and normalizes input before adding a member", async () => {
    mocks.addOrganizationMember.mockResolvedValue(membershipId);

    const result = await addOrganizationMemberAction({
      email: "  member@example.com  ",
      role: "MEMBER",
    });

    expect(mocks.addOrganizationMember).toHaveBeenCalledWith({
      email: "member@example.com",
      role: "MEMBER",
    });
    expect(result).toEqual({ success: true, membershipId });
    expect(mocks.revalidatePath).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/acessos");
  });

  it("does not call the add service when input is invalid", async () => {
    const result = await addOrganizationMemberAction({
      email: "invalid-email",
      role: "MEMBER",
    });

    expect(mocks.addOrganizationMember).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        email: ["Informe um e-mail válido."],
      },
    });
  });

  it("rejects unexpected fields before calling the add service", async () => {
    const input = {
      email: "member@example.com",
      role: "MEMBER",
      organization_id: "organization-from-caller",
      user_id: "user-from-caller",
    } as unknown as AddOrganizationMemberInput;

    const result = await addOrganizationMemberAction(input);

    expect(mocks.addOrganizationMember).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
      formErrors: ["Existem campos não permitidos."],
    });
  });

  it("updates a role and revalidates only the Access page", async () => {
    mocks.updateOrganizationMemberRole.mockResolvedValue(membershipId);

    const result = await updateOrganizationMemberRoleAction(
      membershipId,
      "ADMIN",
    );

    expect(mocks.updateOrganizationMemberRole).toHaveBeenCalledWith(
      membershipId,
      "ADMIN",
    );
    expect(result).toEqual({ success: true, membershipId });
    expect(mocks.revalidatePath).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/acessos");
  });

  it("does not call the role service for an invalid role", async () => {
    const result = await updateOrganizationMemberRoleAction(
      membershipId,
      "SUPER_ADMIN" as OrganizationRole,
    );

    expect(mocks.updateOrganizationMemberRole).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        role: ["Informe uma role válida."],
      },
    });
  });

  it("does not call a service for an invalid UUID", async () => {
    const result = await assignClientAccessAction(
      "invalid-client",
      membershipId,
    );

    expect(mocks.assignClientAccess).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        clientId: ["Informe um Cliente válido."],
      },
    });
  });

  it("assigns Client access and revalidates the required paths", async () => {
    mocks.assignClientAccess.mockResolvedValue(assignmentId);

    const result = await assignClientAccessAction(clientId, membershipId);

    expect(mocks.assignClientAccess).toHaveBeenCalledWith(
      clientId,
      membershipId,
    );
    expect(result).toEqual({ success: true, assignmentId });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/acessos");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      2,
      `/clientes/${clientId}`,
    );
  });

  it("removes Client access and revalidates the required paths", async () => {
    mocks.removeClientAccess.mockResolvedValue(assignmentId);

    const result = await removeClientAccessAction(clientId, membershipId);

    expect(mocks.removeClientAccess).toHaveBeenCalledWith(
      clientId,
      membershipId,
    );
    expect(result).toEqual({ success: true, assignmentId });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/acessos");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      2,
      `/clientes/${clientId}`,
    );
  });

  it("returns a generic operational error without leaking internal details", async () => {
    const internalError = new Error("CLIENT_ACCESS_ASSIGN_FAILED", {
      cause: {
        code: "P0001",
        message: "CLIENT_ASSIGNMENT_TARGET_INVALID",
        details: "internal database details",
      },
    });
    mocks.assignClientAccess.mockRejectedValue(internalError);

    const result = await assignClientAccessAction(clientId, membershipId);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível atribuir o acesso. Tente novamente.",
    });
    expect(serializedResult).not.toContain("P0001");
    expect(serializedResult).not.toContain("CLIENT_ASSIGNMENT_TARGET_INVALID");
    expect(serializedResult).not.toContain("internal database details");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
