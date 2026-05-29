import { useEffect, useMemo, useState } from "react";
import DashboardStats from "@sections/admin/dashboard/DashboardStats/DashboardStats.jsx";
import OverviewChart from "@sections/admin/dashboard/OverviewChart/OverviewChart.jsx";
import InsightsGrid from "@sections/admin/dashboard/InsightsGrid/InsightsGrid.jsx";
import { FILTERS_STORAGE_KEY } from "@utils/analytics";
import { initialProperties } from "@pages/admin/PropertyManager.jsx";
import { initialRequests } from "../../data/admin/leadsSeed.js";

const ACCESS_HISTORY_STORAGE_KEY = "@valdinei:access_history";
const PROPERTIES_STORAGE_KEY = "@valdinei:properties";
const LEADS_STORAGE_KEY = "@valdinei:leads";

const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function toISODate(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function formatDailyLabel(date) {
  return `${padNumber(date.getDate())}-${monthLabels[date.getMonth()]}`;
}

function normalizeAccessRecord(record) {
  if (typeof record === "number") {
    return {
      total: record,
      newClients: 0,
      frequentClients: 0,
    };
  }

  if (!record || typeof record !== "object") {
    return {
      total: 0,
      newClients: 0,
      frequentClients: 0,
    };
  }

  return {
    total: Number(record.total ?? record.acessos ?? 0) || 0,
    newClients: Number(record.newClients ?? record.novos ?? 0) || 0,
    frequentClients:
      Number(record.frequentClients ?? record.frequentes ?? 0) || 0,
  };
}

function buildDailySeries(totalDays, historyMap) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - (totalDays - 1 - index));
    const key = toISODate(currentDate);
    const record = normalizeAccessRecord(historyMap[key]);

    return {
      date: key,
      name: formatDailyLabel(currentDate),
      total: record.total,
      newClients: record.newClients,
      frequentClients: record.frequentClients,
    };
  });
}

function buildYearSeries(historyMap) {
  const currentYear = new Date().getFullYear();
  const nextMonthTotals = Array.from({ length: 12 }, () => ({
    total: 0,
    newClients: 0,
    frequentClients: 0,
  }));

  Object.entries(historyMap).forEach(([dateKey, accesses]) => {
    if (!dateKey.startsWith(`${currentYear}-`)) {
      return;
    }

    const monthIndex = Number(dateKey.slice(5, 7)) - 1;

    if (monthIndex >= 0 && monthIndex < 12) {
      const record = normalizeAccessRecord(accesses);
      nextMonthTotals[monthIndex].total += record.total;
      nextMonthTotals[monthIndex].newClients += record.newClients;
      nextMonthTotals[monthIndex].frequentClients += record.frequentClients;
    }
  });

  return nextMonthTotals.map((record, index) => ({
    date: `${currentYear}-${padNumber(index + 1)}-01`,
    name: monthLabels[index],
    total: record.total,
    newClients: record.newClients,
    frequentClients: record.frequentClients,
  }));
}

function readJsonFromLocalStorage(storageKey, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function readJsonArrayFromLocalStorage(storageKey, fallbackValue) {
  const value = readJsonFromLocalStorage(storageKey, fallbackValue);
  return Array.isArray(value) ? value : fallbackValue;
}

function loadBairrosData() {
  const stats = readJsonFromLocalStorage("@valdinei:bairros", {});

  return Object.entries(stats)
    .map(([bairro, acessos]) => ({ bairro, acessos: Number(acessos) || 0 }))
    .sort((leftItem, rightItem) => rightItem.acessos - leftItem.acessos)
    .slice(0, 5);
}

function loadAccessHistory() {
  return readJsonFromLocalStorage(ACCESS_HISTORY_STORAGE_KEY, {});
}

function loadProperties() {
  return readJsonArrayFromLocalStorage(
    PROPERTIES_STORAGE_KEY,
    initialProperties,
  );
}

function loadRequests() {
  return readJsonArrayFromLocalStorage(LEADS_STORAGE_KEY, initialRequests);
}

function loadFilterUsage() {
  const stats = readJsonFromLocalStorage(FILTERS_STORAGE_KEY, {});

  return Object.entries(stats)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((item) => item.value > 0)
    .sort((leftItem, rightItem) => rightItem.value - leftItem.value)
    .slice(0, 7);
}

function sumPageViews(history) {
  return Object.values(history).reduce(
    (total, record) => total + normalizeAccessRecord(record).total,
    0,
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState("7d");
  const [accessHistory, setAccessHistory] = useState(() => loadAccessHistory());
  const [bairrosData, setBairrosData] = useState(() => loadBairrosData());
  const [filtersData, setFiltersData] = useState(() => loadFilterUsage());
  const [totalAccess, setTotalAccess] = useState(() =>
    sumPageViews(loadAccessHistory()),
  );
  const [totalProperties, setTotalProperties] = useState(
    () => loadProperties().length,
  );
  const [pendingLeads, setPendingLeads] = useState(
    () => loadRequests().filter((request) => request.status === "Novo").length,
  );

  const reloadAnalyticsData = () => {
    const nextAccessHistory = loadAccessHistory();
    const nextProperties = loadProperties();
    const nextRequests = loadRequests();

    setAccessHistory(nextAccessHistory);
    setBairrosData(loadBairrosData());
    setFiltersData(loadFilterUsage());
    setTotalAccess(sumPageViews(nextAccessHistory));
    setTotalProperties(nextProperties.length);
    setPendingLeads(
      nextRequests.filter((request) => request.status === "Novo").length,
    );
  };

  useEffect(() => {
    const handleAnalyticsUpdate = () => {
      reloadAnalyticsData();
    };

    const handleStorageUpdate = (event) => {
      if (
        event.key === ACCESS_HISTORY_STORAGE_KEY ||
        event.key === "@valdinei:bairros" ||
        event.key === FILTERS_STORAGE_KEY ||
        event.key === PROPERTIES_STORAGE_KEY ||
        event.key === LEADS_STORAGE_KEY
      ) {
        reloadAnalyticsData();
      }
    };

    window.addEventListener("valdinei:analytics-update", handleAnalyticsUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(
        "valdinei:analytics-update",
        handleAnalyticsUpdate,
      );
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const normalizedAccessHistory = useMemo(() => {
    return Object.entries(accessHistory).reduce(
      (accumulator, [date, record]) => {
        accumulator[date] = normalizeAccessRecord(record);
        return accumulator;
      },
      {},
    );
  }, [accessHistory]);

  const accessChartData = useMemo(() => {
    const hasAccessHistory = Object.keys(normalizedAccessHistory).length > 0;

    if (!hasAccessHistory) {
      return [];
    }

    if (period === "7d") {
      return buildDailySeries(7, normalizedAccessHistory);
    }

    if (period === "30d") {
      return buildDailySeries(30, normalizedAccessHistory);
    }

    return buildYearSeries(normalizedAccessHistory);
  }, [normalizedAccessHistory, period]);

  const trafficSummary = useMemo(() => {
    const totals = accessChartData.reduce(
      (accumulator, item) => {
        accumulator.newClients += item.newClients || 0;
        accumulator.frequentClients += item.frequentClients || 0;
        accumulator.total += item.total || 0;
        return accumulator;
      },
      { total: 0, newClients: 0, frequentClients: 0 },
    );

    const totalTracked = totals.newClients + totals.frequentClients;
    const newShare =
      totalTracked > 0 ? (totals.newClients / totalTracked) * 100 : 0;
    const frequentShare =
      totalTracked > 0 ? (totals.frequentClients / totalTracked) * 100 : 0;
    const averagePerDay =
      accessChartData.length > 0 ? totals.total / accessChartData.length : 0;

    return {
      ...totals,
      totalTracked,
      newShare,
      frequentShare,
      averagePerDay,
    };
  }, [accessChartData]);

  return (
    <main className="admin-container">
      <DashboardStats
        totalAccess={totalAccess}
        totalProperties={totalProperties}
        pendingLeads={pendingLeads}
      />
      <OverviewChart
        data={accessChartData}
        period={period}
        onPeriodChange={setPeriod}
        summary={trafficSummary}
      />
      <InsightsGrid bairrosData={bairrosData} filtersData={filtersData} />
    </main>
  );
}
