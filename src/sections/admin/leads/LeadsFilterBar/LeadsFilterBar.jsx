import { Search } from "lucide-react";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./LeadsFilterBar.module.css";

const filterStatusOptions = [
  { label: "Todos", value: "Todos" },
  { label: "Novo", value: "Novo" },
  { label: "Em Atendimento", value: "Em Atendimento" },
  { label: "Agendado", value: "Agendado" },
  { label: "Finalizado", value: "Finalizado" },
];

const typeOptions = [
  { label: "Todos", value: "Todos" },
  { label: "Visita", value: "Visita" },
  { label: "Contato", value: "Contato" },
];

export default function LeadsFilterBar({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
}) {
  return (
    <section className={styles.section} aria-label="Filtros de solicitações">
      <div className={styles.container}>
        <div className={styles.searchField}>
          <Input
            icon={Search}
            label="Buscar cliente"
            placeholder="Digite o nome do cliente"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        <div className={styles.selectField}>
          <Select
            compact
            label="Status"
            options={filterStatusOptions}
            value={filterStatus}
            onChange={onStatusChange}
          />
        </div>

        <div className={styles.selectField}>
          <Select
            compact
            label="Tipo"
            options={typeOptions}
            value={filterType}
            onChange={onTypeChange}
          />
        </div>
      </div>
    </section>
  );
}