import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClientActivityList } from "@/components/activity/client-activity-list";
import type { ClientActivitySummary } from "@/types/activity";

const createdAt = "2026-08-20T12:34:00.000Z";

const activities: ClientActivitySummary[] = [
  { action: "CREATED", createdAt },
  { action: "UPDATED", createdAt },
  { action: "ARCHIVED", createdAt },
  { action: "ACCESS_GRANTED", createdAt },
  { action: "ACCESS_REVOKED", createdAt },
  { action: "CUSTOM_EVENT", createdAt },
];

describe("client activity UI", () => {
  it("maps the real Client events and preserves a safe fallback", () => {
    render(<ClientActivityList activities={activities} />);

    for (const label of [
      "Cliente criado",
      "Cliente atualizado",
      "Cliente arquivado",
      "Acesso concedido",
      "Acesso removido",
      "CUSTOM_EVENT",
    ]) {
      expect(screen.getByText(label)).toBeVisible();
    }
  });

  it("formats activity date and time using pt-PT", () => {
    render(<ClientActivityList activities={[activities[0]]} />);
    const expectedDateTime = new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(createdAt));

    expect(screen.getByText(expectedDateTime)).toBeVisible();
    expect(screen.getByText(expectedDateTime)).toHaveAttribute(
      "datetime",
      createdAt,
    );
  });

  it("renders a neutral empty state", () => {
    render(<ClientActivityList activities={[]} />);

    expect(
      screen.getByText("Nenhuma atividade visível para este Cliente."),
    ).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders only the minimal presentation contract", () => {
    const { container } = render(
      <ClientActivityList activities={[activities[0]]} />,
    );

    for (const administrativeField of [
      "organization_id",
      "entity_id",
      "user_id",
      "metadata",
    ]) {
      expect(container.innerHTML).not.toContain(administrativeField);
    }
  });
});
