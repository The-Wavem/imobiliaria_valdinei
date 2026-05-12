import { useState } from "react";
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
      <div className={styles.overlay} />

      <div className={styles.container}>
        <div className={styles.searchCard}>
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
        </div>

        <div className={styles.copy}>
          <span className={styles.sideLabel}>Curitiba e região</span>
          <h2>O lar perfeito para sua família viver os melhores momentos.</h2>
          <p>
            Encontre o imóvel dos seus sonhos com a segurança e transparência
            que você merece.
          </p>

          <div className={styles.actions}>
            <Button variant="primary">Falar com corretor</Button>
            <Button variant="outline">Ver imóveis</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
