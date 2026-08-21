import { organizationRoleSchema } from "@/schemas/access";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type {
  ClientAccessSummary,
  OrganizationMember,
  OrganizationMemberSummary,
  Profile,
} from "@/types/access";

type MemberWithProfile = Pick<
  OrganizationMember,
  "id" | "user_id" | "role" | "status" | "created_at"
> & {
  profiles: Pick<Profile, "full_name"> | null;
};

function mapOrganizationMember(
  member: MemberWithProfile,
): OrganizationMemberSummary {
  if (!member.profiles) {
    throw new Error("ACCESS_PROFILE_RELATION_MISSING");
  }

  return {
    membershipId: member.id,
    userId: member.user_id,
    fullName: member.profiles.full_name,
    role: organizationRoleSchema.parse(member.role),
    status: member.status,
    membershipCreatedAt: member.created_at,
  };
}

export async function listOrganizationMembers(): Promise<
  OrganizationMemberSummary[]
> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
          id,
          user_id,
          role,
          status,
          created_at,
          profiles!organization_members_user_id_fkey (
            full_name
          )
        `,
      )
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapOrganizationMember);
  } catch (cause) {
    throw new Error("ACCESS_MEMBERS_QUERY_FAILED", { cause });
  }
}

export async function listClientAccesses(
  clientId: string,
): Promise<ClientAccessSummary[]> {
  try {
    const supabase = await createSupabaseClient();
    const { data: assignments, error: assignmentsError } = await supabase
      .from("client_assignments")
      .select("id, membership_id, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (assignmentsError) {
      throw assignmentsError;
    }

    if (!assignments || assignments.length === 0) {
      return [];
    }

    const membershipIds = assignments.map(
      (assignment) => assignment.membership_id,
    );
    const { data: members, error: membersError } = await supabase
      .from("organization_members")
      .select(
        `
          id,
          user_id,
          role,
          status,
          created_at,
          profiles!organization_members_user_id_fkey (
            full_name
          )
        `,
      )
      .in("id", membershipIds);

    if (membersError) {
      throw membersError;
    }

    const membersById = new Map(
      (members ?? []).map((member) => {
        const summary = mapOrganizationMember(member);

        return [summary.membershipId, summary] as const;
      }),
    );

    return assignments.map((assignment) => {
      const member = membersById.get(assignment.membership_id);

      if (!member) {
        throw new Error("CLIENT_ACCESS_MEMBER_RELATION_MISSING");
      }

      return {
        assignmentId: assignment.id,
        membershipId: member.membershipId,
        userId: member.userId,
        fullName: member.fullName,
        role: member.role,
        assignedAt: assignment.created_at,
      };
    });
  } catch (cause) {
    throw new Error("CLIENT_ACCESS_QUERY_FAILED", { cause });
  }
}
