import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard.jsx";
import { fetchPublishedProperties } from "@services/properties";
import styles from "./FeaturedProperties.module.css";

export default function FeaturedProperties({ onPropertyClick }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        const items = await fetchPublishedProperties();

        if (isMounted) {
          setProperties(items.slice(0, 3));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h2>Imóveis em Destaque</h2>
              <p>Carregando imóveis publicados...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2>Imóveis em Destaque</h2>
            <p>As melhores oportunidades selecionadas para você hoje.</p>
          </div>

          <button type="button" className={styles.viewAllButton} onClick={() => navigate("/comprar")}>
            Ver todos os imóveis
            <Search size={16} />
          </button>
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