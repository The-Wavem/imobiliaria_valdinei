import React from "react";
import styles from "./PropertyDescription.module.css";

export default function PropertyDescription({ description }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.subtitle}>Descrição</h2>
      <div 
        className={styles.richTextContainer}
        dangerouslySetInnerHTML={{ __html: description }} 
      />
    </section>
  );
}
