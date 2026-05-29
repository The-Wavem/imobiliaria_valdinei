import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard.jsx";
import SkeletonCard from "@components/ui/Skeleton/SkeletonCard.jsx";
import styles from "./PropertyGrid.module.css";

export default function PropertyGrid({ properties, title, onPropertyClick, isLoading = false, loading = false }) {
  const navigate = useNavigate();
  const showLoading = isLoading || loading;

  if (showLoading) {
    return (
      <section className={styles.section} aria-label="Carregando imóveis">
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h2>{title}</h2>
              <p>Buscando as melhores oportunidades para você.</p>
            </div>

            <div className={styles.loadingIndicator}>
              <Loader size={36} />
            </div>
          </div>

          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!properties.length) {
    return (
      <section className={styles.emptySection}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconWrap}>
            <Search size={40} className={styles.emptyIcon} />
          </div>

          <h3>Nenhum imóvel encontrado</h3>
          <p>
            Não encontramos imóveis para esta categoria no momento. Tente novamente mais tarde ou entre em contato.
          </p>

          <Button variant="primary" onClick={() => navigate("/")}>Voltar ao Início</Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2>{title}</h2>
            <p>As melhores oportunidades selecionadas para você hoje.</p>
          </div>
        </div>

        <div className={styles.grid}>
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={() => onPropertyClick && onPropertyClick(property.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}