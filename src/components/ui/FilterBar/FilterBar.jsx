import { useState } from "react";
import { MapPin, Home, DollarSign, Search, SlidersHorizontal } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleApplyAdvancedFilters = (nextAdvancedFilters) => {
    setAdvancedFilters(nextAdvancedFilters);
    const currentFilters = { ...filters, ...nextAdvancedFilters };
    trackFilterUsage(currentFilters);
    logSearchAnalytics(currentFilters);
    onAdvancedFiltersApply?.(currentFilters);
  };

  return (
    <>
      <section className={styles.bar}>
        <div className={styles.container}>
          <Input
            icon={MapPin}
            label="Localização"
            placeholder="Cidade ou Bairro"
            value={filters.location}
            onChange={handleFieldChange("location")}
            className={styles.fieldItem}
          />

          <Select
            icon={Home}
            label="Tipo de Imóvel"
            options={typeOptions}
            value={filters.propertyType}
            onChange={handleFieldChange("propertyType")}
            className={styles.fieldItem}
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
                className={styles.priceInput}
              />

              <Input
                label="Máximo"
                placeholder="R$ 500 mil"
                value={filters.priceMax}
                onChange={handleFieldChange("priceMax")}
                type="text"
                className={styles.priceInput}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" className={styles.searchButton} onClick={handleSearch}>
              <Search size={18} />
              Buscar
            </Button>

            <Button variant="outline" className={styles.filtersButton} onClick={() => setIsModalOpen(true)}>
              <SlidersHorizontal size={18} />
              Mais Filtros
            </Button>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Filtros Avançados">
        <AdvancedFilters
          onClose={() => setIsModalOpen(false)}
          onApply={handleApplyAdvancedFilters}
        />
      </Modal>
    </>
  );
}