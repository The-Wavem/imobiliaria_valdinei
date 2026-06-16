import styles from "./CategoryHero.module.css";
import { motion } from "framer-motion";

export default function CategoryHero({ category }) {
  const fadeUpItem = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <motion.div className={styles.content} variants={fadeUpItem}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          <span>{category} um imóvel</span>
        </div>

        <h1>
          Imóveis para <br />
          <span>{category}</span>
        </h1>

        <p>
          Explore nossa seleção exclusiva de imóveis para{" "}
          {category.toLowerCase()} em Curitiba e região. Qualidade e confiança
          em cada metro quadrado.
        </p>
      </motion.div>
    </section>
  );
}
