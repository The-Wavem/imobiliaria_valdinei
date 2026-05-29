import Modal from "@components/ui/Modal/Modal.jsx";
import styles from "./LeadDetailsModal.module.css";

export default function LeadDetailsModal({ isOpen, onClose, lead }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Solicitação">
      {lead ? (
        <div className={styles.detailsModal}>
          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Nome</span>
              <strong>{lead.client.name}</strong>
            </div>

            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Telefone</span>
              <strong>{lead.client.phone}</strong>
            </div>

            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>E-mail</span>
              <strong>{lead.client.email}</strong>
            </div>

            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Imóvel de Interesse</span>
              <strong>{lead.client.property}</strong>
            </div>
          </div>

          {lead.requestType === "Visita" ? (
            <div className={styles.detailGridTwo}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Data Desejada</span>
                <strong>{lead.desiredDate}</strong>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Período</span>
                <strong>{lead.period}</strong>
              </div>
            </div>
          ) : (
            <div className={styles.messageBlock}>
              <span className={styles.detailLabel}>Mensagem</span>
              <div className={styles.messageArea}>{lead.message}</div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}