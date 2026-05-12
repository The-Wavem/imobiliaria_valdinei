import styles from "./Stats.module.css";

const stats = [
  {
    value: "15 mil+",
    label: "Imóveis ativos",
  },
  {
    value: "3 mil+",
    label: "Clientes atendidos",
  },
  {
    value: "98%",
    label: "Satisfação dos clientes",
  },
  {
    value: "20+",
    label: "Anos de mercado",
  },
];

export default function Stats() {
  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {stats.map((stat) => (
            <article className={styles.card} key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
