import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@components/layout/Footer.jsx";
import FilterBar from "@components/ui/FilterBar/FilterBar.jsx";
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
    amenities: ["Mobiliado", "Elevador"],
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
    amenities: ["Piscina", "Churrasqueira"],
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
    amenities: [],
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function Buy() {
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId) => {
    navigate(`/imovel/${propertyId}`);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const location = (filters.location || "").trim().toLowerCase();
      const propertyType = filters.propertyType || "";
      const priceMin = Number((filters.priceMin || "").toString().replace(/[^0-9]/g, "") || 0);
      const priceMaxRaw = (filters.priceMax || "").toString().replace(/[^0-9]/g, "");
      const priceMax = priceMaxRaw ? Number(priceMaxRaw) : Number.POSITIVE_INFINITY;
      const bedrooms = filters.bedrooms || "Qualquer";
      const bathrooms = filters.bathrooms || "Qualquer";
      const parking = filters.parking || "Qualquer";
      const amenities = filters.amenities || [];
      const areaMin = Number(filters.areaMin || 0);
      const areaMax = Number(filters.areaMax || Number.POSITIVE_INFINITY);

      const matchesLocation = !location || property.location.toLowerCase().includes(location);
      const matchesType = !propertyType || property.type.toLowerCase() === propertyType;

      const buyPrice = property.price;
      const matchesPrice = buyPrice >= priceMin && buyPrice <= priceMax;

      const matchesBedrooms =
        bedrooms === "Qualquer" || property.beds >= Number(bedrooms.replace("+", ""));
      const matchesBathrooms =
        bathrooms === "Qualquer" || property.baths >= Number(bathrooms.replace("+", ""));
      const matchesParking =
        parking === "Qualquer" || property.parking >= Number(parking.replace("+", ""));
      const matchesArea = property.area >= areaMin && property.area <= areaMax;
      const matchesAmenities = amenities.length === 0 || amenities.every((amenity) => (property.amenities || []).includes(amenity));

      return (
        matchesLocation &&
        matchesType &&
        matchesPrice &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesParking &&
        matchesArea &&
        matchesAmenities
      );
    });
  }, [filters]);

  return (
    <div>
      <CategoryHero category="Comprar" />
      <FilterBar
        onSearch={setFilters}
        onAdvancedFiltersApply={setFilters}
      />
      <PropertyGrid properties={filteredProperties} title="Imóveis para Comprar" onPropertyClick={handlePropertyClick} />
      <Footer />
    </div>
  );
}