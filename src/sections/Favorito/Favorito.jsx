import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import styles from "./Favorito.module.css";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard";
import { useFavorites } from "@hooks/useFavorites";

export default function FavoritoSection() {
  const { favorites } = useFavorites();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon} aria-hidden="true">
              <Heart size={28} fill="currentColor" />
            </span>
            <div>
              <h1 className={styles.title}>Meus Imóveis Favoritos</h1>
              <p className={styles.subtitle}>
                Os imóveis que você mais gostou salvos em um só lugar.
              </p>
            </div>
          </div>
        </header>

        {favorites.length > 0 ? (
          <div className={styles.grid}>
            {favorites.map((favorite) => (
              <PropertyCard key={favorite.id} property={favorite} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Search size={48} color="var(--color-primary)" />
            </div>
            <h2>Nenhum imóvel favorito ainda</h2>
            <p>
              Explore nossa seleção de imóveis e salve os que mais combinam com você.
            </p>
            <Link to="/comprar" className={styles.exploreButton}>
              Explorar Imóveis
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}