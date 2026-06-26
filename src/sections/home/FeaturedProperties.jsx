import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard.jsx";
import { getAllProperties } from "@services/propertyService.js";
import styles from "./FeaturedProperties.module.css";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  },
};

export default function FeaturedProperties({ onPropertyClick }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        const allProperties = await getAllProperties();
        const homeFeatures = allProperties.filter(p => p.featured && p.status !== 'Inativo');

        if (isMounted) {
          setProperties(homeFeatures.slice(0, 3));
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

        <motion.div 
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {properties.map((property, index) => (
            <motion.div key={property.firestoreId || property.id || index} variants={cardItem}>
              <PropertyCard
                property={property}
                onViewDetails={() => onPropertyClick && onPropertyClick(property.firestoreId || property.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}