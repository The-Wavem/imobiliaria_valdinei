import { Plus, Search } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./PropertyFilterBar.module.css";

const statusOptions = [
  { label: "Todos os Status", value: "Todos" },
  { label: "Disponível", value: "Disponível" },
  { label: "Reservado", value: "Reservado" },
  { label: "Vendido", value: "Vendido" },
  { label: "Alugado", value: "Alugado" },
  { label: "Inativo", value: "Inativo" },
];

export default function PropertyFilterBar({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  onAddClick,
}) {
  return (
    <section className={styles.section} aria-label="Filtros de imóveis">
      <div className={styles.container}>
        <div className={styles.searchField}>
          <Input
            icon={Search}
            label="Buscar imóvel"
            placeholder="Buscar imóvel..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        <div className={styles.selectField}>
          <Select
            compact
            label="Status"
            options={statusOptions}
            value={filterStatus}
            onChange={onStatusChange}
          />
        </div>

        <div className={styles.actionField}>
          <Button type="button" variant="primary" className={styles.addButton} onClick={onAddClick}>
            <Plus size={18} />
            <span>Adicionar Imóvel</span>
          </Button>
        </div>
      </div>
    </section>
  );
}