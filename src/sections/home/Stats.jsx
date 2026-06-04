import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import styles from "./Stats.module.css";

const stats = [
  { numeric: 15, suffix: " mil+", label: "Imóveis ativos" },
  { numeric: 3, suffix: " mil+", label: "Clientes atendidos" },
  { numeric: 98, suffix: "%", label: "Satisfação dos clientes" },
  { numeric: 20, suffix: "+", label: "Anos de mercado" },
];

function CountUpItem({ numeric, suffix, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 80 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(numeric);
    }
  }, [isInView, motionValue, numeric]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest) + suffix;
      }
    });
    return () => unsubscribe();
  }, [springValue, suffix]);

  return (
    <article className={styles.card}>
      <strong ref={ref}>0{suffix}</strong>
      <span>{label}</span>
    </article>
  );
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } 
  },
};

export default function Stats() {
  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUpItem}>
              <CountUpItem numeric={stat.numeric} suffix={stat.suffix} label={stat.label} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
