import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import styles from "./PerformanceChart.module.css";

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
  padding: "12px 16px",
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
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
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

export default function PerformanceChart({ properties = [], period = "7d" }) {
  const chartData = useMemo(() => {
    if (period === "year") {
      const currentYear = new Date().getFullYear();
      const template = Array.from({ length: 12 }, (_, i) => ({
        date: `${currentYear}-${String(i + 1).padStart(2, "0")}`,
        vendidos: 0,
        alugados: 0,
      }));

      properties.forEach((prop) => {
        let dateStrToUse = prop.statusUpdatedAt || prop.updatedAt || prop.createdAt || (prop.audit && prop.audit.createdAt);
        if (!dateStrToUse) return;
        const date = new Date(dateStrToUse);
        if (isNaN(date.getTime())) return;

        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const target = template.find((t) => t.date === monthStr);
        if (target) {
          if (prop.status === "Vendido") target.vendidos += 1;
          else if (prop.status === "Alugado") target.alugados += 1;
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
        vendidos: 0,
        alugados: 0,
      };
    });

    properties.forEach((prop) => {
      let dateStrToUse = prop.statusUpdatedAt || prop.updatedAt || prop.createdAt || (prop.audit && prop.audit.createdAt);
      if (!dateStrToUse) return;
      const date = new Date(dateStrToUse);
      if (isNaN(date.getTime())) return;

      const dateStr = formatDateToString(date);
      const target = template.find((t) => t.date === dateStr);
      if (target) {
        if (prop.status === "Vendido") target.vendidos += 1;
        else if (prop.status === "Alugado") target.alugados += 1;
      }
    });

    return template;
  }, [properties, period]);

  const hasData = chartData.some(d => d.vendidos > 0 || d.alugados > 0);

  if (!hasData) {
    return null;
  }

  return (
    <div className={styles.chartContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>Performance de Negócios (Vendidos vs Alugados)</h2>
      </header>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 24, right: 30, left: 20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
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
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ stroke: "rgba(199, 156, 49, 0.06)", strokeWidth: 2 }}
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              labelFormatter={formatDataBR}
            />
            <Legend 
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px' }} 
            />
            <Line 
              type="monotone" 
              name="Vendidos"
              dataKey="vendidos" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: '#fff', strokeWidth: 2 }} 
              dot={false}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              name="Alugados"
              dataKey="alugados" 
              stroke="var(--color-brand-secondary)" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: 'var(--color-brand-secondary)', stroke: '#fff', strokeWidth: 2 }} 
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
