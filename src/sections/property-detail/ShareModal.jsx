import React, { useState } from "react";
import { Copy, Check, MapPin, Share2 } from "lucide-react";
import Modal from "@components/ui/Modal/Modal.jsx";
import styles from "./ShareModal.module.css";
import { incrementPropertyShares } from "../../services/propertyService.js";

// Ícone SVG personalizado de alta resolução para o WhatsApp
function WhatsAppIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.44 7.66 20.3 9.72 20.3 11.92C20.29 16.46 16.6 20.15 12.05 20.15ZM16.57 14.39C16.32 14.27 15.11 13.67 14.88 13.59C14.66 13.5 14.5 13.46 14.33 13.71C14.17 13.96 13.71 14.5 13.57 14.66C13.43 14.83 13.29 14.85 13.04 14.72C12.79 14.6 11.99 14.33 11.04 13.49C10.3 12.83 9.8 12.02 9.66 11.77C9.52 11.52 9.64 11.39 9.77 11.26C9.88 11.15 10.02 10.97 10.15 10.82C10.27 10.67 10.31 10.57 10.39 10.4C10.48 10.24 10.44 10.09 10.37 9.97C10.31 9.85 9.82 8.64 9.61 8.14C9.41 7.65 9.21 7.72 9.06 7.71C8.92 7.7 8.75 7.7 8.59 7.7C8.42 7.7 8.15 7.76 7.92 8.01C7.69 8.26 7.05 8.86 7.05 10.07C7.05 11.28 7.93 12.45 8.06 12.61C8.18 12.78 9.8 15.28 12.28 16.35C12.87 16.61 13.33 16.76 13.69 16.87C14.28 17.06 14.82 17.03 15.25 16.97C15.73 16.9 16.72 16.37 16.93 15.79C17.14 15.21 17.14 14.71 17.07 14.6C17.01 14.5 16.82 14.43 16.57 14.39Z" />
    </svg>
  );
}

export default function ShareModal({ isOpen, onClose, title, location, propertyId }) {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareMessage = `Olá! Confira este imóvel: *${title || "Imóvel em destaque"}*${location ? ` em ${location}` : ""}\n\n${currentUrl}`;

  const handleShareWhatsApp = async () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    if (propertyId) {
      try {
        await incrementPropertyShares(propertyId);
      } catch (e) {
        console.error("Erro ao contabilizar compartilhamento:", e);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      if (propertyId) {
        await incrementPropertyShares(propertyId);
      }
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title || "Imobiliária Valdinei",
          text: `Confira este imóvel: ${title}${location ? ` em ${location}` : ""}`,
          url: currentUrl,
        });

        if (propertyId) {
          await incrementPropertyShares(propertyId);
        }
      } catch (err) {
        if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
          console.error("Erro no compartilhamento nativo:", err);
        }
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartilhar Imóvel"
      className={styles.shareModal}
    >
      <div className={styles.container}>
        {/* Preview do imóvel */}
        <div className={styles.propertyPreview}>
          <h3 className={styles.propertyTitle}>{title}</h3>
          {location && (
            <div className={styles.propertyLocation}>
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Opções de compartilhamento */}
        <div className={styles.optionsList}>
          {/* Opção WhatsApp */}
          <button
            type="button"
            className={styles.whatsappButton}
            onClick={handleShareWhatsApp}
          >
            <WhatsAppIcon size={22} />
            <span>Compartilhar via WhatsApp</span>
          </button>

          {/* Opção Copiar Link */}
          <div className={styles.copySection}>
            <span className={styles.sectionLabel}>Ou copie o link direto:</span>
            <div className={styles.copyBox}>
              <input
                type="text"
                readOnly
                value={currentUrl}
                className={styles.urlInput}
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ""}`}
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copiado!" : "Copiar Link"}</span>
              </button>
            </div>
            {copied && (
              <span className={styles.successFeedback}>
                <Check size={14} /> Link copiado para a área de transferência!
              </span>
            )}
          </div>

          {/* Opção Nativa do Dispositivo (opcional) */}
          {hasNativeShare && (
            <button
              type="button"
              className={styles.nativeShareButton}
              onClick={handleNativeShare}
            >
              <Share2 size={16} />
              <span>Outras opções de compartilhamento</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
