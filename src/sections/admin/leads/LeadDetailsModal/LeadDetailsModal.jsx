import Modal from "@components/ui/Modal/Modal.jsx";
import styles from "./LeadDetailsModal.module.css";

export default function LeadDetailsModal({ isOpen, onClose, lead }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Solicitação" variant="admin">
      {lead ? (
        (() => {
          const clientName = lead.name || lead.client?.name || "Sem Nome";
          const clientPhone = lead.phone || lead.client?.phone || "Não informado";
          const clientEmail = lead.email || lead.client?.email || "Não informado";
          const propTitle = lead.propertyTitle || lead.client?.property || "Imóvel não especificado";
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
                  <span className={styles.detailLabel}>Imóvel de Interesse</span>
                  <strong>{propTitle}</strong>
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