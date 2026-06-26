import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard.jsx";
import SkeletonCard from "@components/ui/Skeleton/SkeletonCard.jsx";
import styles from "./PropertyGrid.module.css";

export default function PropertyGrid({ properties, title, onPropertyClick, isLoading = false, loading = false }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showLoading = isLoading || loading;
  const gridTopRef = useRef(null);
  
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 21;
  
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  
  useEffect(() => {
    if (properties.length > 0 && currentPage > totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", 1);
      setSearchParams(newParams);
    }
  }, [properties.length, currentPage, totalPages, searchParams, setSearchParams]);

  const handlePageChange = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNumber);
    setSearchParams(newParams);
    
    if (gridTopRef.current) {
      const yOffset = -100;
      const element = gridTopRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = properties.slice(indexOfFirstItem, indexOfLastItem);

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

        <div className={styles.grid} ref={gridTopRef}>
          {currentItems.map((property) => (
            <div key={property.id} className={styles.fadeCard}>
              <PropertyCard
                property={property}
                onViewDetails={() => onPropertyClick && onPropertyClick(property.id)}
              />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              className={styles.navButton}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  className={`${styles.pageButton} ${
                    currentPage === pageNumber ? styles.activePage : ""
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              className={styles.navButton}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}