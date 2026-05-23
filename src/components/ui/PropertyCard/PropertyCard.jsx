import { MapPin, Heart, Bed, Bath, Maximize, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@components/ui/Button/Button.jsx";
import buttonStyles from "@components/ui/Button/Button.module.css";
import ButtonFavorito from "@components/ui/Button_Favorito/Button_Favorito.jsx";
import styles from "./PropertyCard.module.css";

export default function PropertyCard({ property, onViewDetails }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link
          to={`/imovel/${property.id}`}
          className={styles.cardLink}
          onClick={(e) => {
            if (onViewDetails) {
              e.preventDefault();
              onViewDetails(property.id);
            }
          }}
        >
          <img
            src={property.image}
            alt={property.title}
            className={styles.image}
            referrerPolicy="no-referrer"
          />
        </Link>

        <div className={styles.badges}>
          <span className={styles.badge}>{property.type}</span>
          <span className={`${styles.badge} ${styles.categoryBadge}`}>
            {property.category}
          </span>
        </div>

        <ButtonFavorito property={property} />
      </div>

      <div className={styles.content}>
        <div className={styles.location}>
          <MapPin size={14} />
          <span>{property.location}</span>
        </div>

        <h3 className={styles.title}>
          <Link
            to={`/imovel/${property.id}`}
            className={styles.titleLink}
            onClick={(e) => {
              if (onViewDetails) {
                e.preventDefault();
                onViewDetails(property.id);
              }
            }}
          >
            {property.title}
          </Link>
        </h3>

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
          <Link
            to={`/imovel/${property.id}`}
            className={`${buttonStyles.btn} ${buttonStyles.outline} ${styles.detailsButton}`}
            onClick={(e) => {
              if (onViewDetails) {
                e.preventDefault();
                onViewDetails(property.id);
              }
            }}
          >
            Ver Detalhes
          </Link>

          <Button variant="primary" className={styles.visitButton}>
            <Calendar size={18} />
            Agendar Visita
          </Button>
        </div>
      </div>
    </article>
  );
}