import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractDocuments } from "@/components/contracts/contract-documents";
import { ContractForm } from "@/components/contracts/contract-form";
import { ContractLifecycle } from "@/components/contracts/contract-lifecycle";
import { ContractList } from "@/components/contracts/contract-list";
import { ContractPagination, createContractListHref } from "@/components/contracts/contract-pagination";
import { TemplateManager } from "@/components/contracts/template-manager";
import type { ContractSnapshot } from "@/types/contracts";

const mocks = vi.hoisted(() => ({
  createContractAction: vi.fn(), updateDraftContractAction: vi.fn(), generateContractAction: vi.fn(), markContractSentAction: vi.fn(), markContractSignedAction: vi.fn(), cancelContractAction: vi.fn(), createContractTemplateAction: vi.fn(), updateContractTemplateAction: vi.fn(), activateContractTemplateAction: vi.fn(), deactivateContractTemplateAction: vi.fn(), push: vi.fn(), refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/app/(private)/contratos/actions", () => mocks);

const contractId = "33333333-3333-4333-8333-333333333333";
const clientId = "11111111-1111-4111-8111-111111111111";
const templateId = "22222222-2222-4222-8222-222222222222";
const snapshot: ContractSnapshot = { schema_version: 1, content: "Conteúdo final", client: { id: clientId, data: { name: "Cliente XPTO" }, tax_id: null, tax_id_type: null }, manual_fields: {}, template: { id: templateId, name: "Prestação de serviços" } };
const clients = [{ id: clientId, name: "Cliente XPTO", company_name: null, email: "client@example.test", phone: null, tax_id: null, tax_id_type: null, address_line_1: null, address_line_2: null, city: null, region: null, postal_code: null, country_code: null }];
const templates = [{ id: templateId, name: "Prestação de serviços", content: "Conteúdo do Template", is_active: true }];

describe("Contracts UI", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    const success = { success: true, data: { contractId } };
    mocks.createContractAction.mockResolvedValue(success); mocks.updateDraftContractAction.mockResolvedValue(success); mocks.generateContractAction.mockResolvedValue(success); mocks.markContractSentAction.mockResolvedValue(success); mocks.markContractSignedAction.mockResolvedValue(success); mocks.cancelContractAction.mockResolvedValue(success); mocks.createContractTemplateAction.mockResolvedValue({ success: true, data: { contractTemplateId: templateId } });
  });

  it("renders operational Contract data without administrative fields", () => {
    render(<ContractList items={[{ id: contractId, client_id: clientId, template_id: templateId, title: "Contrato anual", status: "DRAFT", generated_at: null, sent_at: null, signed_at: null, canceled_at: null, created_at: "2026-09-19T10:00:00Z", updated_at: "2026-09-19T10:00:00Z" }]} clients={clients} templates={templates} hasFilters={false} />);
    expect(screen.getByRole("link", { name: "Contrato anual" })).toHaveAttribute("href", `/contratos/${contractId}`);
    expect(screen.getByText("Cliente XPTO")).toBeVisible();
    expect(screen.queryByText("organization_id")).toBeNull();
  });

  it("distinguishes initial empty state from filtered results", () => {
    const { rerender } = render(<ContractList items={[]} clients={[]} templates={[]} hasFilters />);
    expect(screen.getByRole("heading", { name: "Nenhum resultado encontrado" })).toBeVisible();
    rerender(<ContractList items={[]} clients={[]} templates={[]} hasFilters={false} />);
    expect(screen.getByRole("heading", { name: "Nenhum Contrato encontrado" })).toBeVisible();
  });

  it("preserves filters in pagination", () => {
    const params = { page: 2, pageSize: 20 as const, search: "anual", status: "DRAFT" as const, sort: "updated_at" as const, direction: "desc" as const };
    expect(createContractListHref(3, params)).toContain("status=DRAFT");
    render(<ContractPagination params={params} total={50} totalPages={3} />);
    expect(screen.getByRole("link", { name: "Próxima" })).toHaveAttribute("href", expect.stringContaining("page=3"));
  });

  it("creates a DRAFT from an active Template and Client", async () => {
    const user = userEvent.setup(); render(<ContractForm mode="create" clients={clients} templates={templates} />);
    await user.selectOptions(screen.getByLabelText(/Template/), templateId); await user.selectOptions(screen.getByLabelText(/Cliente/), clientId);
    await user.click(screen.getByRole("button", { name: "Criar rascunho" }));
    await waitFor(() => expect(mocks.createContractAction).toHaveBeenCalledWith({ client_id: clientId, template_id: templateId, title: "Prestação de serviços", draft_data: { content: "Conteúdo do Template" } }));
    expect(mocks.push).toHaveBeenCalledWith(`/contratos/${contractId}`);
  });

  it("runs generation, e-mail and signed-copy flows only in their lifecycle states", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ContractLifecycle key="DRAFT" contractId={contractId} status="DRAFT" snapshot={snapshot} />);
    await user.click(screen.getByRole("button", { name: "Gerar PDF e concluir" }));
    await waitFor(() => expect(mocks.generateContractAction).toHaveBeenCalledWith({ contract_id: contractId, snapshot }));
    rerender(<ContractLifecycle key="GENERATED" contractId={contractId} status="GENERATED" snapshot={snapshot} defaultEmail="client@example.test" />);
    await user.click(screen.getByRole("button", { name: "Enviar PDF por e-mail" }));
    await waitFor(() => expect(mocks.markContractSentAction).toHaveBeenCalledWith({ contract_id: contractId, recipient_email: "client@example.test" }));
    rerender(<ContractLifecycle key="SENT" contractId={contractId} status="SENT" snapshot={snapshot} />);
    const signed = new File(["%PDF-1.7"], "signed.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Cópia assinada em PDF"), signed); await user.click(screen.getByRole("button", { name: "Guardar cópia e marcar Assinado" }));
    await waitFor(() => expect(mocks.markContractSignedAction).toHaveBeenCalledWith({ contract_id: contractId, file: signed }));
  });

  it("presents original and signed documents separately without object paths", () => {
    render(<ContractDocuments contractId={contractId} documents={[{ id: "44444444-4444-4444-8444-444444444444", entity_id: contractId, kind: "ORIGINAL_PDF", file_name: "contract.pdf", mime_type: "application/pdf", size_bytes: 200, created_at: "2026-09-19T10:00:00Z" }]} />);
    expect(screen.getByRole("heading", { name: "PDF original" })).toBeVisible(); expect(screen.getByRole("heading", { name: "Cópia assinada" })).toBeVisible();
    expect(document.body.textContent).not.toContain("private-files"); expect(document.body.textContent).not.toContain("object_path");
  });

  it("creates a reusable Template", async () => {
    const user = userEvent.setup(); render(<TemplateManager templates={[]} />);
    await user.type(screen.getByLabelText("Nome"), "Serviços"); await user.type(screen.getByLabelText("Conteúdo"), "Cláusula primeira"); await user.click(screen.getByRole("button", { name: "Criar Template" }));
    await waitFor(() => expect(mocks.createContractTemplateAction).toHaveBeenCalledWith({ name: "Serviços", content: "Cláusula primeira" }));
  });
});
