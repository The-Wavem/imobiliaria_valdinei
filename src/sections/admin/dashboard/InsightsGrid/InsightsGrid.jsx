import { BarChart2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./InsightsGrid.module.css";

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

export default function InsightsGrid({ bairrosData = [], filtersData = [] }) {
  return (
    <section className={styles.section} aria-label="Inteligência de mercado">
      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.header}>
            <div>
              <p className={styles.kicker}>Inteligência de Mercado</p>
              <h2 className={styles.title}>Bairros mais buscados</h2>
            </div>
            <p className={styles.description}>Onde a intenção de clique está mais forte.</p>
          </div>

          <div className={styles.body}>
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
                  <Bar dataKey="acessos" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={34} />
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

        <article className={styles.card}>
          <div className={styles.header}>
            <div>
              <p className={styles.kicker}>Interesse</p>
              <h2 className={styles.title}>Perfil de Busca</h2>
            </div>
            <p className={styles.description}>Os filtros mais acionados nas páginas públicas.</p>
          </div>

          <div className={styles.body}>
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
                  <Bar dataKey="value" name="Seleções" fill="var(--color-primary)" radius={[0, 8, 8, 0]} barSize={22} />
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
  );
}