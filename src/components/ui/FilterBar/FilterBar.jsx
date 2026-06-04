import { useState, useEffect } from "react";
import { MapPin, Home, DollarSign, Search, SlidersHorizontal, X, Eraser } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleSearch = () => {
    const currentFilters = { ...filters, ...advancedFilters };
    trackFilterUsage(currentFilters);
    logSearchAnalytics(currentFilters);
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
    trackFilterUsage(currentFilters);
    logSearchAnalytics(currentFilters);
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

            <div className={styles.priceInputs}>
              <Input
                label="Mínimo"
                placeholder="R$ 0"
                value={filters.priceMin}
                onChange={handleFieldChange("priceMin")}
                type="text"
                className={`${styles.priceInput} ${filters.priceMin ? styles.activeFilter : ""}`}
              />

              <Input
                label="Máximo"
                placeholder="R$ 500 mil"
                value={filters.priceMax}
                onChange={handleFieldChange("priceMax")}
                type="text"
                className={`${styles.priceInput} ${filters.priceMax ? styles.activeFilter : ""}`}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button variant="outline" className={styles.clearButton} onClick={handleClearFilters}>
                    <Eraser size={18} />
                    Limpar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

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