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
        <div className={styles.header}>
          <span className={styles.kicker}>Números que contam nossa história</span>
          <h2>Mais alcance, mais confiança e mais oportunidades para sua próxima escolha.</h2>
          <p>
            Uma operação preparada para apresentar as melhores opções com
            atendimento consultivo e proximidade em cada etapa.
          </p>
        </div>

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