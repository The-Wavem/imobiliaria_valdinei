import { Pencil, ToggleLeft, ToggleRight, Trash2, Eye, Star } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Select from "@components/ui/Select/Select.jsx";
import { calculateTotalScore } from "@utils/rankingEngine.js";
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
  onToggleFeatured,
}) {
  const getThumbnail = (property) =>
    (property.photos && property.photos[0]) ||
    property.imageUrl ||
    property.thumbnail ||
    "https://static.vecteezy.com/system/resources/previews/016/916/479/large_2x/placeholder-icon-design-free-vector.jpg";

  const getScore = (property) => {
    let score = 0;
    const title = property.title || property.content?.summary || "";
    const price = property.pricing?.price || property.price || "";
    const area = property.area || property.location?.area || "";
    const bedrooms = property.bedrooms || property.location?.bedrooms || "";
    const bathrooms = property.bathrooms || property.location?.bathrooms || "";
    const cep = property.location?.cep || property.cep || "";
    const street = property.location?.logradouro || property.location?.street || property.street || property.location?.address || property.address || "";
    const features = property.features || [];
    const photos = property.photos || [];
    const desc = property.content?.description || property.description || "";
    const videos = property.videos || [];
    
    if (!!title.trim()) score += 10;
    if (!!String(price).trim()) score += 10;
    if (!!String(area).trim()) score += 5;
    if (Number(bedrooms) > 0) score += 5;
    if (Number(bathrooms) > 0) score += 5;
    if (!!cep.trim() && !!street.trim()) score += 10;
    if (features.length >= 3) score += 10;
    if (photos.length > 0) score += 15;
    if (photos.length > 4) score += 10;
    if (desc.length > 50) score += 15;
    if (videos.length > 0) score += 5;
    
    score = Math.min(score, 100);
    let color = "#ef4444";
    if (score >= 50) color = "#eab308";
    if (score >= 80) color = "#10b981";
    return { score, color };
  };

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
                <th>Nota</th>
                <th>Status</th>
                <th>Populariedade</th>
                <th>Views</th>
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
                  const scoreData = getScore(property);
                  const wavemRank = calculateTotalScore(property);

                  return (
                    <tr
                      key={property.firestoreId || property.id || property.code}
                      className={`${styles.row} ${isActive ? styles.rowActive : styles.rowInactive}`.trim()}
                    >
                      <td data-label="Foto">
                        <div className={styles.cellContent} style={{ position: "relative", width: "max-content" }}>
                          <div className={styles.thumbnail}>
                            <img
                              src={getThumbnail(property)}
                              alt={title}
                              style={{
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                          
                          {onToggleFeatured && (
                            <button
                              type="button"
                              className={`${styles.featuredStarBtn} ${property.featured ? styles.featuredStarActive : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFeatured(property.firestoreId || property.id, property.featured);
                              }}
                              title={property.featured ? "Remover destaque" : "Destacar imóvel"}
                            >
                              <Star size={14} fill={property.featured ? "currentColor" : "none"} />
                            </button>
                          )}
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

                      <td data-label="Nota">
                        <div
                          className={styles.cellContent}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Star size={16} fill={scoreData.color} color={scoreData.color} />
                          <strong
                            style={{
                              fontSize: "0.95rem",
                              color: scoreData.color,
                            }}
                          >
                            {scoreData.score}
                          </strong>
                        </div>
                      </td>

                      <td data-label="Status">
                        <div className={styles.cellContent}>
                          <div className={styles.statusSelectWrapper}>
                            <Select
                              value={property.status || "Disponível"}
                              onChange={(value) =>
                                onToggleStatus &&
                                onToggleStatus(
                                  property.firestoreId || property.id,
                                  value
                                )
                              }
                              options={[
                                { label: "Disponível", value: "Disponível" },
                                { label: "Reservado", value: "Reservado" },
                                { label: "Vendido", value: "Vendido" },
                                { label: "Alugado", value: "Alugado" },
                                { label: "Inativo", value: "Inativo" },
                              ]}
                              compact={true}
                            />
                          </div>
                          <span className={styles.propertyPrice}>
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </td>

                      <td data-label="Wavem Rank">
                        <div className={styles.cellContent}>
                          <span className={styles.scoreBadge}>
                            {wavemRank} pts
                          </span>
                        </div>
                      </td>

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
                            onClick={() =>
                              onDelete &&
                              onDelete(property.firestoreId || property.id)
                            }
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
                  <td colSpan={7}>
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
