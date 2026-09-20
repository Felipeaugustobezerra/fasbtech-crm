import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLisbonDashboardPeriod,
  loadDashboard,
} from "@/lib/dashboard/dashboard";

const mocks = vi.hoisted(() => ({
  clients: vi.fn(),
  demands: vi.fn(),
  contracts: vi.fn(),
  activities: vi.fn(),
  financial: vi.fn(),
}));

vi.mock("@/lib/dashboard/queries", () => ({
  getActiveClientCount: mocks.clients,
  getDemandDashboardSummary: mocks.demands,
  getContractDashboardSummary: mocks.contracts,
  getRecentDashboardActivities: mocks.activities,
}));
vi.mock("@/lib/financial/queries", () => ({
  getFinancialSummary: mocks.financial,
}));

const demandSummary = {
  active: 2,
  overdue: 1,
  byStatus: {
    OPEN: 1,
    IN_PROGRESS: 1,
    WAITING_CLIENT: 0,
    REVIEW: 0,
    COMPLETED: 2,
    CANCELED: 0,
  },
};

describe("dashboard data orchestration", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.clients.mockResolvedValue(3);
    mocks.demands.mockResolvedValue(demandSummary);
    mocks.contracts.mockResolvedValue({
      nonTerminal: 1,
      byStatus: { DRAFT: 1, GENERATED: 0, SENT: 0, SIGNED: 1, CANCELED: 0 },
    });
    mocks.activities.mockResolvedValue([]);
    mocks.financial.mockResolvedValue({
      monthly_income: "100.00",
      monthly_expense: "20.00",
      cash_balance: "80.00",
      goal_target: "200.00",
      goal_progress: "0.5",
    });
  });

  it("resolves the civil date and month in Europe/Lisbon", () => {
    expect(getLisbonDashboardPeriod(new Date("2026-06-30T23:30:00Z"))).toMatchObject({
      civilDate: "2026-07-01",
      year: 2026,
      month: 7,
    });
  });

  it("loads all authorized OWNER sections with the Lisbon period", async () => {
    const result = await loadDashboard(
      "OWNER",
      new Date("2026-06-30T23:30:00Z"),
    );

    expect(mocks.financial).toHaveBeenCalledWith({ year: 2026, month: 7 });
    expect(mocks.demands).toHaveBeenCalledWith("2026-07-01");
    expect(mocks.contracts).toHaveBeenCalledOnce();
    expect(result.financial?.status).toBe("success");
    expect(result.contracts?.status).toBe("success");
  });

  it("never starts Financeiro or Contratos queries for MEMBER", async () => {
    const result = await loadDashboard("MEMBER");

    expect(mocks.clients).toHaveBeenCalledOnce();
    expect(mocks.demands).toHaveBeenCalledOnce();
    expect(mocks.activities).toHaveBeenCalledOnce();
    expect(mocks.financial).not.toHaveBeenCalled();
    expect(mocks.contracts).not.toHaveBeenCalled();
    expect(result.financial).toBeNull();
    expect(result.contracts).toBeNull();
  });

  it("starts no operational queries for ADMIN", async () => {
    const result = await loadDashboard("ADMIN");

    for (const mock of Object.values(mocks)) expect(mock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      clients: null,
      demands: null,
      financial: null,
      contracts: null,
      activities: null,
    });
  });

  it("isolates a failed section without fabricating a zero", async () => {
    mocks.demands.mockRejectedValue(new Error("database unavailable"));

    const result = await loadDashboard("MEMBER");

    expect(result.demands).toEqual({ status: "error" });
    expect(result.clients).toEqual({ status: "success", data: 3 });
  });
});
