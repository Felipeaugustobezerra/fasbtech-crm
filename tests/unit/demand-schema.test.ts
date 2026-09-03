import { describe, expect, it } from "vitest";

import {
  archiveDemandSchema,
  changeDemandStatusSchema,
  createDemandSchema,
  demandPrioritySchema,
  demandStatusSchema,
  setDemandAssigneesSchema,
  setDemandTagsSchema,
  updateDemandSchema,
} from "@/schemas/demand";
import {
  DEMAND_PRIORITIES,
  DEMAND_STATUSES,
} from "@/types/demand";

const clientId = "11111111-1111-4111-8111-111111111111";
const membershipId = "22222222-2222-4222-8222-222222222222";
const otherMembershipId = "33333333-3333-4333-8333-333333333333";
const demandId = "44444444-4444-4444-8444-444444444444";
const tagId = "55555555-5555-4555-8555-555555555555";
const otherTagId = "66666666-6666-4666-8666-666666666666";

describe("demand domain schemas", () => {
  it.each(DEMAND_STATUSES)("accepts the official %s Status", (status) => {
    expect(demandStatusSchema.safeParse(status).success).toBe(true);
  });

  it("rejects a Status outside the official domain", () => {
    expect(demandStatusSchema.safeParse("ARCHIVED").success).toBe(false);
  });

  it.each(DEMAND_PRIORITIES)(
    "accepts the official %s Priority",
    (priority) => {
      expect(demandPrioritySchema.safeParse(priority).success).toBe(true);
    },
  );

  it("rejects a Priority outside the official domain", () => {
    expect(demandPrioritySchema.safeParse("CRITICAL").success).toBe(false);
  });
});

describe("createDemandSchema", () => {
  it("accepts and normalizes a valid Demand", () => {
    const result = createDemandSchema.safeParse({
      client_id: clientId,
      title: "  Preparar proposta  ",
      description: "  Proposta comercial  ",
      priority: "HIGH",
      start_date: " 2026-09-03 ",
      due_date: "2026-09-30",
      notes: "  Confirmar escopo  ",
      assignee_membership_ids: [membershipId, otherMembershipId],
    });

    expect(result).toEqual({
      success: true,
      data: {
        client_id: clientId,
        title: "Preparar proposta",
        description: "Proposta comercial",
        priority: "HIGH",
        start_date: "2026-09-03",
        due_date: "2026-09-30",
        notes: "Confirmar escopo",
        assignee_membership_ids: [membershipId, otherMembershipId],
      },
    });
  });

  it("allows Priority to be omitted so the database applies MEDIUM", () => {
    const result = createDemandSchema.safeParse({
      client_id: clientId,
      title: "Preparar proposta",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.priority).toBeUndefined();
  });

  it("normalizes empty and null optional fields to undefined", () => {
    const result = createDemandSchema.safeParse({
      client_id: clientId,
      title: "Preparar proposta",
      description: "   ",
      start_date: "",
      due_date: null,
      notes: null,
    });

    expect(result).toEqual({
      success: true,
      data: {
        client_id: clientId,
        title: "Preparar proposta",
        description: undefined,
        start_date: undefined,
        due_date: undefined,
        notes: undefined,
      },
    });
  });

  it("rejects an empty title", () => {
    expect(
      createDemandSchema.safeParse({
        client_id: clientId,
        title: "   ",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid Client UUID", () => {
    expect(
      createDemandSchema.safeParse({
        client_id: "invalid-client",
        title: "Preparar proposta",
      }).success,
    ).toBe(false);
  });

  it("rejects Status in the creation payload", () => {
    expect(
      createDemandSchema.safeParse({
        client_id: clientId,
        title: "Preparar proposta",
        status: "OPEN",
      }).success,
    ).toBe(false);
  });

  it.each([
    ["id", demandId],
    ["organization_id", clientId],
    ["created_by", membershipId],
    ["updated_by", membershipId],
    ["created_at", "2026-09-03T10:00:00.000Z"],
    ["updated_at", "2026-09-03T10:00:00.000Z"],
    ["archived_at", null],
  ])("rejects the system-controlled field %s", (field, value) => {
    const result = createDemandSchema.safeParse({
      client_id: clientId,
      title: "Preparar proposta",
      [field]: value,
    });

    expect(result.success).toBe(false);
  });

  it("accepts a civil DATE", () => {
    expect(
      createDemandSchema.safeParse({
        client_id: clientId,
        title: "Preparar proposta",
        start_date: "2026-09-03",
        due_date: "2026-09-30",
      }).success,
    ).toBe(true);
  });

  it("rejects a timestamp in a DATE field", () => {
    expect(
      createDemandSchema.safeParse({
        client_id: clientId,
        title: "Preparar proposta",
        due_date: "2026-09-30T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects a nonexistent civil date", () => {
    expect(
      createDemandSchema.safeParse({
        client_id: clientId,
        title: "Preparar proposta",
        due_date: "2026-02-29",
      }).success,
    ).toBe(false);
  });
});

describe("updateDemandSchema", () => {
  it("accepts only editable Demand content", () => {
    const result = updateDemandSchema.safeParse({
      title: "  Proposta atualizada  ",
      description: "  Novo escopo  ",
      priority: "URGENT",
      start_date: "2026-09-04",
      due_date: "2026-10-01",
      notes: "  Validar com o Cliente  ",
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ["client_id", clientId],
    ["organization_id", clientId],
    ["status", "IN_PROGRESS"],
    ["assignee_membership_ids", [membershipId]],
    ["existing_tag_ids", [tagId]],
    ["archived_at", "2026-09-03T10:00:00.000Z"],
  ])("rejects the non-editable field %s", (field, value) => {
    const result = updateDemandSchema.safeParse({
      title: "Proposta atualizada",
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});

describe("changeDemandStatusSchema", () => {
  it("accepts a valid Status change", () => {
    expect(
      changeDemandStatusSchema.safeParse({
        demand_id: demandId,
        status: "IN_PROGRESS",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid Status", () => {
    expect(
      changeDemandStatusSchema.safeParse({
        demand_id: demandId,
        status: "ARCHIVED",
      }).success,
    ).toBe(false);
  });
});

describe("setDemandAssigneesSchema", () => {
  it.each([
    { membershipIds: [] },
    { membershipIds: [membershipId, otherMembershipId] },
  ])(
    "accepts the 0..N assignee cardinality",
    ({ membershipIds }) => {
      expect(
        setDemandAssigneesSchema.safeParse({
          demand_id: demandId,
          membership_ids: membershipIds,
        }).success,
      ).toBe(true);
    },
  );

  it("rejects an invalid Membership UUID", () => {
    expect(
      setDemandAssigneesSchema.safeParse({
        demand_id: demandId,
        membership_ids: ["invalid-membership"],
      }).success,
    ).toBe(false);
  });

  it("preserves duplicate Membership IDs for the database to reject", () => {
    const result = setDemandAssigneesSchema.safeParse({
      demand_id: demandId,
      membership_ids: [membershipId, membershipId],
    });

    expect(result).toEqual({
      success: true,
      data: {
        demand_id: demandId,
        membership_ids: [membershipId, membershipId],
      },
    });
  });
});

describe("setDemandTagsSchema", () => {
  it("accepts existing Tag IDs and removes exact duplicates", () => {
    const result = setDemandTagsSchema.safeParse({
      demand_id: demandId,
      existing_tag_ids: [tagId, otherTagId, tagId],
      new_tag_names: [],
    });

    expect(result).toEqual({
      success: true,
      data: {
        demand_id: demandId,
        existing_tag_ids: [tagId, otherTagId],
        new_tag_names: [],
      },
    });
  });

  it("trims new Tag names and removes empty and exact duplicate entries", () => {
    const result = setDemandTagsSchema.safeParse({
      demand_id: demandId,
      existing_tag_ids: [],
      new_tag_names: ["  Urgente  ", "", "   ", "Cliente", "Urgente"],
    });

    expect(result).toEqual({
      success: true,
      data: {
        demand_id: demandId,
        existing_tag_ids: [],
        new_tag_names: ["Urgente", "Cliente"],
      },
    });
  });

  it("preserves capitalization while normalizing new Tag names", () => {
    const result = setDemandTagsSchema.safeParse({
      demand_id: demandId,
      existing_tag_ids: [],
      new_tag_names: ["Urgente", "urgente"],
    });

    expect(result).toEqual({
      success: true,
      data: {
        demand_id: demandId,
        existing_tag_ids: [],
        new_tag_names: ["Urgente", "urgente"],
      },
    });
  });

  it("rejects an invalid existing Tag UUID", () => {
    expect(
      setDemandTagsSchema.safeParse({
        demand_id: demandId,
        existing_tag_ids: ["invalid-tag"],
        new_tag_names: [],
      }).success,
    ).toBe(false);
  });
});

describe("archiveDemandSchema", () => {
  it("accepts a valid Demand ID", () => {
    expect(archiveDemandSchema.safeParse({ demand_id: demandId }).success).toBe(
      true,
    );
  });

  it("rejects an invalid Demand ID", () => {
    expect(
      archiveDemandSchema.safeParse({ demand_id: "invalid-demand" }).success,
    ).toBe(false);
  });

  it("rejects a browser-controlled archive timestamp", () => {
    expect(
      archiveDemandSchema.safeParse({
        demand_id: demandId,
        archived_at: "2026-09-03T10:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});
