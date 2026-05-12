import { useState } from "react";
import { BedDouble, Building2, MapPin, DollarSign } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./Hero.module.css";

const bairroOptions = [
  { value: "", label: "Selecione um bairro" },
  { value: "agua-verde", label: "Água Verde" },
  { value: "batel", label: "Batel" },
  { value: "centro", label: "Centro" },
  { value: "portao", label: "Portão" },
];

const valorOptions = [
  { value: "", label: "Selecione a faixa de valor" },
  { value: "ate-300", label: "Até R$ 300 mil" },
  { value: "ate-500", label: "Até R$ 500 mil" },
  { value: "ate-800", label: "Até R$ 800 mil" },
  { value: "acima-800", label: "Acima de R$ 800 mil" },
];

const initialFilters = {
  cidade: "Curitiba e região",
  bairro: "",
  valor: "",
  quartos: "",
};

export default function Hero() {
  const [searchTab, setSearchTab] = useState("Comprar");
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
        <div className={styles.copy}>
          <span className={styles.kicker}>Imobiliária Valdinei</span>
          <h1>Encontre o imóvel dos seus sonhos</h1>
          <p>
            Casas, apartamentos e terrenos em Curitiba e região com um
            atendimento próximo e especializado.
          </p>

          <div className={styles.actions}>
            <Button variant="primary">Falar com corretor</Button>
            <Button variant="outline">Ver imóveis</Button>
          </div>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.tabs} aria-label="Tipo de transação">
            {['Comprar', 'Alugar'].map((tab) => (
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
              placeholder="Curitiba e região"
              value={filters.cidade}
              onChange={handleFieldChange("cidade")}
            />

            <Select
              icon={Building2}
              label="Bairro"
              options={bairroOptions}
              value={filters.bairro}
              onChange={handleFieldChange("bairro")}
            />

            <Select
              icon={DollarSign}
              label="Faixa de valor"
              options={valorOptions}
              value={filters.valor}
              onChange={handleFieldChange("valor")}
            />

            <Input
              icon={BedDouble}
              label="Quartos"
              placeholder="Ex: 2, 3, 4"
              value={filters.quartos}
              onChange={handleFieldChange("quartos")}
            />
          </div>

          <div className={styles.searchAction}>
            <Button variant="secondary" onClick={handleSearch}>
              Buscar imóveis
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
