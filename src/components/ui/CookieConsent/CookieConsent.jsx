import { useEffect, useState } from "react";
import Button from "@components/ui/Button/Button.jsx";
import { trackPageAccess } from "@utils/analytics";
import styles from "./CookieConsent.module.css";

const CONSENT_KEY = "@valdinei:consent_status";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    try {
      const storedConsent = window.localStorage.getItem(CONSENT_KEY);
      if (storedConsent) {
        setIsVisible(false);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
      trackPageAccess();
    } finally {
      setIsVisible(false);
    }
  };

  const handleReject = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "denied");
    } finally {
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-label="Consentimento de cookies">
      <div className={styles.panel}>
        <p className={styles.message}>
          Usamos cookies para melhorar sua experiência e analisar o tráfego do site. Ao continuar navegando,
          você concorda com nossa política.
        </p>

        <div className={styles.actions}>
          <Button variant="primary" type="button" onClick={handleAccept}>
            Aceitar
          </Button>
          <Button variant="outline" type="button" onClick={handleReject}>
            Recusar
          </Button>
        </div>
      </div>
    </aside>
  );
}
