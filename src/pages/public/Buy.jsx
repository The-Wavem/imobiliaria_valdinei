import Footer from "@components/layout/Footer.jsx";
import CategoryHero from "@sections/listing/CategoryHero.jsx";
import PropertyGrid from "@sections/listing/PropertyGrid.jsx";

const properties = [
  {
    id: "buy-1",
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
    id: "buy-2",
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
    id: "buy-3",
    title: "Terreno residencial em localização estratégica",
    location: "Portão, Curitiba",
    price: 620000,
    type: "Terreno",
    category: "Comprar",
    beds: 0,
    baths: 0,
    parking: 0,
    area: 360,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function Buy() {
  return (
    <div>
      <CategoryHero category="Comprar" />
      <PropertyGrid properties={properties} title="Imóveis para Comprar" />
      <Footer />
    </div>
  );
}