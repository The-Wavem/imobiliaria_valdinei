import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  Bath,
  CarFront,
  Ruler,
  Bed,
  Maximize,
  Calendar,
  Star,
  Sparkles,
  Flame,
} from "lucide-react";
import styles from "./PropertyCard.module.css";
import buttonStyles from "../Button/Button.module.css";
import Button from "../Button/Button";
import { useFavorites } from "@hooks/useFavorites";
import { Heart } from "lucide-react";

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

  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(property.firestoreId || property.id);

  const isNew = useMemo(() => {
    const createdAtStr = property.createdAt || (property.audit && property.audit.createdAt);
    if (!createdAtStr) return false;
    const createdAtTime = new Date(createdAtStr).getTime();
    if (isNaN(createdAtTime)) return false;
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    return (now - createdAtTime) <= threeDaysInMs;
  }, [property.createdAt, property.audit]);

  const isPopular = (property.views || 0) >= 50;
  const isLoved = (property.favoriteCount || 0) >= 5;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link
          to={`/imovel/${property.firestoreId || property.id}`}
          className={styles.cardLink}
          onClick={(e) => {
            if (onViewDetails) {
              e.preventDefault();
              onViewDetails(property.firestoreId || property.id);
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
              <img
                src="https://static.vecteezy.com/system/resources/previews/016/916/479/large_2x/placeholder-icon-design-free-vector.jpg"
                alt="Sem foto disponível"
              />
            </div>
          )}
        </Link>

        {property.status && property.status !== "Disponível" && property.status !== "Inativo" && property.status !== "Ativo" && (
          <span className={`${styles.statusBadge} ${styles[property.status.toLowerCase()] || ""}`.trim()}>
            {property.status}
          </span>
        )}

        <div className={styles.badgeStack}>
          {property.featured && (
            <span className={`${styles.badge} ${styles.badgeFeatured}`}>
              <Star size={12} /> Destaque
            </span>
          )}
          {isNew && (
            <span className={`${styles.badge} ${styles.badgeNew}`}>
              <Sparkles size={12} /> Novo
            </span>
          )}
          {isPopular && (
            <span className={`${styles.badge} ${styles.badgePopular}`}>
              <Flame size={12} /> Em Alta
            </span>
          )}
          {isLoved && (
            <span className={`${styles.badge} ${styles.badgeLoved}`}>
              <Heart size={12} fill="currentColor" /> Queridinho
            </span>
          )}
        </div>

        <div className={styles.badges}>
          <span className={styles.badge}>{property.type}</span>
          <span className={`${styles.badge} ${styles.categoryBadge}`}>
            {property.category}
          </span>
        </div>

        <button 
          className={styles.favoriteBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property);
          }}
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart 
            size={22} 
            fill={isFav ? "var(--color-primary)" : "none"} 
            color={isFav ? "var(--color-primary)" : "#ffffff"} 
          />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.location}>
          <MapPin size={14} />
          <span>
            {typeof property.location === "string"
              ? property.location
              : property.location
                ? [property.location.bairro, property.location.cidade, property.location.estado].filter(Boolean).join(", ") || property.location.address || "Local não informado"
                : property.bairro
                  ? [property.bairro, property.cidade, property.estado].filter(Boolean).join(", ")
                  : "Local não informado"}
          </span>
        </div>

        <h3 className={styles.title}>
          <Link
            to={`/imovel/${property.firestoreId || property.id}`}
            className={styles.titleLink}
            onClick={(e) => {
              if (onViewDetails) {
                e.preventDefault();
                onViewDetails(property.firestoreId || property.id);
              }
            }}
          >
            {property.title}
          </Link>
        </h3>

        <p className={styles.price}>
          {Number(property.price || property.pricing?.price || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <div className={styles.stats}>
          {beds > 0 && (
            <div className={styles.statItem}>
              <Bed size={16} />
              <span>
                {beds} quarto{beds !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {baths > 0 && (
            <div className={styles.statItem}>
              <Bath size={16} />
              <span>
                {baths} banheiro{baths !== 1 ? "s" : ""}
              </span>
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
            to={`/imovel/${property.firestoreId || property.id}`}
            className={`${buttonStyles.btn} ${buttonStyles.outline} ${styles.detailsButton}`}
            onClick={(e) => {
              if (onViewDetails) {
                e.preventDefault();
                onViewDetails(property.firestoreId || property.id);
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
