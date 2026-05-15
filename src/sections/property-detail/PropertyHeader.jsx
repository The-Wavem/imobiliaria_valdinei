import React from "react";
import { MapPin } from "lucide-react";
import styles from "./PropertyHeader.module.css";

export default function PropertyHeader({ title, location, price }) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.location}><MapPin size={14} /> <span>{location}</span></div>
      </div>

      <div className={styles.priceWrap}>
        <div className={styles.price}>
          {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
      </div>
    </div>
  );
}
