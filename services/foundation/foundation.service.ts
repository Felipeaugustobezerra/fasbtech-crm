import { createClient } from "@/lib/supabase/server";

import {
  getOrganizationById,
  getOwnMemberships,
  getOwnProfile,
} from "./foundation.queries";

type FoundationRole = "OWNER" | "ADMIN" | "MEMBER";

type Membership = Awaited<ReturnType<typeof getOwnMemberships>>[number];

type ReadyMembership = Omit<Membership, "role"> & {
  role: FoundationRole;
};

type FoundationContext =
  | {
      status: "UNAUTHENTICATED";
    }
  | {
      status: "READY";
      userEmail?: string;
      profile: NonNullable<Awaited<ReturnType<typeof getOwnProfile>>>;
      membership: ReadyMembership;
      organization: NonNullable<
        Awaited<ReturnType<typeof getOrganizationById>>
      >;
    }
  | {
      status: "PENDING_ACCESS";
      userEmail?: string;
    }
  | {
      status: "ACCESS_DENIED";
      userEmail?: string;
      reason:
        | "PROFILE_INACTIVE"
        | "MEMBERSHIP_SUSPENDED"
        | "MEMBERSHIP_ARCHIVED"
        | "ORGANIZATION_INACTIVE"
        | "INVALID_FOUNDATION_STATE";
    };

function isFoundationRole(role: string): role is FoundationRole {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}

export async function resolveFoundationContext(): Promise<FoundationContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "UNAUTHENTICATED",
    };
  }

  const userEmail = user.email;

  let profile = await getOwnProfile(supabase, user.id);
  let memberships = await getOwnMemberships(supabase, user.id);

  if (profile && profile.status !== "ACTIVE") {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "PROFILE_INACTIVE",
    };
  }

  if (memberships.length === 0) {
    const { error: bootstrapError } = await supabase.rpc(
      "bootstrap_initial_organization",
    );

    if (bootstrapError) {
      if (
        bootstrapError.code === "P0001" &&
        bootstrapError.message.includes("BOOTSTRAP_ALREADY_INITIALIZED")
      ) {
        return {
          status: "PENDING_ACCESS",
          userEmail,
        };
      }

      throw new Error("FOUNDATION_BOOTSTRAP_FAILED", {
        cause: bootstrapError,
      });
    }

    profile = await getOwnProfile(supabase, user.id);
    memberships = await getOwnMemberships(supabase, user.id);
  }

  if (!profile || memberships.length !== 1) {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "INVALID_FOUNDATION_STATE",
    };
  }

  const membership = memberships[0];

  if (membership.status === "INVITED") {
    return {
      status: "PENDING_ACCESS",
      userEmail,
    };
  }

  if (membership.status === "SUSPENDED") {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "MEMBERSHIP_SUSPENDED",
    };
  }

  if (membership.status === "ARCHIVED") {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "MEMBERSHIP_ARCHIVED",
    };
  }

  if (membership.status !== "ACTIVE") {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "INVALID_FOUNDATION_STATE",
    };
  }

  if (!isFoundationRole(membership.role)) {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "INVALID_FOUNDATION_STATE",
    };
  }

  const organization = await getOrganizationById(
    supabase,
    membership.organization_id,
  );

  if (!organization) {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "INVALID_FOUNDATION_STATE",
    };
  }

  if (organization.status !== "ACTIVE") {
    return {
      status: "ACCESS_DENIED",
      userEmail,
      reason: "ORGANIZATION_INACTIVE",
    };
  }

  const readyMembership: ReadyMembership = {
    ...membership,
    role: membership.role,
  };

  return {
    status: "READY",
    userEmail,
    profile,
    membership: readyMembership,
    organization,
  };
}
