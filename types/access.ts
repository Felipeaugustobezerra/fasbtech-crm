import type { Database } from "@/types/database.types";

export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ClientAssignment =
  Database["public"]["Tables"]["client_assignments"]["Row"];

export const ORGANIZATION_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export type OrganizationMemberSummary = {
  membershipId: OrganizationMember["id"];
  userId: OrganizationMember["user_id"];
  fullName: Profile["full_name"];
  role: OrganizationRole;
  status: OrganizationMember["status"];
  membershipCreatedAt: OrganizationMember["created_at"];
};

export type ClientAccessSummary = {
  assignmentId: ClientAssignment["id"];
  membershipId: OrganizationMember["id"];
  userId: OrganizationMember["user_id"];
  fullName: Profile["full_name"];
  role: OrganizationRole;
  assignedAt: ClientAssignment["created_at"];
};
