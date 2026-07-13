import { motion } from "framer-motion";
import styles from "./Loader.module.css";

export default function Loader({ size = 40 }) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <motion.svg
      className={styles.container}
      style={{ width: dimension, height: dimension }}
      viewBox="0 0 100 100"
      aria-label="Carregando"
      role="status"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
    >
      <circle className={styles.guide} cx="50" cy="50" r="36" />

      <motion.circle
        className={styles.arc}
        cx="50"
        cy="50"
        r="36"
        animate={{
          strokeDasharray: ["18 212", "84 146", "18 212"],
          strokeDashoffset: [0, -34, -68],
        }}
        transition={{ duration: 1.65, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      />
    </motion.svg>
  );
}