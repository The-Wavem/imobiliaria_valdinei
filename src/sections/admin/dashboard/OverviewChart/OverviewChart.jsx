import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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

const tooltipItemStyle = {
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-sans)",
};

const formatDataBR = (dateStr) => {
  if (!dateStr) return "";

  const parts = String(dateStr).split("-");

  if (parts.length === 2) {
    const monthIndex = parseInt(parts[1], 10) - 1;
    const meses = [
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
    return meses[monthIndex] || dateStr;
  }

  if (parts.length === 3) {
    const [, month, day] = parts;
    return `${day}/${month}`;
  }

  return String(dateStr);
};

const formatDateToString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function OverviewChart({ data = [], period, onPeriodChange }) {

  const chartData = useMemo(() => {
    if (period === "year") {
      const currentYear = new Date().getFullYear();
      const template = Array.from({ length: 12 }, (_, i) => {
        return {
          date: `${currentYear}-${String(i + 1).padStart(2, "0")}`,
          acessos: 0,
          novosClientes: 0,
        };
      });

      data.forEach((curr) => {
        if (!curr.date) return;
        const monthStr = curr.date.substring(0, 7);
        const target = template.find((t) => t.date === monthStr);
        if (target) {
          target.acessos += Number(curr.acessos) || 0;
          target.novosClientes += Number(curr.novosClientes) || 0;
        }
      });
      return template;
    }

    const daysCount = period === "7d" ? 7 : 30;
    const today = new Date();

    const template = Array.from({ length: daysCount }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (daysCount - 1 - i));
      return {
        date: formatDateToString(d),
        acessos: 0,
        novosClientes: 0,
      };
    });

    data.forEach((curr) => {
      if (!curr.date) return;
      const target = template.find((t) => t.date === curr.date);
      if (target) {
        target.acessos += Number(curr.acessos) || 0;
        target.novosClientes += Number(curr.novosClientes) || 0;
      }
    });

    return template;
  }, [data, period]);

  const hasData = data && data.length > 0;
  const totalAcessos = chartData.reduce(
    (acc, curr) => acc + (curr.acessos || 0),
    0,
  );
  const totalNewClients = chartData.reduce(
    (acc, curr) => acc + (curr.novosClientes || 0),
    0,
  );
  const timeDivisor = chartData.length || 1;
  const mediaAcessos = (totalAcessos / timeDivisor)
    .toFixed(1)
    .replace(".", ",");
  const peakItem = hasData
    ? chartData.reduce(
        (max, curr) => (curr.acessos > max.acessos ? curr : max),
        chartData[0],
      )
    : null;

  const periodText =
    {
      "7d": "nos últimos 7 dias",
      "30d": "nos últimos 30 dias",
      year: "neste ano",
    }[period] || "no período selecionado";

  return (
    <section className={styles.section} aria-label="Visão geral de tráfego">
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Tráfego</p>
            <h2 className={styles.title}>
              Acessos {period === "year" ? "Mensais" : "Diários"}
            </h2>
            <p className={styles.subtitle}>
              Acompanhe o volume de acessos registrado {periodText}.
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
                <AreaChart
                  data={chartData}
                  margin={{ top: 24, right: 18, left: 0, bottom: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAcessos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.06}
                      />
                    </linearGradient>
                    <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-brand-secondary)"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-brand-secondary)"
                        stopOpacity={0.06}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={axisTickStyle}
                    tickFormatter={formatDataBR}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={axisTickStyle}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(199, 156, 49, 0.06)" }}
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                    labelFormatter={formatDataBR}
                  />
                  <Legend
                    verticalAlign="top"
                    align="left"
                    iconType="square"
                    height={32}
                  />
                  <Area
                    dataKey="acessos"
                    name="Acessos Gerais"
                    type="monotone"
                    stroke="var(--color-primary)"
                    fill="url(#colorAcessos)"
                  />
                  <Area
                    dataKey="novosClientes"
                    name="Novos Clientes"
                    type="monotone"
                    stroke="var(--color-brand-secondary)"
                    fill="url(#colorNovos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <BarChart2 size={44} strokeWidth={1.5} />
                <p>
                  Nenhum acesso foi registrado ainda para exibir o gráfico do
                  período.
                </p>
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
              <strong className={styles.summaryStatValue}>
                {numberFormatter.format(totalAcessos)}
              </strong>
              <span className={styles.summaryStatHint}>
                Média de {mediaAcessos} acessos por{" "}
                {period === "year" ? "mês" : "dia"}
              </span>
            </div>

            <div className={styles.summarySplitList}>
              <div className={styles.summarySplitItem}>
                <div className={styles.summarySplitRow}>
                  <span className={styles.summarySwatchNew} />
                  <span>Pico do período</span>
                </div>
                <strong>
                  {peakItem && peakItem.acessos > 0
                    ? numberFormatter.format(peakItem.acessos)
                    : 0}
                </strong>
                <span>
                  {peakItem && peakItem.acessos > 0
                    ? formatDataBR(peakItem.date)
                    : "Sem dados"}
                </span>
              </div>

              <div className={styles.summarySplitItem}>
                <div className={styles.summarySplitRow}>
                  <span className={styles.summarySwatchRecurring} />
                  <span>Total de Aceites</span>
                </div>
                <strong>{numberFormatter.format(totalNewClients)}</strong>
                <span>Total de termos de privacidade aceitos</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
