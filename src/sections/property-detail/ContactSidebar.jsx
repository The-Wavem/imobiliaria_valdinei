import React from "react";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./ContactSidebar.module.css";

export default function ContactSidebar({ code, price, condo, iptu, onScheduleVisit }) {
  return (
    <aside className={styles.sidebarInner}>
      <div className={styles.agentCard}>
        <img
          className={styles.agentPhoto}
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
          alt="Valdinei Souza"
        />
        <div className={styles.agentMeta}>
          <div className={styles.agentName}>Valdinei Souza</div>
          <div className={styles.agentRole}>Corretor Responsável</div>
        </div>
      </div>

      <div className={styles.priceWrap}>
        <div className={styles.priceLabel}>Preço</div>
        <div className={styles.priceValue}>
          <span className={styles.currency}>R$</span>
          <span className={styles.amount}>{price.toLocaleString("pt-BR")}</span>
        </div>
        <div className={styles.code}>Código: {code}</div>
      </div>

      <div className={styles.taxes}>
        <div>Condomínio: {condo ? condo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</div>
        <div>IPTU: {iptu ? iptu.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</div>
      </div>

      <div className={styles.cta}>
        <Button type="button" variant="primary" onClick={onScheduleVisit}>
          Agendar Visita
        </Button>
        <Button variant="outline" className={styles.whatsappButton}>
          WhatsApp
        </Button>
      </div>
    </aside>
  );
}
