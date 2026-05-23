import { useLocation } from "react-router-dom";
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
import { CalendarDays, ArrowUpRight, Home, TrendingUp, Users } from "lucide-react";
import AdminSidebar from "@components/layout/AdminSidebar";
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

const performanceData = [
  { month: "Jan", leads: 26, visits: 10 },
  { month: "Fev", leads: 32, visits: 14 },
  { month: "Mar", leads: 29, visits: 15 },
  { month: "Abr", leads: 41, visits: 19 },
  { month: "Mai", leads: 38, visits: 17 },
  { month: "Jun", leads: 45, visits: 21 },
  { month: "Jul", leads: 51, visits: 24 },
];

const interestData = [
  { name: "Residencial", value: 46 },
  { name: "Comercial", value: 24 },
  { name: "Lançamentos", value: 18 },
  { name: "Alto Padrão", value: 12 },
];

const regionData = [
  { name: "Centro", value: 36 },
  { name: "Zona Sul", value: 28 },
  { name: "Jardim Europa", value: 24 },
  { name: "Alphaville", value: 18 },
];

const chartPalette = ["var(--color-brand-primary)", "rgba(20, 20, 60, 0.9)", "rgba(71, 85, 105, 0.95)", "rgba(148, 163, 184, 0.95)"];

const routeLabels = {
  "/admin/dashboard": "Visão Geral",
  "/admin/imoveis": "Imóveis",
  "/admin/leads": "Leads",
  "/admin/visitas": "Visitas",
};

export default function Dashboard() {
  const { pathname } = useLocation();
  const title = routeLabels[pathname] ?? routeLabels["/admin/dashboard"];

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

          <section className={styles.chartsGrid} aria-label="Gráficos do dashboard">
            <article className={`${styles.chartCard} ${styles.chartCardWide}`}>
              <div className={styles.chartHeader}>
                <div>
                  <p className={styles.chartKicker}>Desempenho</p>
                  <h2 className={styles.chartTitle}>Captação de leads e visitas</h2>
                </div>
                <p className={styles.chartDescription}>Crescimento mensal da operação comercial.</p>
              </div>

              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity={0.34} />
                        <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(199, 156, 49, 0.08)" }}
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                      }}
                    />
                    <Legend verticalAlign="top" height={28} />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      name="Leads"
                      stroke="var(--color-brand-primary)"
                      strokeWidth={3}
                      fill="url(#performanceGradient)"
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
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <p className={styles.chartKicker}>Regiões</p>
                  <h2 className={styles.chartTitle}>Bairros mais procurados</h2>
                </div>
                <p className={styles.chartDescription}>Volume de buscas por localização.</p>
              </div>

              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(199, 156, 49, 0.08)" }}
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                      }}
                    />
                    <Bar dataKey="value" fill="var(--color-brand-primary)" radius={[8, 8, 0, 0]} barSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}