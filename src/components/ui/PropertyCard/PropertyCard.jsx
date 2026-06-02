import React from "react";
import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, CarFront, Ruler } from "lucide-react";
import styles from "./PropertyCard.module.css";
import Button from "../Button/Button";

export default function PropertyCard({ property, onViewDetails }) {
  if (!property) return null;

  // 1. BLINDAGEM DE DADOS: Lidando com a estrutura aninhada do Firebase
  const loc = property.location || {};
  const pricing = property.pricing || {};

  // Pegando textos com fallback seguro
  const title =
    property.title || property.content?.summary || "Imóvel Exclusivo";

  // ✅ O CONSERTO DO ERRO: Lendo as strings dentro do objeto location
  const neighborhood = loc.neighborhood || property.neighborhood || "";
  const address = loc.address || property.address || "";
  const addressString = neighborhood
    ? `${neighborhood}, ${address}`
    : address || "Localização não informada";

  // Convertendo números (evita o erro do toLocaleString)
  const price = Number(property.price || pricing.price || 0);
  const area = Number(property.area || loc.area || 0);
  const beds = Number(property.bedrooms || loc.bedrooms || 0);
  const baths = Number(property.bathrooms || loc.bathrooms || 0);
  const parking = Number(property.parkingSpaces || loc.parkingSpaces || 0);

  // Pega a primeira foto ou um placeholder elegante
  const coverImage =
    (property.photos && property.photos[0]) ||
    property.imageUrl ||
    "https://via.placeholder.com/600x400?text=Valdinei+Im%C3%B3veis";

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={coverImage} alt={title} className={styles.image} />
        <span className={styles.badge}>
          {property.category || property.type || "Imóvel"}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>

          <p className={styles.location}>
            <MapPin size={16} />
            {/* O texto do endereço agora é uma string segura */}
            <span>{addressString}</span>
          </p>
        </div>

        <div className={styles.price}>
          {price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>

        <div className={styles.features}>
          <div className={styles.feature} title="Área Útil">
            <Ruler size={18} />
            <span>{area} m²</span>
          </div>
          <div className={styles.feature} title="Quartos">
            <BedDouble size={18} />
            <span>{beds}</span>
          </div>
          <div className={styles.feature} title="Banheiros">
            <Bath size={18} />
            <span>{baths}</span>
          </div>
          <div className={styles.feature} title="Vagas">
            <CarFront size={18} />
            <span>{parking}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            variant="primary"
            fullWidth
            onClick={
              onViewDetails ||
              (() => (window.location.href = `/imovel/${property.id}`))
            }
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}
