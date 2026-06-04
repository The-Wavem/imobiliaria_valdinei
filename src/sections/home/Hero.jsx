import { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, Home as HomeIcon, MapPin, DollarSign } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./Hero.module.css";

const bairroOptions = [
  { value: "", label: "Nº de quartos" },
  { value: "1", label: "1+ quartos" },
  { value: "2", label: "2+ quartos" },
  { value: "3", label: "3+ quartos" },
  { value: "4", label: "4+ quartos" },
];

const valorOptions = [
  { value: "", label: "Escolha o valor" },
  { value: "ate-1500", label: "Até R$ 1.500" },
  { value: "ate-3000", label: "Até R$ 3.000" },
  { value: "ate-5000", label: "Até R$ 5.000" },
  { value: "qualquer", label: "Qualquer valor" },
];

const initialFilters = {
  cidade: "",
  bairro: "",
  valor: "",
  quartos: "",
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

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    console.log({
      transaction: searchTab,
      filters,
    });
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
            <Input
              icon={MapPin}
              label="Cidade"
              placeholder="Busque por cidade"
              value={filters.cidade}
              onChange={handleFieldChange("cidade")}
            />

            <Input
              icon={HomeIcon}
              label="Bairro"
              placeholder="Busque por bairro"
              value={filters.bairro}
              onChange={handleFieldChange("bairro")}
            />

            <div className={styles.fieldsGrid}>
              <Select
                icon={DollarSign}
                label="Valor total até"
                options={valorOptions}
                value={filters.valor}
                onChange={handleFieldChange("valor")}
              />

              <Select
                icon={BedDouble}
                label="Quartos"
                options={bairroOptions}
                value={filters.quartos}
                onChange={handleFieldChange("quartos")}
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
            <Button variant="primary">Falar com corretor</Button>
            <Button variant="outline">Ver imóveis</Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
