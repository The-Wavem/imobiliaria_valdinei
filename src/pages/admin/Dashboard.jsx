import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart2, CalendarDays, ArrowUpRight, Home, TrendingUp, Users } from "lucide-react";
import AdminSidebar from "@components/layout/AdminSidebar";
import Select from "@components/ui/Select/Select.jsx";
import { FILTERS_STORAGE_KEY } from "@utils/analytics";
import styles from "./Dashboard.module.css";

const metricCards = [
  {
    label: "Total de Leads",
    value: "248",
    detail: "+18% no mês",
    icon: Users,
  },
  {
    label: "Visitas Agendadas",
    value: "64",
    detail: "+8% na semana",
    icon: CalendarDays,
  },
  {
    label: "Imóveis Ativos",
    value: "31",
    detail: "12 novos anúncios",
    icon: Home,
  },
  {
    label: "Taxa de Conversão",
    value: "12,4%",
    detail: "+1,2 p.p.",
    icon: TrendingUp,
  },
];

const periodOptions = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este Ano", value: "year" },
];

const ACCESS_HISTORY_STORAGE_KEY = "@valdinei:access_history";

const interestData = [
  { name: "Residencial", value: 46 },
  { name: "Comercial", value: 24 },
  { name: "Lançamentos", value: 18 },
  { name: "Alto Padrão", value: 12 },
];

const chartPalette = ["var(--color-brand-primary)", "rgba(20, 20, 60, 0.9)", "rgba(71, 85, 105, 0.95)", "rgba(148, 163, 184, 0.95)"];

const routeLabels = {
  "/admin/dashboard": "Dashboard",
  "/admin/imoveis": "Imóveis",
  "/admin/leads": "Leads",
  "/admin/visitas": "Visitas",
};

const axisTickStyle = {
  fill: "var(--color-text-muted)",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
};

const tooltipContentStyle = {
  borderRadius: "14px",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  fontFamily: "var(--font-sans)",
  color: "var(--color-text-main)",
};

const tooltipLabelStyle = {
  color: "var(--color-brand-secondary)",
  fontWeight: 700,
  fontFamily: "var(--font-sans)",
};

const tooltipItemStyle = {
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-sans)",
};

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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
    frequentClients: Number(record.frequentClients ?? record.frequentes ?? 0) || 0,
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
  const nextMonthTotals = Array.from({ length: 12 }, () => ({ total: 0, newClients: 0, frequentClients: 0 }));

  Object.entries(historyMap).forEach(([dateKey, acessos]) => {
    if (!dateKey.startsWith(`${currentYear}-`)) {
      return;
    }

    const monthIndex = Number(dateKey.slice(5, 7)) - 1;

    if (monthIndex >= 0 && monthIndex < 12) {
      const record = normalizeAccessRecord(acessos);
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

function loadFilterUsage() {
  const stats = readJsonFromLocalStorage(FILTERS_STORAGE_KEY, {});

  return Object.entries(stats)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((item) => item.value > 0)
    .sort((leftItem, rightItem) => rightItem.value - leftItem.value)
    .slice(0, 7);
}

export default function Dashboard() {
  const { pathname } = useLocation();
  const [period, setPeriod] = useState("7d");
  const [accessHistory, setAccessHistory] = useState(() => loadAccessHistory());
  const [bairrosData, setBairrosData] = useState(() => loadBairrosData());
  const [filtersData, setFiltersData] = useState(() => loadFilterUsage());
  const title = routeLabels[pathname] ?? routeLabels["/admin/dashboard"];
  const periodLabel = periodOptions.find((option) => option.value === period)?.label ?? "Últimos 7 dias";

  const reloadAnalyticsData = () => {
    setAccessHistory(loadAccessHistory());
    setBairrosData(loadBairrosData());
    setFiltersData(loadFilterUsage());
  };

  useEffect(() => {
    const handleAnalyticsUpdate = () => {
      reloadAnalyticsData();
    };

    const handleStorageUpdate = (event) => {
      if (event.key === ACCESS_HISTORY_STORAGE_KEY || event.key === "@valdinei:bairros" || event.key === FILTERS_STORAGE_KEY) {
        reloadAnalyticsData();
      }
    };

    window.addEventListener("valdinei:analytics-update", handleAnalyticsUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("valdinei:analytics-update", handleAnalyticsUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const normalizedAccessHistory = useMemo(() => {
    return Object.entries(accessHistory).reduce((accumulator, [date, record]) => {
      accumulator[date] = normalizeAccessRecord(record);
      return accumulator;
    }, {});
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

  const accessBreakdownData = accessChartData;

  return (
    <div className={styles.layout}>
      <AdminSidebar />

      <main className={styles.content}>
        <div className={styles.contentInner}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Painel administrativo</p>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>
                Acompanhe os principais indicadores da Imobiliária Valdinei em uma visão clara e
                objetiva.
              </p>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.periodSelectWrap}>
                <Select
                  compact
                  label="Período"
                  options={periodOptions}
                  value={period}
                  onChange={setPeriod}
                  className={styles.periodSelect}
                />
              </div>

              <button type="button" className={styles.secondaryButton}>
                Exportar relatório
              </button>
              <button type="button" className={styles.primaryButton}>
                <ArrowUpRight size={18} />
                <span>Novo imóvel</span>
              </button>
            </div>
          </header>

          <section className={styles.metricsGrid} aria-label="Resumo de métricas">
            {metricCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.label} className={styles.metricCard}>
                  <div className={styles.metricCardTop}>
                    <div className={styles.metricIcon} aria-hidden="true">
                      <Icon size={22} />
                    </div>
                    <span className={styles.metricBadge}>+4,5%</span>
                  </div>

                  <p className={styles.metricLabel}>{card.label}</p>
                  <p className={styles.metricValue}>{card.value}</p>
                  <p className={styles.metricDetail}>{card.detail}</p>
                </article>
              );
            })}
          </section>

          <section className={styles.chartsLayout} aria-label="Gráficos do dashboard">
            <div className={styles.chartsPrimaryGrid}>
              <article className={`${styles.chartCard} ${styles.chartCardWide}`}>
                <div className={styles.chartHeader}>
                  <div>
                    <p className={styles.chartKicker}>Tráfego</p>
                    <h2 className={styles.chartTitle}>Acessos diários ao site</h2>
                  </div>
                  <p className={styles.chartDescription}>Visão consolidada de {periodLabel.toLowerCase()}.</p>
                </div>

                <div className={styles.chartBody}>
                  {accessChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={accessChartData}>
                        <defs>
                          <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-brand-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTickStyle} />
                        <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
                        <Tooltip
                          cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                          contentStyle={tooltipContentStyle}
                          labelStyle={tooltipLabelStyle}
                          itemStyle={tooltipItemStyle}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="Acessos"
                          stroke="var(--color-brand-primary)"
                          strokeWidth={3}
                          fill="url(#colorVisitas)"
                          dot={{ r: 3, fill: "var(--color-brand-primary)", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.emptyState}>
                      <BarChart2 size={44} strokeWidth={1.5} />
                      <p>Nenhum acesso foi registrado ainda.</p>
                    </div>
                  )}
                </div>
              </article>

              <article className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <p className={styles.chartKicker}>Audiência</p>
                    <h2 className={styles.chartTitle}>Clientes novos x frequentes</h2>
                  </div>
                  <p className={styles.chartDescription}>Separação dos acessos por perfil do cliente.</p>
                </div>

                <div className={styles.chartBody}>
                  {accessBreakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={accessBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTickStyle} />
                        <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
                        <Tooltip
                          cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                          contentStyle={tooltipContentStyle}
                          labelStyle={tooltipLabelStyle}
                          itemStyle={tooltipItemStyle}
                        />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontFamily: "var(--font-sans)" }} />
                        <Bar
                          dataKey="newClients"
                          name="Novos"
                          stackId="clients"
                          fill="var(--color-brand-primary)"
                          radius={[4, 4, 0, 0]}
                          barSize={34}
                        />
                        <Bar
                          dataKey="frequentClients"
                          name="Frequentes"
                          stackId="clients"
                          fill="rgba(20, 20, 60, 0.9)"
                          radius={[4, 4, 0, 0]}
                          barSize={34}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.emptyState}>
                      <Users size={44} strokeWidth={1.5} />
                      <p>Sem acessos suficientes para separar clientes novos e frequentes.</p>
                    </div>
                  )}
                </div>
              </article>
            </div>

            <div className={styles.chartsSecondaryGrid}>
              <article className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <p className={styles.chartKicker}>Inteligência de Mercado</p>
                  <h2 className={styles.chartTitle}>Bairros mais buscados</h2>
                </div>
                <p className={styles.chartDescription}>Onde a intenção de clique está mais forte.</p>
              </div>

              <div className={styles.chartBody}>
                {bairrosData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bairrosData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="bairro" axisLine={false} tickLine={false} tick={axisTickStyle} />
                      <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
                      <Tooltip
                        cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Bar dataKey="acessos" fill="var(--color-brand-primary)" radius={[4, 4, 0, 0]} barSize={34} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyState}>
                    <BarChart2 size={44} strokeWidth={1.5} />
                    <p>Nenhum acesso registrado nesta região recentemente.</p>
                  </div>
                )}
              </div>
            </article>

              <article className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <p className={styles.chartKicker}>Interesse</p>
                    <h2 className={styles.chartTitle}>Distribuição de procura</h2>
                  </div>
                  <p className={styles.chartDescription}>Perfil dos leads captados recentemente.</p>
                </div>

                <div className={styles.chartBody}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={interestData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={100}
                        paddingAngle={4}
                      >
                        {interestData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: "var(--font-sans)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </div>

            <article className={`${styles.chartCard} ${styles.fullWidthCard}`}>
              <div className={styles.chartHeader}>
                <div>
                  <p className={styles.chartKicker}>Inteligência de Filtros</p>
                  <h2 className={styles.chartTitle}>Perfil de busca mais desejado</h2>
                </div>
                <p className={styles.chartDescription}>Os filtros mais acionados nas páginas públicas.</p>
              </div>

              <div className={styles.chartBody}>
                {filtersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={filtersData} layout="vertical" margin={{ top: 8, right: 18, left: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={axisTickStyle} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={axisTickStyle}
                        width={170}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Bar dataKey="value" name="Seleções" fill="var(--color-brand-primary)" radius={[0, 8, 8, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyState}>
                    <BarChart2 size={44} strokeWidth={1.5} />
                    <p>Ainda não há filtros suficientes para montar essa leitura.</p>
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}