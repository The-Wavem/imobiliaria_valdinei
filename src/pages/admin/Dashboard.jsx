import { useEffect, useMemo, useState } from "react";
import DashboardStats from "@sections/admin/dashboard/DashboardStats/DashboardStats.jsx";
import OverviewChart from "@sections/admin/dashboard/OverviewChart/OverviewChart.jsx";
import InsightsGrid from "@sections/admin/dashboard/InsightsGrid/InsightsGrid.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
import PerformanceChart from "@sections/admin/dashboard/PerformanceChart/PerformanceChart.jsx";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@services/firebaseConfig.js";
import { getDailyAnalytics, getTopBairros, getTopFilters } from "@services/analyticsService.js";
import { getPropertiesStats } from "@services/propertyService.js";
import { getLeadsStats } from "@services/leadService.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export default function Dashboard() {
  useDocumentTitle('Painel Admin - Dashboard');
  const [period, setPeriod] = useState("7d");
  const [accessData, setAccessData] = useState([]);
  const [bairrosData, setBairrosData] = useState([]);
  const [filtersData, setFiltersData] = useState([]);
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });
  const [leadStats, setLeadStats] = useState({
    total: 0,
    novos: 0,
    emAtendimento: 0,
  });
  const [propertiesData, setPropertiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);

      try {
        const [
          accessHistoryResult, 
          bairrosResult, 
          filtersResult, 
          propertiesStatsResult, 
          leadsStatsResult,
          propertiesSnapshot
        ] = await Promise.all([
            getDailyAnalytics(),
            getTopBairros(),
            getTopFilters(),
            getPropertiesStats(),
            getLeadsStats(),
            getDocs(collection(db, "properties")),
          ]);

        if (!isMounted) {
          return;
        }

        setAccessData(accessHistoryResult);
        setBairrosData(bairrosResult);
        setFiltersData(filtersResult);
        setPropertyStats(propertiesStatsResult);
        setLeadStats(leadsStatsResult);
        setPropertiesData(propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Falha ao carregar dados do dashboard:", error);

        if (!isMounted) {
          return;
        }

        setAccessData([]);
        setBairrosData([]);
        setFiltersData([]);
        setPropertiesData([]);
        setPropertyStats({ total: 0, ativos: 0, inativos: 0 });
        setLeadStats({ total: 0, novos: 0, emAtendimento: 0 });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAccess = useMemo(
    () => accessData.reduce((total, item) => total + (Number(item.acessos) || 0), 0),
    [accessData],
  );

  const totalShares = useMemo(
    () => propertiesData.reduce((total, prop) => total + (Number(prop.shares) || 0), 0),
    [propertiesData],
  );

  const accessChartData = useMemo(() => {
    if (accessData.length === 0) {
      return [];
    }

    if (period === "7d") {
      return accessData.slice(-7);
    }

    if (period === "30d") {
      return accessData.slice(-30);
    }

    return accessData;
  }, [accessData, period]);

  const trafficSummary = useMemo(() => {
    const totals = accessChartData.reduce(
      (accumulator, item) => {
        accumulator.total += Number(item.acessos) || 0;
        return accumulator;
      },
      { total: 0 },
    );

    const averagePerDay =
      accessChartData.length > 0 ? totals.total / accessChartData.length : 0;

    const peakEntry = accessChartData.reduce(
      (currentPeak, item) => {
        if (!currentPeak || (Number(item.acessos) || 0) > (Number(currentPeak.acessos) || 0)) {
          return item;
        }

        return currentPeak;
      },
      null,
    );

    return {
      total: totals.total,
      averagePerDay,
      peakValue: Number(peakEntry?.acessos) || 0,
      peakLabel: peakEntry?.name || "Sem dados",
    };
  }, [accessChartData]);

  const isPageLoading = isLoading;

  if (isPageLoading) {
    return (
      <main className="admin-container">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Loader size={56} />
        </div>
      </main>
    );
  }

  return (
    <main className="admin-container">
      <DashboardStats
        totalAccess={totalAccess}
        totalProperties={propertyStats.total}
        pendingLeads={leadStats.novos}
        totalShares={totalShares}
      />
      <OverviewChart
        data={accessChartData}
        period={period}
        onPeriodChange={setPeriod}
        summary={trafficSummary}
      />
      <InsightsGrid bairrosData={bairrosData} filtersData={filtersData} />
      <PerformanceChart properties={propertiesData} period={period} />
    </main>
  );
}
