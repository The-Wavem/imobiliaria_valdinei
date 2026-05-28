import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart2, CalendarDays, ArrowUpRight, Home, TrendingUp, Users } from "lucide-react";
import AdminSidebar from "@components/layout/AdminSidebar";
import Select from "@components/ui/Select/Select.jsx";
import { FILTERS_STORAGE_KEY } from "@utils/analytics";
import { initialProperties } from "@pages/admin/PropertyManager.jsx";
import { initialRequests } from "@pages/admin/LeadsManager.jsx";
import styles from "./Dashboard.module.css";

const periodOptions = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este Ano", value: "year" },
];

const ACCESS_HISTORY_STORAGE_KEY = "@valdinei:access_history";
const PROPERTIES_STORAGE_KEY = "@valdinei:properties";
const LEADS_STORAGE_KEY = "@valdinei:leads";

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

const trafficTotalLabelStyle = {
  fill: "var(--color-brand-secondary)",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 700,
};

const numberFormatter = new Intl.NumberFormat("pt-BR");
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

function formatPercent(value) {
  return `${value.toFixed(1).replace(".", ",")}%`;
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
  return readJsonArrayFromLocalStorage(PROPERTIES_STORAGE_KEY, initialProperties);
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
  return Object.values(history).reduce((total, record) => total + normalizeAccessRecord(record).total, 0);
}

function formatMetricValue(value) {
  return numberFormatter.format(value);
}

function formatRate(value) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

export default function Dashboard() {
  const { pathname } = useLocation();
  const [period, setPeriod] = useState("7d");
  const [accessHistory, setAccessHistory] = useState(() => loadAccessHistory());
  const [bairrosData, setBairrosData] = useState(() => loadBairrosData());
  const [filtersData, setFiltersData] = useState(() => loadFilterUsage());
  const [totalAccess, setTotalAccess] = useState(() => sumPageViews(loadAccessHistory()));
  const [totalProperties, setTotalProperties] = useState(() => loadProperties().length);
  const [pendingLeads, setPendingLeads] = useState(() => loadRequests().filter((request) => request.status === "Novo").length);
  const [totalLeads, setTotalLeads] = useState(() => loadRequests().length);
  const title = routeLabels[pathname] ?? routeLabels["/admin/dashboard"];
  const periodLabel = periodOptions.find((option) => option.value === period)?.label ?? "Últimos 7 dias";

  const reloadAnalyticsData = () => {
    const nextAccessHistory = loadAccessHistory();
    const nextProperties = loadProperties();
    const nextRequests = loadRequests();

    setAccessHistory(nextAccessHistory);
    setBairrosData(loadBairrosData());
    setFiltersData(loadFilterUsage());
    setTotalAccess(sumPageViews(nextAccessHistory));
    setTotalProperties(nextProperties.length);
    setPendingLeads(nextRequests.filter((request) => request.status === "Novo").length);
    setTotalLeads(nextRequests.length);
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

  const trafficSummary = useMemo(() => {
    const totals = accessChartData.reduce(
      (accumulator, item) => {
        accumulator.newClients += item.newClients || 0;
        accumulator.frequentClients += item.frequentClients || 0;
        accumulator.total += item.total || 0;
        return accumulator;
      },
      { total: 0, newClients: 0, frequentClients: 0 }
    );

    const totalTracked = totals.newClients + totals.frequentClients;
    const newShare = totalTracked > 0 ? (totals.newClients / totalTracked) * 100 : 0;
    const frequentShare = totalTracked > 0 ? (totals.frequentClients / totalTracked) * 100 : 0;
    const averagePerDay = accessChartData.length > 0 ? totals.total / accessChartData.length : 0;

    return {
      ...totals,
      totalTracked,
      newShare,
      frequentShare,
      averagePerDay,
    };
  }, [accessChartData]);

  const metricCards = useMemo(() => {
    const conversionRate = totalAccess > 0 ? (totalLeads / totalAccess) * 100 : 0;

    return [
      {
        label: "Total de Acessos",
        value: formatMetricValue(totalAccess),
        detail: "Page views registradas",
        icon: Users,
        badge: "Site",
      },
      {
        label: "Total de Imóveis",
        value: formatMetricValue(totalProperties),
        detail: "Estoques cadastrados",
        icon: Home,
        badge: "Estoque",
      },
      {
        label: "Solicitações Pendentes",
        value: formatMetricValue(pendingLeads),
        detail: "Leads com status Novo",
        icon: CalendarDays,
        badge: "Triagem",
      },
      {
        label: "Taxa de Conversão",
        value: formatRate(conversionRate),
        detail: `${formatMetricValue(totalLeads)} leads no funil`,
        icon: TrendingUp,
        badge: "Funil",
      },
    ];
  }, [pendingLeads, totalAccess, totalLeads, totalProperties]);

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
                Acompanhe os principais indicadores da Imobiliária Valdinei em uma visão clara e objetiva.
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
                    <span className={styles.metricBadge}>{card.badge}</span>
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
              <article className={`${styles.chartCard} ${styles.mainChartCard}`}>
                <div className={styles.chartHeader}>
                  <div>
                    <p className={styles.chartKicker}>Tráfego</p>
                    <h2 className={styles.chartTitle}>Acessos Diários</h2>
                  </div>
                  <p className={styles.chartDescription}>
                    Acessos únicos e recorrentes que aceitaram cookies em {periodLabel.toLowerCase()}.
                  </p>
                </div>

                <div className={styles.trafficLayout}>
                  {accessChartData.length > 0 ? (
                    <>
                      <div className={styles.trafficChart}>
                        <ResponsiveContainer width="100%" height={360}>
                          <BarChart data={accessChartData} margin={{ top: 24, right: 18, left: 0, bottom: 8 }}>
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
                              name="Novos / únicos"
                              stackId="traffic"
                              fill="var(--color-brand-primary)"
                              radius={[4, 4, 0, 0]}
                              barSize={28}
                            >
                              <LabelList
                                content={({ x, y, width, payload }) => {
                                  const total = payload?.total ?? 0;

                                  return (
                                    <text
                                      x={(x || 0) + (width || 0) / 2}
                                      y={(y || 0) - 8}
                                      textAnchor="middle"
                                      style={trafficTotalLabelStyle}
                                    >
                                      {total}
                                    </text>
                                  );
                                }}
                              />
                            </Bar>
                            <Bar
                              dataKey="frequentClients"
                              name="Recorrentes"
                              stackId="traffic"
                              fill="rgba(20, 20, 60, 0.9)"
                              radius={[4, 4, 0, 0]}
                              barSize={28}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <aside className={styles.trafficSummary}>
                        <div className={styles.summaryHeader}>
                          <p className={styles.summaryKicker}>Resumo executivo</p>
                          <h3 className={styles.summaryTitle}>Distribuição do período</h3>
                        </div>

                        <div className={styles.summaryStatCard}>
                          <span className={styles.summaryStatLabel}>Total de acessos</span>
                          <strong className={styles.summaryStatValue}>{trafficSummary.total}</strong>
                          <span className={styles.summaryStatHint}>
                            Média de {trafficSummary.averagePerDay.toFixed(1).replace(".", ",")} acessos por dia
                          </span>
                        </div>

                        <div className={styles.summarySplitList}>
                          <div className={styles.summarySplitItem}>
                            <div className={styles.summarySplitRow}>
                              <span className={styles.summarySwatchNew} />
                              <span>Novos / únicos</span>
                            </div>
                            <strong>{formatPercent(trafficSummary.newShare)}</strong>
                            <span>{trafficSummary.newClients} acessos</span>
                          </div>

                          <div className={styles.summarySplitItem}>
                            <div className={styles.summarySplitRow}>
                              <span className={styles.summarySwatchRecurring} />
                              <span>Recorrentes</span>
                            </div>
                            <strong>{formatPercent(trafficSummary.frequentShare)}</strong>
                            <span>{trafficSummary.frequentClients} acessos</span>
                          </div>
                        </div>
                      </aside>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <BarChart2 size={44} strokeWidth={1.5} />
                      <p>Nenhum acesso foi registrado ainda para comparar novos e recorrentes.</p>
                    </div>
                  )}
                </div>
              </article>
            </div>

            <div className={styles.bottomChartsContainer}>
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
                    <h2 className={styles.chartTitle}>Perfil de Busca</h2>
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
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
