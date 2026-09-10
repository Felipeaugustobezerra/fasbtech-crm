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
} as const;
