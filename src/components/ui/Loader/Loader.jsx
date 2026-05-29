import { motion } from "framer-motion";
import styles from "./Loader.module.css";

export default function Loader({ size = 40 }) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <div className={styles.container} style={{ width: dimension, height: dimension }} aria-label="Carregando" role="status">
      <motion.div
        className={styles.ringOuter}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className={styles.ringInner}
        animate={{ rotate: -360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}