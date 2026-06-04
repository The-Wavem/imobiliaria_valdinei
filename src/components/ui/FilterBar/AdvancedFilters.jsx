import { useMemo, useState } from "react";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./AdvancedFilters.module.css";

const counterGroups = [
  {
    key: "bedrooms",
    label: "Quartos",
    options: ["Qualquer", "1+", "2+", "3+", "4+"],
  },
  {
    key: "bathrooms",
    label: "Banheiros",
    options: ["Qualquer", "1+", "2+", "3+", "4+"],
  },
  {
    key: "parking",
    label: "Vagas",
    options: ["Qualquer", "1+", "2+", "3+", "4+"],
  },
];

const amenities = ["Piscina", "Churrasqueira", "Elevador", "Pet Friendly", "Mobiliado"];

export default function AdvancedFilters({ initialFilters, onClose, onApply }) {
  const [selectedCounters, setSelectedCounters] = useState({
    bedrooms: initialFilters?.bedrooms || "Qualquer",
    bathrooms: initialFilters?.bathrooms || "Qualquer",
    parking: initialFilters?.parking || "Qualquer",
  });

  const [selectedAmenities, setSelectedAmenities] = useState(initialFilters?.amenities || []);
  const [areaRange, setAreaRange] = useState({ 
    min: initialFilters?.areaMin || "", 
    max: initialFilters?.areaMax || "" 
  });

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const handleClear = () => {
    const clearedFilters = {
      bedrooms: "Qualquer",
      bathrooms: "Qualquer",
      parking: "Qualquer",
      amenities: [],
      areaMin: "",
      areaMax: "",
    };

    setSelectedCounters({ bedrooms: "Qualquer", bathrooms: "Qualquer", parking: "Qualquer" });
    setSelectedAmenities([]);
    setAreaRange({ min: "", max: "" });
    onApply?.(clearedFilters);
  };

  const handleApply = () => {
    onApply?.({
      bedrooms: selectedCounters.bedrooms,
      bathrooms: selectedCounters.bathrooms,
      parking: selectedCounters.parking,
      amenities: selectedAmenities,
      areaMin: areaRange.min,
      areaMax: areaRange.max,
    });
    onClose?.();
  };

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        {counterGroups.map((group) => (
          <div key={group.key} className={styles.group}>
            <h3>{group.label}</h3>
            <div className={styles.pills}>
              {group.options.map((option) => {
                const isSelected = selectedCounters[group.key] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.pill} ${isSelected ? styles.pillActive : ""}`}
                    onClick={() => setSelectedCounters((current) => ({ ...current, [group.key]: option }))}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Área (m²)</h3>
        <div className={styles.areaGrid}>
          <input
            type="text"
            placeholder="Mínimo"
            className={styles.areaInput}
            value={areaRange.min}
            onChange={(event) => setAreaRange((current) => ({ ...current, min: event.target.value }))}
          />
          <input
            type="text"
            placeholder="Máximo"
            className={styles.areaInput}
            value={areaRange.max}
            onChange={(event) => setAreaRange((current) => ({ ...current, max: event.target.value }))}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3>Comodidades</h3>
        <div className={styles.amenitiesGrid}>
          {amenities.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity);

            return (
              <button
                key={amenity}
                type="button"
                className={`${styles.checkboxChip} ${isSelected ? styles.checkboxChipActive : ""}`}
                onClick={() => toggleAmenity(amenity)}
              >
                <span className={styles.checkboxMark} />
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <Button variant="outline" onClick={handleClear}>Limpar Filtros</Button>
        <Button variant="primary" onClick={handleApply}>Aplicar Filtros</Button>
      </div>
    </div>
  );
}