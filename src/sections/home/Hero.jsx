import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home as HomeIcon, MapPin } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./Hero.module.css";

const typeOptions = [
  { value: "", label: "Qualquer tipo" },
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "sobrado", label: "Sobrado" },
  { value: "terreno", label: "Terreno" },
];

const initialFilters = {
  location: "",
  propertyType: "",
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  },
};

export default function Hero() {
  const [searchTab, setSearchTab] = useState("Alugar");
  const [filters, setFilters] = useState(initialFilters);
  const navigate = useNavigate();

  const handleFieldChange = (field) => (event) => {
    const value = typeof event === "string" ? event : event?.target?.value;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (filters.location) {
      params.append('location', filters.location);
    }
    
    if (filters.propertyType) {
      params.append('propertyType', filters.propertyType);
    }
    
    const basePath = searchTab === "Alugar" ? "/alugar" : "/comprar";
    navigate(`${basePath}?${params.toString()}`);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground} />
      <div className={styles.overlay} />

      <motion.div 
        className={styles.container}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div className={styles.searchCard} variants={fadeUpItem}>
          <div className={styles.cardHeader}>
            <span className={styles.kicker}>Imobiliária Valdinei</span>
            <h1>{searchTab === "Alugar" ? "Alugue o lar ideal" : "Compre o lar ideal"}</h1>
            <p>
              Explore imóveis em Curitiba e região com uma busca simples,
              objetiva e preparada para guiar sua próxima decisão.
            </p>
          </div>

          <div className={styles.tabs} aria-label="Tipo de transação">
            {['Alugar', 'Comprar'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.tab} ${searchTab === tab ? styles.tabActive : ""}`}
                onClick={() => setSearchTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldsGrid} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <Input
                icon={MapPin}
                label="Localização"
                placeholder="Busque por bairro ou cidade"
                value={filters.location}
                onChange={handleFieldChange("location")}
              />

              <Select
                icon={HomeIcon}
                label="Tipo de Imóvel"
                options={typeOptions}
                value={filters.propertyType}
                onChange={handleFieldChange("propertyType")}
              />
            </div>
          </div>

          <div className={styles.searchAction}>
            <Button variant="primary" onClick={handleSearch}>
              Buscar imóveis
            </Button>
          </div>
        </motion.div>

        <div className={styles.copy}>
          <motion.span className={styles.sideLabel} variants={fadeUpItem}>Curitiba e região</motion.span>
          <motion.h2 variants={fadeUpItem}>O lar perfeito para sua família viver os melhores momentos.</motion.h2>
          <motion.p variants={fadeUpItem}>
            Encontre o imóvel dos seus sonhos com a segurança e transparência
            que você merece.
          </motion.p>

          <motion.div className={styles.actions} variants={fadeUpItem}>
            <Button variant="primary" onClick={() => navigate("/contato")}>
              Falar com corretor
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
