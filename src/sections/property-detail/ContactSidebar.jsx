import React from "react";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./ContactSidebar.module.css";

export default function ContactSidebar({ code, price, condo, iptu }) {
  return (
    <aside className={styles.sidebarInner}>
      <div className={styles.priceWrap}>
        <div className={styles.priceLabel}>Preço</div>
        <div className={styles.priceValue}>{price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
        <div className={styles.code}>Código: {code}</div>
      </div>

      <div className={styles.taxes}>
        <div>Condomínio: {condo ? condo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</div>
        <div>IPTU: {iptu ? iptu.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</div>
      </div>

      <div className={styles.cta}>
        <Button variant="primary">Agendar Visita</Button>
        <Button variant="outline">WhatsApp</Button>
      </div>
    </aside>
  );
}
