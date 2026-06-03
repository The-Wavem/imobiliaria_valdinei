import { Eye, MessageCircle } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./LeadsTable.module.css";

const requestStatusOptions = [
  { label: "Novo", value: "Novo" },
  { label: "Em Atendimento", value: "Em Atendimento" },
  { label: "Agendado", value: "Agendado" },
  { label: "Finalizado", value: "Finalizado" },
];

const requestTypeStyles = {
  Visita: styles.requestBadgeVisit,
  Contato: styles.requestBadgeContact,
  "WhatsApp Direto": styles.requestBadgeContact,
};

const requestStatusRowStyles = {
  Novo: styles.rowNovo,
  "Em Atendimento": styles.rowAtendimento,
  Agendado: styles.rowAgendado,
  Finalizado: styles.rowFinalizado,
};

const requestStatusColor = {
  Novo: "novo",
  "Em Atendimento": "atendimento",
  Agendado: "agendado",
  Finalizado: "finalizado",
};

function sanitizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function buildWhatsAppUrl(name, phone, property) {
  const message = `Olá ${name}, vi que você solicitou informações sobre o imóvel ${property}. Como posso ajudar?`;
  return `https://wa.me/55${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

function getRequestTypeClass(requestType) {
  return requestTypeStyles[requestType] || styles.requestBadgeContact;
}

function getRequestStatusColor(status) {
  return requestStatusColor[status] || "novo";
}

function getRequestRowClass(status) {
  return requestStatusRowStyles[status] || styles.rowNovo;
}

function formatLeadDate(createdAt, fallbackDate) {
  if (createdAt) {
    const d = new Date(createdAt);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  return fallbackDate || "N/A";
}

export default function LeadsTable({
  leads = [],
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  onPageChange,
  onViewDetails,
  onStatusChange,
}) {
  const showStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showEnd = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <section className={styles.section} aria-label="Tabela de solicitações">
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Leitura e triagem</p>
            <h2 className={styles.title}>Solicitações recentes</h2>
          </div>
          <p className={styles.meta}>{totalItems} itens filtrados</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Imóvel</th>
                <th>Tipo de Solicitação</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const clientName = lead.name || lead.client?.name || "Sem Nome";
                const clientPhone = lead.phone || lead.client?.phone || "";
                const clientEmail = lead.email || lead.client?.email || "";
                const propTitle = lead.propertyTitle || lead.client?.property || "Imóvel não especificado";
                const reqType = lead.source || lead.requestType || "Contato";
                const formattedDate = formatLeadDate(lead.createdAt, lead.date);

                return (
                  <tr key={lead.id} className={`${styles.tableRow} ${getRequestRowClass(lead.status)}`.trim()}>
                    <td>
                      <div className={styles.dateCell}>{formattedDate}</div>
                    </td>
                    <td>
                      <div className={styles.clientCell}>
                        <strong>{clientName}</strong>
                        <span>{clientPhone}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.propertyCell}>
                        <strong>{propTitle}</strong>
                        <span>{clientEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.requestBadge} ${getRequestTypeClass(reqType)}`}>
                        {reqType}
                      </span>
                    </td>
                    <td>
                      <Select
                        compact
                        label="Status"
                        options={requestStatusOptions}
                        value={lead.status}
                        onChange={(nextStatus) => onStatusChange(lead.id, nextStatus)}
                        className={styles.statusSelect}
                        contentClassName={styles.statusSelectMenu}
                        statusColor={getRequestStatusColor(lead.status)}
                      />
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <Button
                          type="button"
                          variant="outline"
                          className={`${styles.actionButton} ${styles.whatsappButton}`}
                          onClick={() => window.open(buildWhatsAppUrl(clientName, clientPhone, propTitle), "_blank", "noopener,noreferrer")}
                          aria-label={`Abrir WhatsApp para ${clientName}`}
                        >
                          <MessageCircle size={16} />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className={styles.actionButton}
                          onClick={() => onViewDetails(lead)}
                        >
                          <Eye size={16} />
                          <span>Ver Detalhes</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    Nenhuma solicitação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.paginationFooter}>
          <p className={styles.paginationSummary}>
            Mostrando {showStart} a {showEnd} de {totalItems} solicitações
          </p>

          <div className={styles.paginationControls}>
            <Button
              type="button"
              variant="outline"
              className={styles.paginationButton}
              onClick={() => onPageChange((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            <span className={styles.paginationPageIndicator}>
              Página {currentPage} de {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              className={styles.paginationButton}
              onClick={() => onPageChange((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </footer>
      </div>
    </section>
  );
}