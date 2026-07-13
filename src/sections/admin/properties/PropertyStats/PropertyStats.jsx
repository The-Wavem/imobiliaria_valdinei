import { BadgeCheck, Ban, Building2, Key, Handshake, CalendarClock } from "lucide-react";
import styles from "./PropertyStats.module.css";

const stats = [
  {
    key: "total",
    label: "Total",
    hint: "Imóveis cadastrados",
    icon: Building2,
  },
  {
    key: "disponiveis",
    label: "Disponíveis",
    hint: "Prontos para negócio",
    icon: BadgeCheck,
  },
  {
    key: "reservados",
    label: "Reservados",
    hint: "Aguardando fechamento",
    icon: CalendarClock,
  },
  {
    key: "vendidos",
    label: "Vendidos",
    hint: "Negócio concluído",
    icon: Handshake,
  },
  {
    key: "alugados",
    label: "Alugados",
    hint: "Com contrato ativo",
    icon: Key,
  },
  {
    key: "inativos",
    label: "Inativos",
    hint: "Ocultos do sistema",
    icon: Ban,
  },
];

export default function PropertyStats({ total = 0, disponiveis = 0, reservados = 0, vendidos = 0, alugados = 0, inativos = 0 }) {
  const values = { total, disponiveis, reservados, vendidos, alugados, inativos };

  return (
    <section className={styles.section} aria-label="Resumo dos imóveis">
      <div className={styles.grid}>
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.key} className={styles.card}>
              <div className={styles.topRow}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <Icon size={20} />
                </div>
                <span className={styles.kicker}>{stat.label}</span>
              </div>

              <p className={styles.value}>{values[stat.key]}</p>
              <p className={styles.hint}>{stat.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}