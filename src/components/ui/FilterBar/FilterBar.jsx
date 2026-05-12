import { useState } from "react";
import { MapPin, Home, DollarSign, Search, SlidersHorizontal } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import Modal from "@components/ui/Modal/Modal.jsx";
import AdvancedFilters from "@components/ui/FilterBar/AdvancedFilters.jsx";
import styles from "./FilterBar.module.css";

const typeOptions = [
  { value: "", label: "Tipo de Imóvel" },
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "sobrado", label: "Sobrado" },
  { value: "terreno", label: "Terreno" },
];

const priceOptions = [
  { value: "", label: "Faixa de Preço" },
  { value: "ate-500", label: "Até R$ 500 mil" },
  { value: "ate-800", label: "Até R$ 800 mil" },
  { value: "ate-1200", label: "Até R$ 1,2 mi" },
  { value: "acima-1200", label: "Acima de R$ 1,2 mi" },
];

export default function FilterBar({ onSearch, onAdvancedFiltersApply }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    propertyType: "",
    priceRange: "",
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
    const { value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    onSearch?.({ ...filters, ...advancedFilters });
  };

  const handleApplyAdvancedFilters = (nextAdvancedFilters) => {
    setAdvancedFilters(nextAdvancedFilters);
    onAdvancedFiltersApply?.({ ...filters, ...nextAdvancedFilters });
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
          />

          <Select
            icon={Home}
            label="Tipo de Imóvel"
            options={typeOptions}
            value={filters.propertyType}
            onChange={handleFieldChange("propertyType")}
          />

          <Select
            icon={DollarSign}
            label="Faixa de Preço"
            options={priceOptions}
            value={filters.priceRange}
            onChange={handleFieldChange("priceRange")}
          />

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