import type { Database } from "@/types/database.types";

export type ActivityLog =
  Database["public"]["Tables"]["activity_logs"]["Row"];

export type ClientActivitySummary = {
  action: ActivityLog["action"];
  createdAt: ActivityLog["created_at"];
};
