import React from "react";
import { Bed, Bath, Maximize } from "lucide-react";
import styles from "./PropertyInfo.module.css";

export default function PropertyInfo({ beds, baths, area, parking }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.subtitle}>Ficha técnica</h3>
      <ul className={styles.info}>
        <li><Bed size={16} /><span>{beds} quarto{beds > 1 ? 's' : ''}</span></li>
        <li><Bath size={16} /><span>{baths} banheiro{baths > 1 ? 's' : ''}</span></li>
        <li><Maximize size={16} /><span>{area} m²</span></li>
        <li><span>Vagas</span><span>{parking}</span></li>
      </ul>
    </section>
  );
}
