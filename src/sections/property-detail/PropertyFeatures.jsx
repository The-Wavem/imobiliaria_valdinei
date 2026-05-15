import React from "react";
import styles from "./PropertyFeatures.module.css";

export default function PropertyFeatures({ features = [] }) {
  return (
    <div className={styles.features}>
      {features.map((f) => (
        <span key={f} className={styles.feature}>{f}</span>
      ))}
    </div>
  );
}
