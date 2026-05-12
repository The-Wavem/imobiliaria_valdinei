import Footer from "@components/layout/Footer.jsx";
import CategoryHero from "@sections/listing/CategoryHero.jsx";
import PropertyGrid from "@sections/listing/PropertyGrid.jsx";

const properties = [
  {
    id: "rent-1",
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
  {
    id: "rent-2",
    title: "Apartamento reformado no Batel",
    location: "Batel, Curitiba",
    price: 5400,
    type: "Apartamento",
    category: "Alugar",
    beds: 2,
    baths: 2,
    parking: 1,
    area: 88,
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "rent-3",
    title: "Casa ampla em condomínio familiar",
    location: "Santa Felicidade, Curitiba",
    price: 7800,
    type: "Casa",
    category: "Alugar",
    beds: 3,
    baths: 3,
    parking: 2,
    area: 180,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function Rent() {
  return (
    <div>
      <CategoryHero category="Alugar" />
      <PropertyGrid properties={properties} title="Imóveis para Alugar" />
      <Footer />
    </div>
  );
}