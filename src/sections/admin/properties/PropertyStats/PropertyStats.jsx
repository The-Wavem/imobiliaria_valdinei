import { BadgeCheck, Ban, Building2 } from "lucide-react";
import styles from "./PropertyStats.module.css";

const stats = [
  {
    key: "total",
    label: "Total",
    hint: "Imóveis cadastrados",
    icon: Building2,
  },
  {
    key: "ativos",
    label: "Ativos",
    hint: "Publicados na vitrine",
    icon: BadgeCheck,
  },
  {
    key: "inativos",
    label: "Inativos",
    hint: "Não exibidos ao público",
    icon: Ban,
  },
];

export default function PropertyStats({ total = 0, ativos = 0, inativos = 0 }) {
  const values = { total, ativos, inativos };

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