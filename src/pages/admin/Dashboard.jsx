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
  Line,
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

const performanceDataByPeriod = {
  "7d": [
    { period: "Seg", leads: 12, visits: 5 },
    { period: "Ter", leads: 14, visits: 6 },
    { period: "Qua", leads: 10, visits: 4 },
    { period: "Qui", leads: 18, visits: 8 },
    { period: "Sex", leads: 16, visits: 7 },
    { period: "Sáb", leads: 9, visits: 3 },
    { period: "Dom", leads: 11, visits: 4 },
  ],
  "30d": [
    { period: "Sem 1", leads: 26, visits: 10 },
    { period: "Sem 2", leads: 32, visits: 14 },
    { period: "Sem 3", leads: 29, visits: 12 },
    { period: "Sem 4", leads: 41, visits: 19 },
  ],
  year: [
    { period: "Jan", leads: 26, visits: 10 },
    { period: "Fev", leads: 32, visits: 14 },
    { period: "Mar", leads: 29, visits: 15 },
    { period: "Abr", leads: 41, visits: 19 },
    { period: "Mai", leads: 38, visits: 17 },
    { period: "Jun", leads: 45, visits: 21 },
    { period: "Jul", leads: 51, visits: 24 },
  ],
};

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

export default function Dashboard() {
  const { pathname } = useLocation();
  const [period, setPeriod] = useState("7d");
  const [bairrosData, setBairrosData] = useState([]);
  const title = routeLabels[pathname] ?? routeLabels["/admin/dashboard"];
  const periodLabel = periodOptions.find((option) => option.value === period)?.label ?? "Últimos 7 dias";
  const performanceData = useMemo(() => performanceDataByPeriod[period] ?? performanceDataByPeriod["7d"], [period]);

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
                    <p className={styles.chartKicker}>Desempenho</p>
                    <h2 className={styles.chartTitle}>Captação de leads e visitas</h2>
                  </div>
                  <p className={styles.chartDescription}>Visão consolidada de {periodLabel.toLowerCase()}.</p>
                </div>

                <div className={styles.chartBody}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-brand-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={axisTickStyle} />
                      <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
                      <Tooltip
                        cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Legend verticalAlign="top" height={28} wrapperStyle={{ fontFamily: "var(--font-sans)" }} />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        name="Leads"
                        stroke="var(--color-brand-primary)"
                        strokeWidth={3}
                        fill="url(#colorVisitas)"
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visits"
                        name="Visitas"
                        stroke="var(--color-brand-secondary)"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                        activeDot={{ r: 7 }}
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