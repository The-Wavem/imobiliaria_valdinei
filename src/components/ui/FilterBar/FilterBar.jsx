import { useState, useEffect, useMemo } from "react";
import { MapPin, Home, DollarSign, Search, SlidersHorizontal, X, Eraser, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactSlider from "react-slider";
import Button from "@components/ui/Button/Button.jsx";
import Select from "@components/ui/Select/Select.jsx";
import AdvancedFilters from "@components/ui/FilterBar/AdvancedFilters.jsx";
import { trackFilterUsage } from "@utils/analytics";
import { logSearchAnalytics } from "@services/analyticsService.js";
import { extractNeighborhood } from "@utils/address.js";
import styles from "./FilterBar.module.css";

const typeOptions = [
  { value: "", label: "Tipo de Imóvel" },
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "sobrado", label: "Sobrado" },
  { value: "terreno", label: "Terreno" },
];

export default function FilterBar({ mode = "buy", filters = {}, onChange, onSearch, properties = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [advancedFilters, setAdvancedFilters] = useState({
    bedrooms: "Qualquer",
    bathrooms: "Qualquer",
    parking: "Qualquer",
    amenities: [],
    areaMin: "",
    areaMax: "",
  });

  // Gera lista de bairros unicos dinamicamente a partir dos imoveis carregados
  const locationOptions = useMemo(() => {
    const propertiesArray = properties || [];
    const rawBairros = propertiesArray.map((p) => extractNeighborhood(p.location));

    // .filter(Boolean) elimina undefined, null e "" antes de entrar no Set
    const unique = [...new Set(rawBairros.filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));

    return [
      { value: "", label: "Todos os Bairros" },
      ...unique.map((bairro) => ({ value: bairro, label: bairro })),
    ];
  }, [properties]);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFieldChange = (field) => (event) => {
    const value = typeof event === "string" ? event : event?.target?.value;
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isRent = mode === "rent";
  const MAX_PRICE = isRent ? 100000 : 5000000;
  const STEP = isRent ? 500 : 50000;
  const MIN_DISTANCE = isRent ? 1000 : 100000;

  const sliderValue = [
    localFilters.priceMin === "" || localFilters.priceMin === undefined ? 0 : Number(localFilters.priceMin),
    localFilters.priceMax === "" || localFilters.priceMax === undefined ? MAX_PRICE : Number(localFilters.priceMax)
  ];

  const handleSliderChange = (newValues) => {
    const [min, max] = newValues;
    setLocalFilters((prev) => ({
      ...prev,
      priceMin: min === 0 ? "" : min,
      priceMax: max === MAX_PRICE ? "" : max,
    }));
  };

  const formatPrice = (value) => {
    if (value === MAX_PRICE) return isRent ? `R$ ${MAX_PRICE / 1000} mil+` : "R$ 5 Mi+";
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace(".0", "")} Mi`;
    if (value >= 1000) return `R$ ${value / 1000} mil`;
    return `R$ ${value}`;
  };

  const trackAndLogSearch = (currentFilters) => {
    // Format price filters nicely for the Firestore 'analytics_filters' database
    const analyticsPayload = { ...currentFilters };
    if (analyticsPayload.priceMin !== "" && analyticsPayload.priceMin !== undefined) {
      analyticsPayload.priceMin = formatPrice(analyticsPayload.priceMin);
    }
    if (analyticsPayload.priceMax !== "" && analyticsPayload.priceMax !== undefined) {
      analyticsPayload.priceMax = formatPrice(analyticsPayload.priceMax);
    }
    
    trackFilterUsage(analyticsPayload);
    logSearchAnalytics(currentFilters);
  };

  useEffect(() => {
    if (filters.location || filters.propertyType || filters.priceMin || filters.priceMax) {
      const currentFilters = { 
        ...filters,
        ...advancedFilters 
      };
      trackAndLogSearch(currentFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const currentFilters = { ...localFilters, ...advancedFilters };
      trackAndLogSearch(currentFilters);
      await onChange?.(currentFilters);
      await onSearch?.(currentFilters);
    } finally {
      setTimeout(() => setIsSearching(false), 600);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      location: "",
      propertyType: "",
      priceMin: "",
      priceMax: "",
    };
    const emptyAdvanced = {
      bedrooms: "Qualquer",
      bathrooms: "Qualquer",
      parking: "Qualquer",
      amenities: [],
      areaMin: "",
      areaMax: "",
    };
    setLocalFilters(emptyFilters);
    setAdvancedFilters(emptyAdvanced);
    
    const combinedEmpty = { ...emptyFilters, ...emptyAdvanced };
    onChange?.(combinedEmpty);
    onSearch?.(combinedEmpty);
  };

  const hasActiveFilters =
    Boolean(localFilters.location) ||
    Boolean(localFilters.propertyType) ||
    Boolean(localFilters.priceMin) ||
    Boolean(localFilters.priceMax) ||
    Object.entries(advancedFilters).some(([key, val]) => {
      if (key === "amenities") return val.length > 0;
      if (key === "areaMin" || key === "areaMax") return Boolean(val);
      return val !== "Qualquer";
    });

  const handleApplyAdvancedFilters = (nextAdvancedFilters) => {
    setAdvancedFilters(nextAdvancedFilters);
    const currentFilters = { ...localFilters, ...nextAdvancedFilters };
    trackAndLogSearch(currentFilters);
    onChange?.(currentFilters);
    onSearch?.(currentFilters);
  };

  return (
    <section className={`${styles.bar} ${isStuck ? styles.isStuck : ""}`}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <Select
            icon={MapPin}
            label="Localização"
            options={locationOptions}
            value={localFilters.location}
            onChange={handleFieldChange("location")}
            className={`${styles.fieldItem} ${localFilters.location ? styles.activeFilter : ""}`}
          />

          <Select
            icon={Home}
            label="Tipo de Imóvel"
            options={typeOptions}
            value={localFilters.propertyType}
            onChange={handleFieldChange("propertyType")}
            className={`${styles.fieldItem} ${localFilters.propertyType ? styles.activeFilter : ""}`}
          />

          <div className={styles.priceGroup}>
            <div className={styles.priceHeader}>
              <DollarSign size={16} />
              <span>Faixa de Preço</span>
            </div>

            <div className={styles.sliderContainer}>
              <ReactSlider
                className={styles.slider}
                min={0}
                max={MAX_PRICE}
                step={STEP}
                value={sliderValue}
                onChange={handleSliderChange}
                pearling
                minDistance={MIN_DISTANCE}
                renderTrack={(props, state) => {
                  const { key, ...restProps } = props;
                  return (
                    <div
                      key={key}
                      {...restProps}
                      className={`${styles.track} ${state.index === 1 ? styles.trackActive : styles.trackInactive}`}
                    />
                  );
                }}
                renderThumb={(props, state) => {
                  const { key, ...restProps } = props;
                  return <div key={key} {...restProps} className={styles.thumb} />;
                }}
              />
              <div className={styles.sliderLabels}>
                <span>{formatPrice(sliderValue[0])}</span>
                <span>{formatPrice(sliderValue[1])}</span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="outline"
              className={`${styles.clearButton} ${hasActiveFilters ? styles.clearButtonVisible : styles.clearButtonHidden}`}
              onClick={handleClearFilters}
            >
              <Eraser size={18} />
              Limpar
            </Button>

            <Button
              variant="primary"
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 size={18} className={styles.spinner} />
              ) : (
                <Search size={18} />
              )}
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>

            <Button variant="outline" className={styles.filtersButton} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <X size={18} /> : <SlidersHorizontal size={18} />}
              {isExpanded ? "Fechar" : "Mais Filtros"}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ overflow: "hidden" }}
            >
              <div className={styles.advancedFiltersWrapper}>
                <AdvancedFilters
                  initialFilters={advancedFilters}
                  onClose={() => setIsExpanded(false)}
                  onApply={handleApplyAdvancedFilters}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}