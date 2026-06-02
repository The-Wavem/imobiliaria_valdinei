import { Pencil, ToggleLeft, ToggleRight, Trash2, Eye } from "lucide-react"; // <-- Adicionei o Eye
import Button from "@components/ui/Button/Button.jsx";
import styles from "./PropertyTable.module.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PropertyTable({
  properties = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  // Ajustado para ler o array 'photos' que o Firebase salva
  const getThumbnail = (property) =>
    (property.photos && property.photos[0]) ||
    property.imageUrl ||
    property.thumbnail ||
    undefined;

  return (
    <section
      className={styles.section}
      aria-label="Tabela de imóveis cadastrados"
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Cadastro e controle</p>
            <h2 className={styles.title}>Imóveis cadastrados</h2>
          </div>

          <p className={styles.meta}>
            Página {currentPage} de {totalPages}
          </p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Imóvel</th>
                <th>Tipo / Categoria</th>
                <th>Status</th>
                <th>Views</th> {/* <-- NOVA COLUNA */}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {properties.length > 0 ? (
                properties.map((property) => {
                  // BLINDAGEM DE DADOS: Fallbacks seguros
                  const title =
                    property.title || property.content?.summary || "Sem título";
                  const code = property.code || "S/N";
                  const type = property.type || "-";
                  const category = property.category || "-";
                  const price = Number(
                    property.price || property.pricing?.price || 0,
                  );
                  const isActive = property.status === "Ativo"; // Checagem direta do status
                  const views = property.views || 0; // Contagem de views

                  return (
                    <tr
                      key={property.firestoreId || property.id || property.code}
                      className={`${styles.row} ${isActive ? styles.rowActive : styles.rowInactive}`.trim()}
                    >
                      <td data-label="Foto">
                        <div className={styles.cellContent}>
                          <div className={styles.thumbnail}>
                            <img src={getThumbnail(property)} alt={title} />
                          </div>
                        </div>
                      </td>

                      <td data-label="Imóvel">
                        <div className={styles.cellContent}>
                          <strong className={styles.propertyTitle}>
                            {title}
                          </strong>
                          <span className={styles.propertyCode}>{code}</span>
                        </div>
                      </td>

                      <td data-label="Tipo / Categoria">
                        <div className={styles.cellContent}>
                          <span className={styles.propertyType}>{type}</span>
                          <small className={styles.propertyCategory}>
                            {category}
                          </small>
                        </div>
                      </td>

                      <td data-label="Status">
                        <div className={styles.cellContent}>
                          <Button
                            type="button"
                            variant={isActive ? "primary" : "secondary"}
                            className={`${styles.statusButton} ${isActive ? styles.statusActive : styles.statusInactive}`.trim()}
                            onClick={() =>
                              onToggleStatus &&
                              onToggleStatus(property.id, property.status)
                            }
                          >
                            {isActive ? (
                              <ToggleRight size={16} />
                            ) : (
                              <ToggleLeft size={16} />
                            )}
                            <span>{isActive ? "Ativo" : "Inativo"}</span>
                          </Button>
                          <span className={styles.propertyPrice}>
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </td>

                      {/* AQUI ESTÁ A COLUNA DE VIEWS */}
                      <td data-label="Views">
                        <div
                          className={styles.cellContent}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "0.4rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <Eye size={16} />
                          <strong
                            style={{
                              fontSize: "1rem",
                              color: "var(--color-brand-secondary)",
                            }}
                          >
                            {views}
                          </strong>
                        </div>
                      </td>

                      <td data-label="Ações">
                        <div
                          className={`${styles.cellContent} ${styles.actionsCell}`}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.actionButton}
                            onClick={() => onEdit(property)}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            className={styles.actionButton}
                            onClick={() => onDelete && onDelete(property.id)}
                          >
                            <Trash2 size={16} />
                            <span>Excluir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>
                    {" "}
                    {/* Mudamos para 6 colunas para alinhar certinho */}
                    <div className={styles.emptyState}>
                      <strong>Nenhum imóvel encontrado</strong>
                      <span>
                        Ajuste a busca ou os filtros para ver resultados.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.paginationFooter}>
          <Button
            type="button"
            variant="outline"
            className={styles.paginationButton}
            onClick={() => onPageChange((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <span className={styles.paginationIndicator}>
            Página {currentPage} de {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            className={styles.paginationButton}
            onClick={() =>
              onPageChange((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </footer>
      </div>
    </section>
  );
}
