import React from "react";
import styles from "./PropertyDescription.module.css";

export default function PropertyDescription({ description }) {
  return (
    <section className={styles.desc}>
      <h2>Descrição</h2>
      <p>{description}</p>
    </section>
  );
}
