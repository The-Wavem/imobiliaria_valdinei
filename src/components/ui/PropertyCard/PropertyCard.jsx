import { MapPin, Heart, Bed, Bath, Maximize, Calendar } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./PropertyCard.module.css";

export default function PropertyCard({ property, onViewDetails }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={property.image}
          alt={property.title}
          className={styles.image}
          referrerPolicy="no-referrer"
        />

        <div className={styles.badges}>
          <span className={styles.badge}>{property.type}</span>
          <span className={`${styles.badge} ${styles.categoryBadge}`}>
            {property.category}
          </span>
        </div>

        <button type="button" className={styles.favoriteButton} aria-label="Favoritar imóvel">
          <Heart size={18} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.location}>
          <MapPin size={14} />
          <span>{property.location}</span>
        </div>

        <h3 className={styles.title}>{property.title}</h3>

        <p className={styles.price}>
          {property.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <Bed size={16} />
            <span>{property.beds}</span>
          </div>

          <div className={styles.statItem}>
            <Bath size={16} />
            <span>{property.baths}</span>
          </div>

          <div className={styles.statItem}>
            <Maximize size={16} />
            <span>{property.area}m²</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="outline" className={styles.detailsButton} onClick={onViewDetails}>
            Ver Detalhes
          </Button>

          <Button variant="primary" className={styles.visitButton}>
            <Calendar size={18} />
            Agendar Visita
          </Button>
        </div>
      </div>
    </article>
  );
}