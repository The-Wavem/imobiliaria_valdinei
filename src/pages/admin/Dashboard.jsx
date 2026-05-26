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

const fallbackAccessData = [
  { name: "20-Mai", acessos: 12 },
  { name: "21-Mai", acessos: 15 },
  { name: "22-Mai", acessos: 14 },
  { name: "23-Mai", acessos: 18 },
  { name: "24-Mai", acessos: 17 },
  { name: "25-Mai", acessos: 21 },
  { name: "26-Mai", acessos: 19 },
];

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

function formatAccessLabel(dateValue) {
  const [year = "", month = "", day = ""] = String(dateValue || "").split("-");

  if (!year || !month || !day) {
    return dateValue;
  }

  const monthIndex = Number(month) - 1;
  const monthLabel = monthLabels[monthIndex] || month;
  return `${day}-${monthLabel}`;
}

function buildDailySeries(totalDays, historyMap) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - (totalDays - 1 - index));
    const key = toISODate(currentDate);

    return {
      date: key,
      name: formatDailyLabel(currentDate),
      acessos: Number(historyMap[key]) || 0,
    };
  });
}

function buildYearSeries(historyMap) {
  const currentYear = new Date().getFullYear();
  const nextMonthTotals = Array.from({ length: 12 }, () => 0);

  Object.entries(historyMap).forEach(([dateKey, acessos]) => {
    if (!dateKey.startsWith(`${currentYear}-`)) {
      return;
    }

    const monthIndex = Number(dateKey.slice(5, 7)) - 1;

    if (monthIndex >= 0 && monthIndex < 12) {
      nextMonthTotals[monthIndex] += Number(acessos) || 0;
    }
  });

  return nextMonthTotals.map((acessos, index) => ({
    date: `${currentYear}-${padNumber(index + 1)}-01`,
    name: monthLabels[index],
    acessos,
  }));
}

export default function Dashboard() {
  const { pathname } = useLocation();
  const [period, setPeriod] = useState("7d");
  const [accessData, setAccessData] = useState([]);
  const [bairrosData, setBairrosData] = useState([]);
  const title = routeLabels[pathname] ?? routeLabels["/admin/dashboard"];
  const periodLabel = periodOptions.find((option) => option.value === period)?.label ?? "Últimos 7 dias";

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem("@valdinei:access_history");
      const history = rawValue ? JSON.parse(rawValue) : {};

      const nextAccessData = Object.entries(history)
        .map(([date, acessos]) => ({
          name: formatAccessLabel(date),
          acessos: Number(acessos) || 0,
          date,
        }))
        .sort((leftItem, rightItem) => leftItem.date.localeCompare(rightItem.date));

      setAccessData(nextAccessData);
    } catch {
      setAccessData([]);
    }
  }, []);

  const accessChartData = useMemo(() => {
    const historyMap = accessData.reduce((accumulator, item) => {
      accumulator[item.date] = item.acessos;
      return accumulator;
    }, {});

    if (period === "7d") {
      return accessData.length > 0 ? buildDailySeries(7, historyMap) : fallbackAccessData;
    }

    if (period === "30d") {
      return accessData.length > 0 ? buildDailySeries(30, historyMap) : fallbackAccessData;
    }

    return accessData.length > 0 ? buildYearSeries(historyMap) : fallbackAccessData;
  }, [accessData, period]);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem("@valdinei:bairros");
      const stats = rawValue ? JSON.parse(rawValue) : {};

      const nextBairrosData = Object.entries(stats)
        .map(([bairro, acessos]) => ({ bairro, acessos: Number(acessos) || 0 }))
        .sort((leftItem, rightItem) => rightItem.acessos - leftItem.acessos)
        .slice(0, 5);

      setBairrosData(nextBairrosData);
    } catch {
      setBairrosData([]);
    }
  }, []);

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
                        dataKey="acessos"
                        name="Acessos"
                        stroke="var(--color-brand-primary)"
                        strokeWidth={3}
                        fill="url(#colorVisitas)"
                        dot={{ r: 3, fill: "var(--color-brand-primary)", strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

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
            </div>

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
          </section>
        </div>
      </main>
    </div>
  );
}