import { DashboardView } from "@/components/dashboard/dashboard-view";
import { loadDashboard } from "@/lib/dashboard/dashboard";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function DashboardPage() {
  const context = await resolveFoundationContext();

  if (context.status !== "READY") {
    return null;
  }

  const data = await loadDashboard(context.membership.role);

  return <DashboardView role={context.membership.role} data={data} />;
}
