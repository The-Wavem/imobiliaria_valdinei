import React, { useState } from "react";
import { MapPin, Share2, Check } from "lucide-react";
import styles from "./PropertyHeader.module.css";
import { incrementPropertyShares } from "../../services/propertyService.js";

export default function PropertyHeader({ 
  title, 
  location, 
  propertyId,
  price,
  rentPrice,
  condo,
  iptu,
  category 
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Imóvel: ${title}`,
      text: `Confira este imóvel: ${title}${location ? ` em ${location}` : ''}`,
      url: url,
    };

    try {
      let shared = false;

      // 1. Tenta Web Share API nativa (dispositivos móveis e navegadores suportados)
      let canUseNativeShare = false;
      if (typeof navigator.share === "function") {
        if (typeof navigator.canShare === "function") {
          try {
            canUseNativeShare = navigator.canShare(shareData);
          } catch {
            canUseNativeShare = true;
          }
        } else {
          canUseNativeShare = true;
        }
      }

      if (canUseNativeShare) {
        await navigator.share(shareData);
        shared = true;
      } else {
        // 2. Fallback: Copiar para área de transferência (Desktop e WebViews)
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(url);
        } else {
          // Fallback universal (navegadores antigos ou HTTP/Webviews)
          const textArea = document.createElement("textarea");
          textArea.value = url;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        shared = true;
      }

      if (shared && propertyId) {
        await incrementPropertyShares(propertyId);
      }
    } catch (err) {
      if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
        console.error("Erro ao compartilhar:", err);
      }
    }
  };

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.location}><MapPin size={14} /> <span>{location}</span></div>
        
        {/* Mobile Price Card */}
        <div className={styles.mobilePriceCard}>
          {(category === "Venda e Aluguel" || category === "Ambos") ? (
            <>
              {price > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Venda</span>
                  <span className={styles.priceValue}>R$ {price.toLocaleString("pt-BR")}</span>
                </div>
              )}
              {rentPrice > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Aluguel</span>
                  <span className={styles.priceValue}>R$ {rentPrice.toLocaleString("pt-BR")}/mês</span>
                </div>
              )}
            </>
          ) : category === "Alugar" ? (
            <>
              {(rentPrice > 0 || price > 0) && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Aluguel</span>
                  <span className={styles.priceValue}>R$ {(rentPrice || price).toLocaleString("pt-BR")}/mês</span>
                </div>
              )}
            </>
          ) : (
            <>
              {price > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Venda</span>
                  <span className={styles.priceValue}>R$ {price.toLocaleString("pt-BR")}</span>
                </div>
              )}
            </>
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
        <button className={styles.shareButton} onClick={handleShare}>
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          <span>{copied ? "Link Copiado" : "Compartilhar"}</span>
        </button>
      </div>
    </div>
  );
}
