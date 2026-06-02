import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@components/layout/Footer.jsx";
import FilterBar from "@components/ui/FilterBar/FilterBar.jsx";
import CategoryHero from "@sections/listing/CategoryHero.jsx";
import PropertyGrid from "@sections/listing/PropertyGrid.jsx";
import { getPublicProperties } from "@/services/propertyService";

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
        const items = await getPublicProperties("Comprar");

        if (isMounted) {
          setProperties(items);
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
      const priceMin = Number((filters.priceMin || "").toString().replace(/[^0-9]/g, "")) || 0;
      const priceMaxRaw = (filters.priceMax || "").toString().replace(/[^0-9]/g, "");
      const priceMax = priceMaxRaw ? Number(priceMaxRaw) : Number.POSITIVE_INFINITY;
      const bedrooms = filters.bedrooms || "Qualquer";
      const bathrooms = filters.bathrooms || "Qualquer";
      const parking = filters.parking || "Qualquer";
      const amenities = filters.amenities || [];
      const areaMin = Number(filters.areaMin || 0);
      const areaMax = Number(filters.areaMax || Number.POSITIVE_INFINITY);
      const propAddress = (property.address || "").toLowerCase();
      const propNeighborhood = (property.neighborhood || "").toLowerCase();
      const matchesLocation = !location || propAddress.includes(location) || propNeighborhood.includes(location);
      const matchesType = !propertyType || property.type === propertyType;
      const propPrice = Number(property.price) || 0;
      const matchesPrice = propPrice >= priceMin && propPrice <= priceMax;
      const propBeds = Number(property.bedrooms) || 0;
      const matchesBedrooms = bedrooms === "Qualquer" || propBeds >= Number(bedrooms.replace("+", ""));
      const propBaths = Number(property.bathrooms) || 0;
      const matchesBathrooms = bathrooms === "Qualquer" || propBaths >= Number(bathrooms.replace("+", ""));
      const propParking = Number(property.parkingSpaces) || 0;
      const matchesParking = parking === "Qualquer" || propParking >= Number(parking.replace("+", ""));
      const propArea = Number(property.area) || 0;
      const matchesArea = propArea >= areaMin && propArea <= areaMax;
      const matchesAmenities = amenities.length === 0 || amenities.every((amenity) =>
        (property.features || []).includes(amenity)
      );

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
  }, [properties, filters]);

  return (
    <div>
      <CategoryHero category="Comprar" />
      <FilterBar onSearch={setFilters} onAdvancedFiltersApply={setFilters} />
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
