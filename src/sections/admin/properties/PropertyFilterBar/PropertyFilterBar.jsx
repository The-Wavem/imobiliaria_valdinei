import { Plus, Search, Trash2, RotateCcw } from "lucide-react";
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
  { label: "Lixeira", value: "Lixeira" },
];

export default function PropertyFilterBar({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  onAddClick,
}) {
  const isTrashActive = filterStatus === "Lixeira";

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

        <div className={styles.actionField} style={{ gap: "0.5rem" }}>
          <Button
            type="button"
            variant={isTrashActive ? "primary" : "secondary"}
            className={styles.addButton}
            onClick={() => onStatusChange(isTrashActive ? "Todos" : "Lixeira")}
            title={isTrashActive ? "Voltar aos imóveis do catálogo" : "Abrir Lixeira de Imóveis"}
            style={
              isTrashActive
                ? { backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#fff" }
                : { border: "1px solid rgba(239, 68, 68, 0.3)", color: "#dc2626", background: "rgba(239, 68, 68, 0.06)" }
            }
          >
            {isTrashActive ? <RotateCcw size={18} /> : <Trash2 size={18} />}
            <span>{isTrashActive ? "Ver Catálogo" : "Abrir Lixeira"}</span>
          </Button>

          <Button type="button" variant="primary" className={styles.addButton} onClick={onAddClick}>
            <Plus size={18} />
            <span>Adicionar Imóvel</span>
          </Button>
        </div>
      </div>
    </section>
  );
}