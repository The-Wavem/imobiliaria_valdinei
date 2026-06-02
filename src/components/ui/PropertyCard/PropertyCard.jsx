import React from "react";
import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, CarFront, Ruler, Bed, Maximize, Calendar } from "lucide-react";
import styles from "./PropertyCard.module.css";
import buttonStyles from "../Button/Button.module.css";
import Button from "../Button/Button";
import ButtonFavorito from "../Button_Favorito/Button_Favorito";

export default function PropertyCard({ property, onViewDetails }) {
  const coverImage =
    property.image ||
    property.imageUrl ||
    property.thumbnail ||
    property.photos?.find(Boolean) ||
    undefined;

  // beds/baths/area podem vir como beds ou bedrooms dependendo da origem
  const beds = property.beds ?? property.bedrooms ?? 0;
  const baths = property.baths ?? property.bathrooms ?? 0;
  const area = property.area ?? 0;

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
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.title}
              className={styles.image}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>Sem foto</span>
            </div>
          )}
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
          {beds > 0 && (
            <div className={styles.statItem}>
              <Bed size={16} />
              <span>{beds} quarto{beds !== 1 ? "s" : ""}</span>
            </div>
          )}
          {baths > 0 && (
            <div className={styles.statItem}>
              <Bath size={16} />
              <span>{baths} banheiro{baths !== 1 ? "s" : ""}</span>
            </div>
          )}
          {area > 0 && (
            <div className={styles.statItem}>
              <Maximize size={16} />
              <span>{area}m²</span>
            </div>
          )}
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
        </div>
      </div>
    </article>
  );
}