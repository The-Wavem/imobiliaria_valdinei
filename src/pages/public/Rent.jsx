import { useMemo, useState } from "react";
import Footer from "@components/layout/Footer.jsx";
import FilterBar from "@components/ui/FilterBar/FilterBar.jsx";
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
    amenities: ["Mobiliado", "Elevador"],
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
    amenities: ["Churrasqueira", "Elevador"],
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
    amenities: ["Piscina", "Pet Friendly"],
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function Rent() {
  const [filters, setFilters] = useState({});

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const location = (filters.location || "").trim().toLowerCase();
      const propertyType = filters.propertyType || "";
      const priceRange = filters.priceRange || "";
      const bedrooms = filters.bedrooms || "Qualquer";
      const bathrooms = filters.bathrooms || "Qualquer";
      const parking = filters.parking || "Qualquer";
      const amenities = filters.amenities || [];
      const areaMin = Number(filters.areaMin || 0);
      const areaMax = Number(filters.areaMax || Number.POSITIVE_INFINITY);

      const matchesLocation = !location || property.location.toLowerCase().includes(location);
      const matchesType = !propertyType || property.type.toLowerCase() === propertyType;

      const rentPrice = property.price;
      const matchesPrice =
        !priceRange ||
        (priceRange === "ate-500" && rentPrice <= 500000) ||
        (priceRange === "ate-800" && rentPrice <= 800000) ||
        (priceRange === "ate-1200" && rentPrice <= 1200000) ||
        (priceRange === "acima-1200" && rentPrice > 1200000);

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
      <CategoryHero category="Alugar" />
      <FilterBar
        onSearch={setFilters}
        onAdvancedFiltersApply={setFilters}
      />
      <PropertyGrid properties={filteredProperties} title="Imóveis para Alugar" />
      <Footer />
    </div>
  );
}