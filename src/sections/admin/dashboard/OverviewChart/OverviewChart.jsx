import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./OverviewChart.module.css";

const numberFormatter = new Intl.NumberFormat("pt-BR");

const periodOptions = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este Ano", value: "year" },
];

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

const totalLabelStyle = {
  fill: "var(--color-brand-secondary)",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 700,
};

function formatPercent(value) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

export default function OverviewChart({ data, period, onPeriodChange, summary = {} }) {
  const periodLabel = periodOptions.find((option) => option.value === period)?.label ?? "Últimos 7 dias";
  const hasData = data.length > 0;

  return (
    <section className={styles.section} aria-label="Visão geral de tráfego">
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Tráfego</p>
            <h2 className={styles.title}>Acessos Diários</h2>
            <p className={styles.subtitle}>
              Acompanhe os acessos únicos e recorrentes que aceitaram cookies em {periodLabel.toLowerCase()}.
            </p>
          </div>

          <div className={styles.actions}>
            <div className={styles.periodWrap}>
              <Select
                compact
                label="Período"
                options={periodOptions}
                value={period}
                onChange={onPeriodChange}
                className={styles.periodSelect}
              />
            </div>

            <Link to="/admin/imoveis" className={styles.ctaLink}>
              <ArrowUpRight size={18} />
              <span>Novo imóvel</span>
            </Link>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.chartWrap}>
            {hasData ? (
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={data} margin={{ top: 24, right: 18, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="overviewGradientNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.06} />
                    </linearGradient>
                    <linearGradient id="overviewGradientRecurring" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-secondary)" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="var(--color-brand-secondary)" stopOpacity={0.08} />
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
                  <Legend verticalAlign="top" height={28} wrapperStyle={{ fontFamily: "var(--font-sans)" }} />
                  <Area
                    dataKey="newClients"
                    name="Novos / únicos"
                    stackId="traffic"
                    type="monotone"
                    stroke="var(--color-primary)"
                    fill="url(#overviewGradientNew)"
                  >
                    <LabelList
                      content={({ x, y, width, payload }) => {
                        const total = payload?.total ?? 0;

                        return (
                          <text
                            x={(x || 0) + (width || 0) / 2}
                            y={(y || 0) - 8}
                            textAnchor="middle"
                            style={totalLabelStyle}
                          >
                            {total}
                          </text>
                        );
                      }}
                    />
                  </Area>
                  <Area
                    dataKey="frequentClients"
                    name="Recorrentes"
                    stackId="traffic"
                    type="monotone"
                    stroke="var(--color-brand-secondary)"
                    fill="url(#overviewGradientRecurring)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <BarChart2 size={44} strokeWidth={1.5} />
                <p>Nenhum acesso foi registrado ainda para comparar novos e recorrentes.</p>
              </div>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryHeader}>
              <p className={styles.summaryKicker}>Resumo executivo</p>
              <h3 className={styles.summaryTitle}>Distribuição do período</h3>
            </div>

            <div className={styles.summaryStatCard}>
              <span className={styles.summaryStatLabel}>Total de acessos</span>
              <strong className={styles.summaryStatValue}>{numberFormatter.format(summary.total || 0)}</strong>
              <span className={styles.summaryStatHint}>
                Média de {(summary.averagePerDay || 0).toFixed(1).replace(".", ",")} acessos por dia
              </span>
            </div>

            <div className={styles.summarySplitList}>
              <div className={styles.summarySplitItem}>
                <div className={styles.summarySplitRow}>
                  <span className={styles.summarySwatchNew} />
                  <span>Novos / únicos</span>
                </div>
                <strong>{formatPercent(summary.newShare || 0)}</strong>
                <span>{numberFormatter.format(summary.newClients || 0)} acessos</span>
              </div>

              <div className={styles.summarySplitItem}>
                <div className={styles.summarySplitRow}>
                  <span className={styles.summarySwatchRecurring} />
                  <span>Recorrentes</span>
                </div>
                <strong>{formatPercent(summary.frequentShare || 0)}</strong>
                <span>{numberFormatter.format(summary.frequentClients || 0)} acessos</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}