import styles from "./CategoryHero.module.css";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CategoryHero({ title, bgImage, videoSrc }) {
  const fadeUpItem = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
  };

  return (
    <section 
      className={styles.hero} 
      style={!videoSrc && bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      {videoSrc && (
        <video 
          src={videoSrc} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className={styles.bgVideo} 
          poster={bgImage} 
        />
      )}
      <div className={styles.overlay} />

      <motion.div className={styles.content} variants={fadeUpItem}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          <span>Explorar catálogo</span>
        </div>

        <h1>
          {title.substring(0, title.lastIndexOf(" "))} <br />
          <span>{title.substring(title.lastIndexOf(" ") + 1)}</span>
        </h1>

        <p>
          Explore nossa seleção exclusiva em Curitiba e região. 
          Qualidade e confiança em cada metro quadrado.
        </p>
      </motion.div>

      <button type="button" className={styles.scrollIndicator} onClick={handleScrollDown} aria-label="Rolar para o catálogo">
        <ChevronDown size={40} className={styles.scrollIcon} />
      </button>
    </section>
  );
}
