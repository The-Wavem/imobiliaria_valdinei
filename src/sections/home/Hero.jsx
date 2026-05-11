// src/sections/home/Hero.jsx
import React from "react";
import Button from "@components/ui/Button/Button";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.heroContainer}>
      <div className={styles.content}>
        <h1>Encontre o imóvel dos seus sonhos</h1>
        <p>
          A Imobiliária Valdinei tem as melhores opções em Curitiba e região.
        </p>

        <div className={styles.actionButtons}>
          <Button variant="primary">Ver Imóveis para Alugar</Button>
          <Button variant="outline">Falar com Corretor</Button>
        </div>
      </div>
    </section>
  );
}
