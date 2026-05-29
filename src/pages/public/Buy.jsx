import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@components/layout/Footer.jsx";
import FilterBar from "@components/ui/FilterBar/FilterBar.jsx";
import CategoryHero from "@sections/listing/CategoryHero.jsx";
import PropertyGrid from "@sections/listing/PropertyGrid.jsx";
import { fetchPublishedProperties } from "@services/properties";

export default function Buy() {
  const [filters, setFilters] = useState({});
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId) => {
    navigate(`/imovel/${propertyId}`);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        const items = await fetchPublishedProperties();

        if (isMounted) {
          setProperties(items.filter((property) => property.category.toLowerCase() === "comprar"));
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
      <PropertyGrid
        properties={filteredProperties}
        title="Imóveis para Comprar"
        onPropertyClick={handlePropertyClick}
        isLoading={isLoading}
      />
      <Footer />
    </div>
  );
}