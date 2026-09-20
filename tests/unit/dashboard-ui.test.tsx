import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { DashboardData } from "@/types/dashboard";

const baseData: DashboardData = {
  period: {
    civilDate: "2026-09-20",
    year: 2026,
    month: 9,
    label: "setembro de 2026",
  },
  clients: { status: "success", data: 3 },
  demands: {
    status: "success",
    data: {
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
    },
  },
  financial: {
    status: "success",
    data: {
      monthly_income: "1000.00",
      monthly_expense: "250.00",
      cash_balance: "750.00",
      goal_target: "2000.00",
      goal_progress: "0.5",
    },
  },
  contracts: {
    status: "success",
    data: {
      nonTerminal: 2,
      byStatus: { DRAFT: 1, GENERATED: 1, SENT: 0, SIGNED: 3, CANCELED: 1 },
    },
  },
  activities: {
    status: "success",
    data: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        entityType: "DEMAND",
        entityId: "22222222-2222-4222-8222-222222222222",
        action: "UPDATED",
        createdAt: "2026-09-20T10:00:00Z",
      },
    ],
  },
};

describe("dashboard UI", () => {
  it("renders the complete OWNER view from supplied data", () => {
    render(<DashboardView role="OWNER" data={baseData} />);

    expect(screen.getByRole("heading", { name: "Resumo financeiro" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Contratos" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Demandas" })).toBeVisible();
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === "P" &&
          element.textContent === "Demanda — Atualizado",
      ),
    ).toBeVisible();
    expect(screen.getByText(/Demandas atrasadas/)).toBeVisible();
  });

  it("omits Financeiro and Contratos for MEMBER", () => {
    render(
      <DashboardView
        role="MEMBER"
        data={{ ...baseData, financial: null, contracts: null }}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Resumo financeiro" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Contratos" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Demandas" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Clientes" })).toBeVisible();
  });

  it("renders no operational values for ADMIN", () => {
    render(
      <DashboardView
        role="ADMIN"
        data={{
          ...baseData,
          clients: null,
          demands: null,
          financial: null,
          contracts: null,
          activities: null,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Sem módulos operacionais autorizados" })).toBeVisible();
    expect(screen.queryByText("Clientes ativos")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Atividade recente" })).toBeNull();
  });

  it("shows a safe section error instead of a fabricated value", () => {
    render(
      <DashboardView
        role="MEMBER"
        data={{
          ...baseData,
          demands: { status: "error" },
          financial: null,
          contracts: null,
        }}
      />,
    );

    expect(screen.getByText("Demandas indisponível")).toBeVisible();
    expect(screen.queryByText("database unavailable")).toBeNull();
  });
});
