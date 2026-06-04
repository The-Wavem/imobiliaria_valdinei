import Modal from "@components/ui/Modal/Modal.jsx";
import styles from "./LeadDetailsModal.module.css";

// Mesma lógica do LeadsTable — resolve o label e o tipo de origem do lead
function resolveLeadOrigin(lead) {
  const propTitle = lead.propertyTitle || lead.client?.property;
  if (propTitle && propTitle.trim()) return { label: propTitle.trim(), isProperty: true };

  const origin = lead.origin || lead.origem || "";
  if (origin) return { label: origin, isProperty: false };

  if (lead.requestType === "WhatsApp Direto") return { label: "WhatsApp Direto", isProperty: false };

  return { label: "Contato Geral", isProperty: false };
}

export default function LeadDetailsModal({ isOpen, onClose, lead }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Solicitação" variant="admin">
      {lead ? (
        (() => {
          const clientName = lead.name || lead.client?.name || "Sem Nome";
          const clientPhone = lead.phone || lead.client?.phone || "Não informado";
          const clientEmail = lead.email || lead.client?.email || "Não informado";
          const origin = resolveLeadOrigin(lead);
          const reqType = lead.source || lead.requestType || "Contato";

          return (
            <div className={styles.detailsModal}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Nome</span>
                  <strong>{clientName}</strong>
                </div>

                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Telefone</span>
                  <strong>{clientPhone}</strong>
                </div>

                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>E-mail</span>
                  <strong>{clientEmail}</strong>
                </div>

                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>
                    {origin.isProperty ? "Imóvel de Interesse" : "Origem do Contato"}
                  </span>
                  <strong>{origin.label}</strong>
                </div>
              </div>

              {reqType === "Visita" ? (
                <div className={styles.detailGridTwo}>
                  <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Data Desejada</span>
                    <strong>{lead.desiredDate || "Não informada"}</strong>
                  </div>

                  <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Período</span>
                    <strong>{lead.period || "Não informado"}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.messageBlock}>
                  <span className={styles.detailLabel}>Mensagem</span>
                  <div className={styles.messageArea}>{lead.message || "Nenhuma mensagem enviada."}</div>
                </div>
              )}
            </div>
          );
        })()
      ) : null}
    </Modal>
  );
}