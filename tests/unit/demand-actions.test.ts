import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  archiveDemandAction,
  changeDemandStatusAction,
  createDemandAction,
  getEligibleDemandAssigneesAction,
  setDemandAssigneesAction,
  setDemandTagsAction,
  updateDemandAction,
} from "@/app/(private)/demandas/actions";

const mocks = vi.hoisted(() => ({
  createDemand: vi.fn(),
  updateDemand: vi.fn(),
  changeDemandStatus: vi.fn(),
  setDemandAssignees: vi.fn(),
  setDemandTags: vi.fn(),
  archiveDemand: vi.fn(),
}));
const queryMocks = vi.hoisted(() => ({ listEligibleDemandAssignees: vi.fn() }));

vi.mock("@/services/demands/demand.service", () => mocks);
vi.mock("@/lib/demands/queries", () => queryMocks);

const id = "11111111-1111-4111-8111-111111111111";
const secondId = "22222222-2222-4222-8222-222222222222";
const success = { success: true, data: { demandId: id } };
const content = { title: "  Demanda  ", description: " ", notes: null };

describe("demand actions", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) {
      mock.mockReset().mockResolvedValue(id);
    }
    queryMocks.listEligibleDemandAssignees.mockReset().mockResolvedValue([]);
  });

  it("creates with normalized content, civil dates and multiple assignees", async () => {
    const result = await createDemandAction({
      ...content,
      client_id: id,
      start_date: " 2026-09-09 ",
      due_date: "",
      assignee_membership_ids: [id, secondId],
    });
    expect(result).toEqual(success);
    expect(mocks.createDemand).toHaveBeenCalledExactlyOnceWith({
      title: "Demanda", client_id: id,
      description: undefined, notes: undefined,
      start_date: "2026-09-09", due_date: undefined,
      assignee_membership_ids: [id, secondId],
    });
  });

  it("creates with no assignees and omitted optional fields", async () => {
    expect(await createDemandAction({ client_id: id, title: "Demanda" })).toEqual(success);
    expect(mocks.createDemand).toHaveBeenCalledExactlyOnceWith({
      client_id: id, title: "Demanda", assignee_membership_ids: [],
    });
  });

  it.each([
    { title: "", client_id: id },
    { title: "Demanda", client_id: "invalid" },
    { title: "Demanda", client_id: id, status: "OPEN" },
    { title: "Demanda", client_id: id, organization_id: id },
    { title: "Demanda", client_id: id, created_by: id },
    { title: "Demanda", client_id: id, role: "OWNER" },
    { title: "Demanda", client_id: id, start_date: "null" },
    { title: "Demanda", client_id: id, due_date: "undefined" },
    null,
  ])("rejects invalid create input without calling a Service: %j", async (input) => {
    expect(await createDemandAction(input)).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR" },
    });
    for (const mock of Object.values(mocks)) expect(mock).not.toHaveBeenCalled();
  });

  it("returns stable field errors and a safe global error for unexpected fields", async () => {
    expect(await createDemandAction({ title: " ", client_id: id })).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR", message: "Verifique os campos informados.",
        fieldErrors: { title: ["Informe o título da Demanda."] },
      },
    });
    const result = await createDemandAction({ title: "Demanda", client_id: id, secret_field: "secret" });
    expect(result).toMatchObject({ success: false, error: { code: "VALIDATION_ERROR", fieldErrors: {} } });
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("updates only validated content with an explicit ID", async () => {
    expect(await updateDemandAction(id, content)).toEqual(success);
    expect(mocks.updateDemand).toHaveBeenCalledExactlyOnceWith(id, {
      title: "Demanda", description: undefined, notes: undefined,
    });
  });

  it.each([
    { client_id: id }, { status: "OPEN" }, { title: "" },
    { membership_ids: [] }, { existing_tag_ids: [] }, { updated_by: id },
  ])("rejects invalid update payload %j", async (extra) => {
    expect(await updateDemandAction(id, { ...content, ...extra })).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR" },
    });
    expect(mocks.updateDemand).not.toHaveBeenCalled();
  });

  it("rejects an invalid update ID", async () => {
    expect(await updateDemandAction("invalid", content)).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR", fieldErrors: { demand_id: ["Informe uma Demanda válida."] } },
    });
    expect(mocks.updateDemand).not.toHaveBeenCalled();
  });

  it("changes status using its Service", async () => {
    const input = { demand_id: id, status: "COMPLETED" };
    expect(await changeDemandStatusAction(input)).toEqual(success);
    expect(mocks.changeDemandStatus).toHaveBeenCalledExactlyOnceWith(input);
  });

  it("rejects an invalid status", async () => {
    expect(await changeDemandStatusAction({ demand_id: id, status: "INVALID" })).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR" },
    });
    expect(mocks.changeDemandStatus).not.toHaveBeenCalled();
  });

  it.each([{ membership_ids: [] }, { membership_ids: [id, secondId] }])("sets an assignee array %j", async ({ membership_ids }) => {
    const input = { demand_id: id, membership_ids };
    expect(await setDemandAssigneesAction(input)).toEqual(success);
    expect(mocks.setDemandAssignees).toHaveBeenCalledExactlyOnceWith(input);
  });

  it("rejects an invalid assignee UUID", async () => {
    expect(await setDemandAssigneesAction({ demand_id: id, membership_ids: ["invalid"] })).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR" },
    });
    expect(mocks.setDemandAssignees).not.toHaveBeenCalled();
  });

  it.each([
    { existing_tag_ids: [id], new_tag_names: [] },
    { existing_tag_ids: [], new_tag_names: ["Website"] },
    { existing_tag_ids: [], new_tag_names: [] },
  ])("sets tags %j", async (tags) => {
    const input = { demand_id: id, ...tags };
    expect(await setDemandTagsAction(input)).toEqual(success);
    expect(mocks.setDemandTags).toHaveBeenCalledExactlyOnceWith(input);
  });

  it("uses schema tag normalization without case folding", async () => {
    expect(await setDemandTagsAction({
      demand_id: id, existing_tag_ids: [id, id],
      new_tag_names: [" Website ", "", "Website", "website"],
    })).toEqual(success);
    expect(mocks.setDemandTags).toHaveBeenCalledExactlyOnceWith({
      demand_id: id, existing_tag_ids: [id], new_tag_names: ["Website", "website"],
    });
  });

  it("archives by ID only", async () => {
    expect(await archiveDemandAction({ demand_id: id })).toEqual(success);
    expect(mocks.archiveDemand).toHaveBeenCalledExactlyOnceWith({ demand_id: id });
  });

  it("rejects an invalid archive ID", async () => {
    expect(await archiveDemandAction({ demand_id: "invalid" })).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR" },
    });
    expect(mocks.archiveDemand).not.toHaveBeenCalled();
  });

  const operations = [
    { service: "updateDemand", run: (extra: object) => updateDemandAction(id, { ...content, ...extra }) },
    { service: "changeDemandStatus", run: (extra: object) => changeDemandStatusAction({ demand_id: id, status: "OPEN", ...extra }) },
    { service: "setDemandAssignees", run: (extra: object) => setDemandAssigneesAction({ demand_id: id, membership_ids: [], ...extra }) },
    { service: "setDemandTags", run: (extra: object) => setDemandTagsAction({ demand_id: id, existing_tag_ids: [], new_tag_names: [], ...extra }) },
    { service: "archiveDemand", run: (extra: object) => archiveDemandAction({ demand_id: id, ...extra }) },
  ] satisfies Array<{ service: keyof typeof mocks; run: (extra: object) => ReturnType<typeof archiveDemandAction> }>;

  it.each(operations)("rejects authorization fields for $service", async ({ run }) => {
    expect(await run({ organization_id: id, role: "OWNER", user_id: id })).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR" },
    });
    for (const mock of Object.values(mocks)) expect(mock).not.toHaveBeenCalled();
  });

  it.each(operations)("safely returns a $service failure", async ({ service, run }) => {
    mocks[service].mockRejectedValue(new Error("NOT_FOUND", { cause: "private details" }));
    expect(await run({})).toEqual({
      success: false, error: { code: "NOT_FOUND", message: "O registro solicitado não foi encontrado." },
    });
    expect(mocks[service]).toHaveBeenCalledOnce();
  });

  it.each([
    "VALIDATION_ERROR", "AUTHENTICATION_REQUIRED", "AUTHORIZATION_DENIED",
    "NOT_FOUND", "CONFLICT", "DATABASE_ERROR", "UNEXPECTED_ERROR",
  ])("preserves Service code %s without leaking internal details", async (code) => {
    mocks.createDemand.mockRejectedValue(new Error(code, { cause: { sql: "secret SQL", trigger: "secret trigger" } }));
    const result = await createDemandAction({ client_id: id, title: "Demanda" });
    expect(result).toMatchObject({ success: false, error: { code, message: expect.any(String) } });
    expect(JSON.stringify(result)).not.toMatch(/secret|cause|stack|trigger|sql/);
  });

  it.each([new Error("internal RPC details"), "internal failure", null])("sanitizes unknown Service failures", async (failure) => {
    mocks.createDemand.mockRejectedValue(failure);
    expect(await createDemandAction({ client_id: id, title: "Demanda" })).toEqual({
      success: false, error: { code: "UNEXPECTED_ERROR", message: "Ocorreu um erro inesperado. Tente novamente." },
    });
  });

  it("returns only eligible assignees from the existing secure Query", async () => {
    const assignees = [{ membership_id: secondId, full_name: "Ana", role: "MEMBER" }];
    queryMocks.listEligibleDemandAssignees.mockResolvedValue(assignees);
    expect(await getEligibleDemandAssigneesAction(id)).toEqual({ success: true, data: { assignees } });
    expect(queryMocks.listEligibleDemandAssignees).toHaveBeenCalledExactlyOnceWith(id);
  });

  it("validates the Client ID before eligible assignee lookup", async () => {
    expect(await getEligibleDemandAssigneesAction("invalid")).toMatchObject({
      success: false, error: { code: "VALIDATION_ERROR", fieldErrors: { client_id: ["Informe um Cliente válido."] } },
    });
    expect(queryMocks.listEligibleDemandAssignees).not.toHaveBeenCalled();
  });

  it("sanitizes eligible assignee lookup errors", async () => {
    queryMocks.listEligibleDemandAssignees.mockRejectedValue(new Error("private database details"));
    const result = await getEligibleDemandAssigneesAction(id);
    expect(result).toEqual({ success: false, error: { code: "DATABASE_ERROR", message: "Não foi possível carregar os responsáveis elegíveis." } });
    expect(JSON.stringify(result)).not.toContain("private database details");
  });

  it("records a failed RPC operation without its private cause", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.createDemand.mockRejectedValueOnce(
      new Error("DATABASE_ERROR", { cause: new Error("private SQL detail") }),
    );

    await createDemandAction({ client_id: id, title: "Demanda" });

    const logged = spy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(logged)).toMatchObject({
      module: "demands",
      operation: "create",
      code: "DATABASE_ERROR",
    });
    expect(logged).not.toContain("private SQL detail");
    spy.mockRestore();
  });
});
