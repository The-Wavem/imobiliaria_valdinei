import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./HomeAbout.module.css";
import valdineiHomeImg from "../../assets/images/valdinei-home.webp";
import logoImg from "../../assets/images/logo.png";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const slideRightItem = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
};

export default function HomeAbout() {
  return (
    <section className={styles.section}>
      <motion.div 
        className={styles.container}
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.imageWrapper} variants={slideRightItem}>
          <img 
            src={valdineiHomeImg}
            srcSet={`${valdineiHomeImg} 600w, ${valdineiHomeImg} 1200w`}
            sizes="(max-width: 768px) 100vw, 600px"
            alt="Corretor Valdinei" 
            className={styles.image}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = logoImg;
            }}
          />
        </motion.div>

        <div className={styles.content}>
          <motion.span className={styles.kicker} variants={fadeUpItem}>
            CONHEÇA QUEM REALIZA SEUS SONHOS
          </motion.span>
          <motion.h2 className={styles.title} variants={fadeUpItem}>
            Valdinei, seu parceiro na busca pelo imóvel ideal
          </motion.h2>
          <motion.p className={styles.description} variants={fadeUpItem}>
            Com forte atuação na região, oferecemos um atendimento exclusivo e personalizado para garantir que a sua próxima conquista seja perfeita e segura.
          </motion.p>
          <motion.div variants={fadeUpItem}>
            <Link to="/sobre" className={styles.button}>
              Saber mais sobre nossa história
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
