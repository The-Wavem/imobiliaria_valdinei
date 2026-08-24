import React, { useState } from "react";
import { MapPin, Share2 } from "lucide-react";
import styles from "./PropertyHeader.module.css";
import ShareModal from "./ShareModal.jsx";

export default function PropertyHeader({ 
  title, 
  location, 
  propertyId,
  price,
  rentPrice,
  condo,
  iptu,
  category,
  sobConsulta,
}) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.location}><MapPin size={14} /> <span>{location}</span></div>
        
        {/* Mobile Price Card */}
        <div className={styles.mobilePriceCard}>
          {(category === "Venda e Aluguel" || category === "Ambos") ? (
            <>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Venda</span>
                <span className={styles.priceValue}>{!sobConsulta && price > 0 ? `R$ ${price.toLocaleString("pt-BR")}` : "Sob consulta"}</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Aluguel</span>
                <span className={styles.priceValue}>{!sobConsulta && rentPrice > 0 ? `R$ ${rentPrice.toLocaleString("pt-BR")}/mês` : "Sob consulta"}</span>
              </div>
            </>
          ) : category === "Alugar" ? (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Aluguel</span>
              <span className={styles.priceValue}>{!sobConsulta && (rentPrice > 0 || price > 0) ? `R$ ${(rentPrice || price).toLocaleString("pt-BR")}/mês` : "Sob consulta"}</span>
            </div>
          ) : (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Venda</span>
              <span className={styles.priceValue}>{!sobConsulta && price > 0 ? `R$ ${price.toLocaleString("pt-BR")}` : "Sob consulta"}</span>
            </div>
          )}

          {(condo > 0 || iptu > 0) && (
            <div className={styles.taxesRow}>
              {condo > 0 && <span>Condomínio: {condo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
              {condo > 0 && iptu > 0 && <span className={styles.separator}>•</span>}
              {iptu > 0 && <span>IPTU: {iptu.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
            </div>
          )}
        </div>
      </div>
      <div>
        <button
          type="button"
          className={styles.shareButton} 
          onClick={() => setIsShareModalOpen(true)}
          aria-label="Abrir opções de compartilhamento"
        >
          <Share2 size={16} />
          <span>Compartilhar</span>
        </button>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={title}
        location={location}
        propertyId={propertyId}
      />
    </div>
  );
}
