import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard.jsx";
import styles from "./PropertyGrid.module.css";

export default function PropertyGrid({ properties, title, onPropertyClick }) {
  const navigate = useNavigate();

  if (arguments[0]?.loading) {
    return (
      <section className={styles.emptySection}>
        <div className={styles.emptyCard}>
          <h3>Carregando imóveis</h3>
          <p>Aguarde um momento enquanto buscamos os dados no Firestore.</p>
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