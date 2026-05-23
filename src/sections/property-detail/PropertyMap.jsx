import React from "react";
import { MapPin } from "lucide-react";
import styles from "./PropertyMap.module.css";

export default function PropertyMap({ address }) {
  const query = encodeURIComponent(address || "");
  const src = `https://www.google.com/maps?q=${query}&output=embed`;
  const parts = (address || "").split(",").map((s) => s.trim());
  const bairro = parts[0] || "";
  const cidade = parts[1] || "";

  return (
    <div className={styles.mapSection}>
      <div className={styles.locationHeader}>
        <MapPin size={16} />
        <div className={styles.locationText}>
          <strong>{bairro}{cidade ? `, ${cidade}` : ""}</strong>
        </div>
      </div>

      <div className={styles.mapWrap}>
        <iframe
          title="Localização"
          src={src}
          loading="lazy"
          className={styles.map}
        />
      </div>
    </div>
  );
}
