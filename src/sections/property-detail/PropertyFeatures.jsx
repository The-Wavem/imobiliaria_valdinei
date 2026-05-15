import React from "react";
import styles from "./PropertyFeatures.module.css";

export default function PropertyFeatures({ features = [] }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.subtitle}>Características</h3>
      <div className={styles.features}>
        {features.map((f) => (
          <span key={f} className={styles.feature}>{f}</span>
        ))}
      </div>
    </section>
  );
}
