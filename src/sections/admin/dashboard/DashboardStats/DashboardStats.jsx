import { CalendarDays, Home, Users } from "lucide-react";
import styles from "./DashboardStats.module.css";

const numberFormatter = new Intl.NumberFormat("pt-BR");

const metricDefinitions = [
  {
    key: "access",
    label: "Total de Acessos",
    detail: "Page views registradas",
    badge: "Site",
    icon: Users,
  },
  {
    key: "properties",
    label: "Total de Imóveis",
    detail: "Estoques cadastrados",
    badge: "Estoque",
    icon: Home,
  },
  {
    key: "requests",
    label: "Solicitações",
    detail: "Leads com status Novo",
    badge: "Triagem",
    icon: CalendarDays,
  },
];

export default function DashboardStats({ totalAccess = 0, totalProperties = 0, pendingLeads = 0 }) {
  const metricValues = {
    access: totalAccess,
    properties: totalProperties,
    requests: pendingLeads,
  };

  return (
    <section className={styles.section} aria-label="Resumo de métricas">
      <div className={styles.grid}>
        {metricDefinitions.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.key} className={styles.card}>
              <div className={styles.topRow}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <Icon size={22} />
                </div>
                <span className={styles.badge}>{metric.badge}</span>
              </div>

              <p className={styles.label}>{metric.label}</p>
              <p className={styles.value}>{numberFormatter.format(metricValues[metric.key])}</p>
              <p className={styles.detail}>{metric.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}