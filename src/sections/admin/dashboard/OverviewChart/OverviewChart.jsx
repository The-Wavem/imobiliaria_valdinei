import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
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

const tooltipItemStyle = {
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-sans)",
};

const totalLabelStyle = {
  fill: "var(--color-brand-secondary)",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 700,
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
              Acompanhe o volume de acessos registrado no período selecionado, em {periodLabel.toLowerCase()}.
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
                    <linearGradient id="overviewGradientAccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTickStyle} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
                  <Tooltip
                    cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Area
                    dataKey="acessos"
                    name="Acessos"
                    type="monotone"
                    stroke="var(--color-primary)"
                    fill="url(#overviewGradientAccess)"
                  >
                    <LabelList
                      content={({ x, y, width, payload }) => {
                        const total = payload?.acessos ?? 0;

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
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <BarChart2 size={44} strokeWidth={1.5} />
                <p>Nenhum acesso foi registrado ainda para exibir o gráfico do período.</p>
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
                  <span>Pico do período</span>
                </div>
                <strong>{numberFormatter.format(summary.peakValue || 0)}</strong>
                <span>{summary.peakLabel || "Sem dados"}</span>
              </div>

              <div className={styles.summarySplitItem}>
                <div className={styles.summarySplitRow}>
                  <span className={styles.summarySwatchRecurring} />
                  <span>Dias analisados</span>
                </div>
                <strong>{numberFormatter.format(data.length || 0)}</strong>
                <span>{periodLabel}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}