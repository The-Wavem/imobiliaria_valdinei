import { useState, useEffect } from "react";
import { MapPin, Home, DollarSign, Search, SlidersHorizontal, X, Eraser } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactSlider from "react-slider";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import AdvancedFilters from "@components/ui/FilterBar/AdvancedFilters.jsx";
import { trackFilterUsage } from "@utils/analytics";
import { logSearchAnalytics } from "@services/analyticsService.js";
import styles from "./FilterBar.module.css";

const typeOptions = [
  { value: "", label: "Tipo de Imóvel" },
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "sobrado", label: "Sobrado" },
  { value: "terreno", label: "Terreno" },
];

export default function FilterBar({ onSearch, onAdvancedFiltersApply }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    propertyType: "",
    priceMin: "",
    priceMax: "",
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    bedrooms: "Qualquer",
    bathrooms: "Qualquer",
    parking: "Qualquer",
    amenities: [],
    areaMin: "",
    areaMax: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFieldChange = (field) => (event) => {
    const value = typeof event === "string" ? event : event?.target?.value;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const MAX_PRICE = 5000000; // 5 Milhões

  const sliderValue = [
    filters.priceMin === "" ? 0 : Number(filters.priceMin),
    filters.priceMax === "" ? MAX_PRICE : Number(filters.priceMax)
  ];

  const handleSliderChange = (newValues) => {
    const [min, max] = newValues;
    setFilters((prev) => ({
      ...prev,
      priceMin: min === 0 ? "" : min,
      priceMax: max === MAX_PRICE ? "" : max,
    }));
  };

  const formatPrice = (value) => {
    if (value === MAX_PRICE) return "R$ 5 Mi+";
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

  const handleSearch = () => {
    const currentFilters = { ...filters, ...advancedFilters };
    trackAndLogSearch(currentFilters);
    onSearch?.(currentFilters);
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
    setFilters(emptyFilters);
    setAdvancedFilters(emptyAdvanced);
    
    const combinedEmpty = { ...emptyFilters, ...emptyAdvanced };
    onSearch?.(combinedEmpty);
    if (onAdvancedFiltersApply) {
      onAdvancedFiltersApply(combinedEmpty);
    }
  };

  const hasActiveFilters =
    Boolean(filters.location) ||
    Boolean(filters.propertyType) ||
    Boolean(filters.priceMin) ||
    Boolean(filters.priceMax) ||
    Object.entries(advancedFilters).some(([key, val]) => {
      if (key === "amenities") return val.length > 0;
      if (key === "areaMin" || key === "areaMax") return Boolean(val);
      return val !== "Qualquer";
    });

  const handleApplyAdvancedFilters = (nextAdvancedFilters) => {
    setAdvancedFilters(nextAdvancedFilters);
    const currentFilters = { ...filters, ...nextAdvancedFilters };
    trackAndLogSearch(currentFilters);
    onAdvancedFiltersApply?.(currentFilters);
  };

  return (
    <section className={`${styles.bar} ${isStuck ? styles.isStuck : ""}`}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <Input
            icon={MapPin}
            label="Localização"
            placeholder="Cidade ou Bairro"
            value={filters.location}
            onChange={handleFieldChange("location")}
            className={`${styles.fieldItem} ${filters.location ? styles.activeFilter : ""}`}
          />

          <Select
            icon={Home}
            label="Tipo de Imóvel"
            options={typeOptions}
            value={filters.propertyType}
            onChange={handleFieldChange("propertyType")}
            className={`${styles.fieldItem} ${filters.propertyType ? styles.activeFilter : ""}`}
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
                step={50000}
                value={sliderValue}
                onChange={handleSliderChange}
                pearling
                minDistance={100000}
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

            <Button variant="primary" className={styles.searchButton} onClick={handleSearch}>
              <Search size={18} />
              Buscar
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