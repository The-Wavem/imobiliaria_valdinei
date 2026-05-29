import { CalendarDays, Eye, MessageCircle } from "lucide-react";
import styles from "./LeadsStats.module.css";

const metricDefinitions = [
  {
    key: "novos",
    label: "Novas Solicitações",
    hint: "Entradas recentes",
    badge: "Prioridade",
    icon: MessageCircle,
  },
  {
    key: "atendimento",
    label: "Em Atendimento",
    hint: "Em curso ou agendadas",
    badge: "Operação",
    icon: CalendarDays,
  },
  {
    key: "finalizadas",
    label: "Finalizadas",
    hint: "Encerradas com status final",
    badge: "Conclusão",
    icon: Eye,
  },
];

export default function LeadsStats({ totalNovos = 0, totalAtendimento = 0, totalFinalizadas = 0 }) {
  const metricValues = {
    novos: totalNovos,
    atendimento: totalAtendimento,
    finalizadas: totalFinalizadas,
  };

  return (
    <section className={styles.section} aria-label="Métricas de solicitações">
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
              <p className={styles.value}>{metricValues[metric.key]}</p>
              <p className={styles.detail}>{metric.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}