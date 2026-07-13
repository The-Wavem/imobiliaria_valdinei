import React from "react";
import { Bed, Bath, Maximize, CarFront, TreePine } from "lucide-react";
import styles from "./PropertyInfo.module.css";

export default function PropertyInfo({ beds, baths, area, landArea, parking }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.subtitle}>Ficha técnica</h3>
      <ul className={styles.info}>
        {beds > 0 && <li><Bed size={16} /><span>{beds} quarto{beds > 1 ? 's' : ''}</span></li>}
        {baths > 0 && <li><Bath size={16} /><span>{baths} banheiro{baths > 1 ? 's' : ''}</span></li>}
        {area > 0 && <li><Maximize size={16} /><span>{area} m² construídos</span></li>}
        {landArea > 0 && <li><TreePine size={16} /><span>{landArea} m² de terreno</span></li>}
        {parking > 0 && <li><CarFront size={16} /><span>{parking} vaga{parking > 1 ? 's' : ''}</span></li>}
      </ul>
    </section>
  );
}
