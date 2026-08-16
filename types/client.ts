import type { Database } from "@/types/database.types";

type PublicTables = Database["public"]["Tables"];

export type Client = PublicTables["clients"]["Row"];
export type ClientAssignment = PublicTables["client_assignments"]["Row"];
