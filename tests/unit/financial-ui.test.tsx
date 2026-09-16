import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FinancialArchive } from "@/components/financial/financial-archive";
import { FinancialEntryForm } from "@/components/financial/financial-entry-form";
import { FinancialGoalForm } from "@/components/financial/financial-goal-form";
import { FinancialList } from "@/components/financial/financial-list";
import { FinancialPagination, createFinancialListHref } from "@/components/financial/financial-pagination";
import { FinancialStatusControl } from "@/components/financial/financial-status-control";
import { FinancialSummary } from "@/components/financial/financial-summary";
import type { FinancialEntry } from "@/types/financial";

const mocks = vi.hoisted(() => ({
  createFinancialEntryAction: vi.fn(),
  updateFinancialEntryAction: vi.fn(),
  changeFinancialEntryStatusAction: vi.fn(),
  archiveFinancialEntryAction: vi.fn(),
  setFinancialGoalAction: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/app/(private)/financeiro/actions", () => ({
  createFinancialEntryAction: mocks.createFinancialEntryAction,
  updateFinancialEntryAction: mocks.updateFinancialEntryAction,
  changeFinancialEntryStatusAction: mocks.changeFinancialEntryStatusAction,
  archiveFinancialEntryAction: mocks.archiveFinancialEntryAction,
  setFinancialGoalAction: mocks.setFinancialGoalAction,
}));

const id = "11111111-1111-4111-8111-111111111111";
const entry: FinancialEntry = {
  id,
  organization_id: "22222222-2222-4222-8222-222222222222",
  client_id: null,
  type: "INCOME",
  status: "PENDING",
  payment_nature: "ONE_TIME",
  description: "Projeto Website",
  category: "Desenvolvimento",
  amount: "1250.50",
  reference_date: "2026-09-15",
  due_date: "2026-09-30",
  realized_date: null,
  notes: null,
  created_by: "33333333-3333-4333-8333-333333333333",
  updated_by: "33333333-3333-4333-8333-333333333333",
  created_at: "2026-09-15T10:00:00Z",
  updated_at: "2026-09-15T10:00:00Z",
  archived_at: null,
};

describe("financial UI", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    const success = { success: true, data: { financialEntryId: id } };
    mocks.createFinancialEntryAction.mockResolvedValue(success);
    mocks.updateFinancialEntryAction.mockResolvedValue(success);
    mocks.changeFinancialEntryStatusAction.mockResolvedValue(success);
    mocks.archiveFinancialEntryAction.mockResolvedValue(success);
    mocks.setFinancialGoalAction.mockResolvedValue({
      success: true,
      data: { financialGoalId: "22222222-2222-4222-8222-222222222222" },
    });
  });

  it("renders the server summary values as EUR and supplied progress", () => {
    render(<FinancialSummary periodLabel="setembro de 2026" summary={{ monthly_income: "1250.50", monthly_expense: "200.00", cash_balance: "1050.50", goal_target: "2000.00", goal_progress: "0.62525" }} />);
    expect(screen.getByText("Entradas realizadas").nextSibling).toHaveTextContent(/1\s?250,50\s?€/);
    expect(screen.getByText("Saídas realizadas").nextSibling).toHaveTextContent(/200,00\s?€/);
    expect(screen.getByText("Saldo em caixa").nextSibling).toHaveTextContent(/1\s?050,50\s?€/);
    expect(screen.getAllByText(/62,5/).length).toBeGreaterThan(0);
  });

  it("renders operational fields without administrative data", () => {
    render(<FinancialList items={[entry]} hasFilters={false} />);
    expect(screen.getAllByText("Projeto Website").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1\s?250,50\s?€/).length).toBeGreaterThan(0);
    expect(screen.queryByText(entry.organization_id)).toBeNull();
    expect(screen.queryByText(entry.created_by)).toBeNull();
    expect(screen.queryByText(entry.updated_by)).toBeNull();
  });

  it("distinguishes empty search results from the initial empty state", () => {
    const { rerender } = render(<FinancialList items={[]} hasFilters />);
    expect(screen.getByRole("heading", { name: "Nenhum resultado encontrado" })).toBeVisible();
    rerender(<FinancialList items={[]} hasFilters={false} />);
    expect(screen.getByRole("heading", { name: "Nenhuma movimentação encontrada" })).toBeVisible();
  });

  it("preserves filters in pagination links and clamps pages", () => {
    const params = { page: 2, pageSize: 20 as const, search: "site", type: "INCOME" as const, sort: "amount" as const, direction: "asc" as const };
    const href = createFinancialListHref(3, params);
    expect(href).toContain("page=3");
    expect(href).toContain("search=site");
    expect(href).toContain("type=INCOME");
    render(<FinancialPagination params={params} total={45} totalPages={3} />);
    expect(screen.getByRole("link", { name: "Anterior" })).toHaveAttribute("href", expect.stringContaining("page=1"));
    expect(screen.getByRole("link", { name: "Próxima" })).toHaveAttribute("href", expect.stringContaining("page=3"));
  });

  it("creates a decimal-safe entry and navigates to its detail", async () => {
    const user = userEvent.setup();
    render(<FinancialEntryForm mode="create" clients={[]} />);
    await user.type(screen.getByLabelText(/Descrição/), "Receita mensal");
    await user.type(screen.getByLabelText(/Valor/), "1250.50");
    await user.type(screen.getByLabelText(/Data de referência/), "2026-09-15");
    await user.click(screen.getByRole("button", { name: "Criar movimentação" }));
    await waitFor(() => expect(mocks.createFinancialEntryAction).toHaveBeenCalledOnce());
    expect(mocks.createFinancialEntryAction).toHaveBeenCalledWith(expect.objectContaining({ amount: "1250.50", reference_date: "2026-09-15" }));
    expect(mocks.createFinancialEntryAction.mock.calls[0]?.[0]).not.toHaveProperty("status");
    expect(mocks.push).toHaveBeenCalledWith(`/financeiro/${id}`);
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("requires realized date and submits it only for REALIZED", async () => {
    const user = userEvent.setup();
    render(<FinancialStatusControl entryId={id} currentStatus="PENDING" currentRealizedDate={null} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "REALIZED");
    await user.type(screen.getByLabelText("Data de realização"), "2026-09-16");
    await user.click(screen.getByRole("button", { name: "Atualizar Status" }));
    await waitFor(() => expect(mocks.changeFinancialEntryStatusAction).toHaveBeenCalledWith({ entry_id: id, status: "REALIZED", realized_date: "2026-09-16" }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("presents archive as distinct from cancellation", async () => {
    const user = userEvent.setup();
    render(<FinancialArchive entryId={id} description="Projeto Website" />);
    expect(screen.getByText(/Arquivar não altera nem cancela o Status financeiro/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Arquivar movimentação" }));
    await user.click(screen.getByRole("button", { name: "Confirmar arquivamento" }));
    await waitFor(() => expect(mocks.archiveFinancialEntryAction).toHaveBeenCalledWith({ entry_id: id }));
    expect(mocks.push).toHaveBeenCalledWith("/financeiro");
  });

  it("updates the monthly goal using its period and decimal-safe value", async () => {
    const user = userEvent.setup();
    render(<FinancialGoalForm year={2026} month={9} currentTarget="2000.00" />);
    const target = screen.getByLabelText("Meta (EUR)");
    await user.clear(target);
    await user.type(target, "3500.00");
    await user.click(screen.getByRole("button", { name: "Guardar meta" }));
    await waitFor(() => expect(mocks.setFinancialGoalAction).toHaveBeenCalledWith({
      year: 2026,
      month: 9,
      target_amount: "3500.00",
    }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
