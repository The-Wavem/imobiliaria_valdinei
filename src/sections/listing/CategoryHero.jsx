import styles from "./CategoryHero.module.css";

export default function CategoryHero({ category }) {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          <span>{category} um imóvel</span>
        </div>

        <h1>
          Imóveis para <br />
          <span>{category}</span>
        </h1>

        <p>
          Explore nossa seleção exclusiva de imóveis para {category.toLowerCase()} em Curitiba e região. Qualidade e confiança em cada metro quadrado.
        </p>
      </div>
    </section>
  );
}