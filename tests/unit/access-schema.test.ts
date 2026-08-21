import { describe, expect, it } from "vitest";

import {
  accessClientIdSchema,
  addOrganizationMemberSchema,
  clientAccessSchema,
  membershipIdSchema,
  organizationRoleSchema,
} from "@/schemas/access";

const clientId = "11111111-1111-4111-8111-111111111111";
const membershipId = "22222222-2222-4222-8222-222222222222";

describe("access schemas", () => {
  it("accepts and trims a valid member email", () => {
    const result = addOrganizationMemberSchema.safeParse({
      email: "  member@example.com  ",
      role: "MEMBER",
    });

    expect(result).toEqual({
      success: true,
      data: {
        email: "member@example.com",
        role: "MEMBER",
      },
    });
  });

  it("rejects an invalid email", () => {
    const result = addOrganizationMemberSchema.safeParse({
      email: "invalid-email",
      role: "MEMBER",
    });

    expect(result.success).toBe(false);
  });

  it.each(["OWNER", "ADMIN", "MEMBER"] as const)(
    "accepts the official %s role",
    (role) => {
      expect(organizationRoleSchema.safeParse(role).success).toBe(true);
    },
  );

  it("rejects a role outside the official set", () => {
    expect(organizationRoleSchema.safeParse("SUPER_ADMIN").success).toBe(
      false,
    );
  });

  it("rejects invalid Membership and Client UUIDs", () => {
    expect(membershipIdSchema.safeParse("invalid-membership").success).toBe(
      false,
    );
    expect(accessClientIdSchema.safeParse("invalid-client").success).toBe(
      false,
    );
    expect(
      clientAccessSchema.safeParse({
        clientId: "invalid-client",
        membershipId: "invalid-membership",
      }).success,
    ).toBe(false);
  });

  it("accepts valid Membership and Client UUIDs", () => {
    expect(
      clientAccessSchema.safeParse({ clientId, membershipId }).success,
    ).toBe(true);
  });

  it.each([
    ["organization_id", "organization-from-caller"],
    ["user_id", "user-from-caller"],
    ["created_by", "creator-from-caller"],
    ["status", "ACTIVE"],
    ["archived_at", null],
  ])("rejects the system-controlled field %s", (field, value) => {
    const result = addOrganizationMemberSchema.safeParse({
      email: "member@example.com",
      role: "MEMBER",
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});
