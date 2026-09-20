import { getFinancialSummary } from "@/lib/financial/queries";
import {
  getActiveClientCount,
  getContractDashboardSummary,
  getDemandDashboardSummary,
  getRecentDashboardActivities,
} from "@/lib/dashboard/queries";
import type {
  DashboardData,
  DashboardPeriod,
  DashboardRole,
  DashboardSection,
} from "@/types/dashboard";

const LISBON_TIMEZONE = "Europe/Lisbon";

export function getLisbonDashboardPeriod(now = new Date()): DashboardPeriod {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LISBON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value;
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = part("day");

  if (!Number.isInteger(year) || !Number.isInteger(month) || !day) {
    throw new Error("DASHBOARD_PERIOD_RESOLUTION_FAILED");
  }

  return {
    civilDate: `${year}-${String(month).padStart(2, "0")}-${day}`,
    year,
    month,
    label: new Intl.DateTimeFormat("pt-PT", {
      timeZone: LISBON_TIMEZONE,
      month: "long",
      year: "numeric",
    }).format(now),
  };
}

function settledSection<T>(
  result: PromiseSettledResult<T>,
): DashboardSection<T> {
  return result.status === "fulfilled"
    ? { status: "success", data: result.value }
    : { status: "error" };
}

export async function loadDashboard(
  role: DashboardRole,
  now = new Date(),
): Promise<DashboardData> {
  const period = getLisbonDashboardPeriod(now);

  if (role === "ADMIN") {
    return {
      period,
      clients: null,
      demands: null,
      financial: null,
      contracts: null,
      activities: null,
    };
  }

  const clientPromise = getActiveClientCount();
  const demandPromise = getDemandDashboardSummary(period.civilDate);
  const activityPromise = getRecentDashboardActivities();

  if (role === "MEMBER") {
    const [clients, demands, activities] = await Promise.allSettled([
      clientPromise,
      demandPromise,
      activityPromise,
    ]);

    return {
      period,
      clients: settledSection(clients),
      demands: settledSection(demands),
      financial: null,
      contracts: null,
      activities: settledSection(activities),
    };
  }

  const financialPromise = getFinancialSummary({
    year: period.year,
    month: period.month,
  });
  const contractPromise = getContractDashboardSummary();
  const [clients, demands, activities, financial, contracts] =
    await Promise.allSettled([
      clientPromise,
      demandPromise,
      activityPromise,
      financialPromise,
      contractPromise,
    ]);

  return {
    period,
    clients: settledSection(clients),
    demands: settledSection(demands),
    financial: settledSection(financial),
    contracts: settledSection(contracts),
    activities: settledSection(activities),
  };
}
