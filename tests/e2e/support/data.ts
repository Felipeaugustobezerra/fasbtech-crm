export const E2E_FIXTURES = {
  organization: {
    name: "FASBtech E2E Clientes & Acessos",
    slug: "fasbtech-e2e-clientes-acessos",
    id: "10000000-0000-4000-8000-000000000001",
  },
  otherOrganization: {
    name: "Organization B E2E",
    slug: "organization-b-e2e",
    id: "10000000-0000-4000-8000-000000000002",
  },
  dashboardOrganization: {
    name: "FASBtech E2E Dashboard",
    slug: "fasbtech-e2e-dashboard",
    id: "10000000-0000-4000-8000-000000000003",
  },
  owner: {
    email: "owner-clientes-acessos-e2e@example.test",
    password: "E2E-Clientes-Acessos-2026!",
    fullName: "Owner E2E Clientes",
    membershipId: "20000000-0000-4000-8000-000000000001",
  },
  member: {
    email: "member-clientes-acessos-e2e@example.test",
    password: "E2E-Clientes-Acessos-2026!",
    fullName: "Member E2E Acessos",
    membershipId: "20000000-0000-4000-8000-000000000002",
  },
  memberB: {
    email: "member-b-demandas-e2e@example.test",
    password: "E2E-Demandas-2026!",
    fullName: "Member B E2E Demandas",
    membershipId: "20000000-0000-4000-8000-000000000003",
  },
  admin: {
    email: "admin-demandas-e2e@example.test",
    password: "E2E-Demandas-2026!",
    fullName: "Admin E2E Demandas",
    membershipId: "20000000-0000-4000-8000-000000000004",
  },
  otherOwner: {
    email: "owner-b-demandas-e2e@example.test",
    password: "E2E-Demandas-2026!",
    fullName: "Owner B E2E Demandas",
    membershipId: "20000000-0000-4000-8000-000000000005",
  },
  dashboardOwner: {
    email: "owner-dashboard-e2e@example.test",
    password: "E2E-Dashboard-2026!",
    fullName: "Owner E2E Dashboard",
    membershipId: "20000000-0000-4000-8000-000000000006",
  },
  dashboardMember: {
    email: "member-dashboard-e2e@example.test",
    password: "E2E-Dashboard-2026!",
    fullName: "Member E2E Dashboard",
    membershipId: "20000000-0000-4000-8000-000000000007",
  },
  dashboardAdmin: {
    email: "admin-dashboard-e2e@example.test",
    password: "E2E-Dashboard-2026!",
    fullName: "Admin E2E Dashboard",
    membershipId: "20000000-0000-4000-8000-000000000008",
  },
  dashboard: {
    assignedClientId: "30000000-0000-4000-8000-000000000011",
    restrictedClientId: "30000000-0000-4000-8000-000000000012",
    assignedOverdueDemandId: "40000000-0000-4000-8000-000000000011",
    assignedCompletedDemandId: "40000000-0000-4000-8000-000000000012",
    restrictedDemandId: "40000000-0000-4000-8000-000000000013",
    templateId: "60000000-0000-4000-8000-000000000011",
    draftContractId: "61000000-0000-4000-8000-000000000011",
    generatedContractId: "61000000-0000-4000-8000-000000000012",
    sentContractId: "61000000-0000-4000-8000-000000000013",
    signedContractId: "61000000-0000-4000-8000-000000000014",
    canceledContractId: "61000000-0000-4000-8000-000000000015",
  },
  clients: {
    clientA: {
      id: "30000000-0000-4000-8000-000000000001",
      name: "Cliente A E2E Demandas",
    },
    clientB: {
      id: "30000000-0000-4000-8000-000000000002",
      name: "Cliente B E2E Demandas",
    },
  },
  demands: {
    clientB: {
      id: "40000000-0000-4000-8000-000000000001",
      title: "ZZZ Demanda restrita do Cliente B",
      dueDate: "2026-12-15",
    },
  },
  financial: {
    otherOrganizationEntry: {
      id: "50000000-0000-4000-8000-000000000001",
      description: "Movimentação restrita da Organization B",
    },
  },
  contracts: {
    fixtureTemplate: {
      id: "60000000-0000-4000-8000-000000000001",
      name: "Template Fixture Contratos",
    },
    inactiveTemplate: {
      id: "60000000-0000-4000-8000-000000000002",
      name: "Template Inativo E2E",
    },
    sentForSignature: {
      id: "61000000-0000-4000-8000-000000000001",
      title: "Contrato Enviado para Assinatura E2E",
      originalDocumentId: "62000000-0000-4000-8000-000000000001",
    },
    sentForCancellation: {
      id: "61000000-0000-4000-8000-000000000002",
      title: "Contrato Enviado para Cancelamento E2E",
      originalDocumentId: "62000000-0000-4000-8000-000000000002",
    },
    otherOrganization: {
      id: "61000000-0000-4000-8000-000000000003",
      title: "Contrato Restrito Organization B E2E",
    },
    archivedClient: {
      id: "63000000-0000-4000-8000-000000000001",
      name: "Cliente Arquivado Contratos E2E",
    },
  },
} as const;
