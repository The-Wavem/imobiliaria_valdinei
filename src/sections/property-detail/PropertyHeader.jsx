import React, { useState } from "react";
import { MapPin, Share2, Check } from "lucide-react";
import styles from "./PropertyHeader.module.css";
import { incrementPropertyShares } from "../../services/propertyService.js";

export default function PropertyHeader({ title, location, propertyId }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Imóvel: ${title}`,
      text: `Confira este imóvel: ${title} em ${location}`,
      url: url,
    };

    try {
      let shared = false;
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        shared = true;
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        shared = true;
      }
      
      if (shared && propertyId) {
        await incrementPropertyShares(propertyId);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Erro ao compartilhar:", err);
      }
    }
  };

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.location}><MapPin size={14} /> <span>{location}</span></div>
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
