import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "@components/layout/Footer.jsx";
import FilterBar from "@components/ui/FilterBar/FilterBar.jsx";
import CategoryHero from "@sections/listing/CategoryHero.jsx";
import PropertyGrid from "@sections/listing/PropertyGrid.jsx";
import { getPublicProperties } from "@services/propertyService.js";
import { extractNeighborhood } from "@utils/address.js";

export default function Rent() {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  
  const initialFilters = useMemo(() => ({
    location: searchParams.get('location') || "",
    propertyType: searchParams.get('propertyType') || "",
  }), []);

  const [filters, setFilters] = useState(initialFilters);
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
        const items = await getPublicProperties("Alugar");
        if (isMounted) setProperties(items);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const pricing = property.pricing || {};
      const feat = property.features || [];
      const searchLocation = (filters.location || "").trim().toLowerCase();
      const propertyType = filters.propertyType || "";
      const priceMin =
        Number((filters.priceMin || "").toString().replace(/[^0-9]/g, "")) || 0;
      const priceMaxRaw = (filters.priceMax || "")
        .toString()
        .replace(/[^0-9]/g, "");
      const priceMax = priceMaxRaw
        ? Number(priceMaxRaw)
        : Number.POSITIVE_INFINITY;
      const bedrooms = filters.bedrooms || "Qualquer";
      const bathrooms = filters.bathrooms || "Qualquer";
      const parking = filters.parking || "Qualquer";
      const amenities = filters.amenities || [];
      const areaMin = Number(filters.areaMin || 0);
      const areaMax = Number(filters.areaMax || Number.POSITIVE_INFINITY);
      const loc = typeof property.location === "object" ? property.location : {};
      const propAddress = (loc.address || "").toLowerCase();
      const propNeighborhood = (loc.neighborhood || "").toLowerCase();
      const propBairro = (loc.bairro || "").toLowerCase();
      
      // Nova extração direta baseada na string (se for string)
      const propExtractedBairro = extractNeighborhood(property.location).toLowerCase();
      const rawLocationString = typeof property.location === "string" ? property.location.toLowerCase() : "";

      const searchLoc = searchLocation.toLowerCase();

      const matchesLocation =
        !searchLoc ||
        propExtractedBairro === searchLoc ||
        propBairro === searchLoc ||
        propNeighborhood === searchLoc ||
        propAddress.includes(searchLoc) ||
        rawLocationString.includes(searchLoc);
      const matchesType =
        !propertyType ||
        (property.type &&
          property.type.toLowerCase() === propertyType.toLowerCase());
      const rentPrice = Number(pricing.price) || 0;
      const matchesPrice = rentPrice >= priceMin && rentPrice <= priceMax;
      const propBeds = Number(loc.bedrooms) || 0;
      const matchesBedrooms =
        bedrooms === "Qualquer" ||
        propBeds >= Number(bedrooms.replace("+", ""));
      const propBaths = Number(loc.bathrooms) || 0;
      const matchesBathrooms =
        bathrooms === "Qualquer" ||
        propBaths >= Number(bathrooms.replace("+", ""));
      const propParking = Number(loc.parkingSpaces) || 0;
      const matchesParking =
        parking === "Qualquer" ||
        propParking >= Number(parking.replace("+", ""));
      const propArea = Number(loc.area) || 0;
      const matchesArea = propArea >= areaMin && propArea <= areaMax;
      const matchesAmenities =
        amenities.length === 0 ||
        amenities.every((amenity) => feat.includes(amenity));

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <motion.main 
      className="pageTransition"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUpItem}>
        <CategoryHero category="Alugar" />
      </motion.div>
      <motion.div variants={fadeUpItem} style={{ position: "relative", zIndex: 10 }}>
        <FilterBar 
          initialFilters={initialFilters}
          onSearch={setFilters} 
          onAdvancedFiltersApply={setFilters} 
          properties={properties} 
        />
      </motion.div>
      <motion.div variants={fadeUpItem}>
        <PropertyGrid
          properties={filteredProperties}
          title="Imóveis para Alugar"
          onPropertyClick={handlePropertyClick}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.main>
  );
}
