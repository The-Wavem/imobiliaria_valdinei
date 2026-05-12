import { Search } from "lucide-react";
import PropertyCard from "@components/ui/PropertyCard/PropertyCard.jsx";
import styles from "./FeaturedProperties.module.css";

const properties = [
  {
    id: "1",
    title: "Apartamento Garden no Batel",
    location: "Batel, Curitiba",
    price: 1450000,
    type: "Apartamento",
    category: "Comprar",
    beds: 3,
    baths: 2,
    parking: 2,
    area: 142,
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "2",
    title: "Casa moderna em condomínio fechado",
    location: "Santa Felicidade, Curitiba",
    price: 890000,
    type: "Casa",
    category: "Comprar",
    beds: 4,
    baths: 3,
    parking: 3,
    area: 210,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "3",
    title: "Studio mobiliado próximo ao centro",
    location: "Centro, Curitiba",
    price: 3200,
    type: "Studio",
    category: "Alugar",
    beds: 1,
    baths: 1,
    parking: 1,
    area: 42,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function FeaturedProperties() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2>Imóveis em Destaque</h2>
            <p>As melhores oportunidades selecionadas para você hoje.</p>
          </div>

          <button type="button" className={styles.viewAllButton}>
            Ver todos os imóveis
            <Search size={16} />
          </button>
        </div>

        <div className={styles.grid}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}