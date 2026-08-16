import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type DatabaseClient = SupabaseClient<Database>;

export async function getOwnProfile(supabase: DatabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("FOUNDATION_PROFILE_QUERY_FAILED", {
      cause: error,
    });
  }

  return data;
}

export async function getOwnMemberships(
  supabase: DatabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      "id, organization_id, user_id, role, status, created_at, archived_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("FOUNDATION_MEMBERSHIP_QUERY_FAILED", {
      cause: error,
    });
  }

  return data;
}

export async function getOrganizationById(
  supabase: DatabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, status, archived_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error("FOUNDATION_ORGANIZATION_QUERY_FAILED", {
      cause: error,
    });
  }

  return data;
}
