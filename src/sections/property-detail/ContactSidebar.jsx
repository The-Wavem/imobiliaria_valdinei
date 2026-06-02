import { useState } from "react";
import { MessageCircle, CheckCircle2, X, Phone, User } from "lucide-react";
import { createPortal } from "react-dom";
import styles from "./ContactSidebar.module.css";

const VALDINEI_PHONE = import.meta.env.VITE_VALDINEI_PHONE; // substitua pelo número real

function buildWhatsAppMessage({ propertyTitle, propertyCode, propertyPrice, clientName, clientPhone }) {
  const price = Number(propertyPrice).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return encodeURIComponent(
    `Olá Valdinei! 👋\n\nTenho interesse no imóvel abaixo:\n\n` +
    `🏠 *${propertyTitle}*\n` +
    `📋 Código: ${propertyCode}\n` +
    `💰 Valor: ${price}\n\n` +
    `Meus dados:\n` +
    `👤 Nome: ${clientName}\n` +
    `📱 Telefone: ${clientPhone}\n\n` +
    `Gostaria de mais informações e agendar uma visita. Aguardo seu contato!`
  );
}

export default function ContactSidebar({ code, price, condo, iptu, onScheduleVisit, propertyTitle }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});

  const openModal = () => {
    setForm({ name: "", phone: "" });
    setErrors({});
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsSuccess(false), 300);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Informe seu nome";
    if (!form.phone.trim()) next.phone = "Informe seu telefone";
    return next;
  };

  const handleConfirm = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const message = buildWhatsAppMessage({
      propertyTitle: propertyTitle || "Imóvel",
      propertyCode: code,
      propertyPrice: price,
      clientName: form.name.trim(),
      clientPhone: form.phone.trim(),
    });

    window.open(
      `https://wa.me/${VALDINEI_PHONE}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );

    setIsSuccess(true);
  };

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <aside className={styles.sidebarInner}>
        <div className={styles.agentCard}>
          <img
            className={styles.agentPhoto}
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
            alt="Valdinei Souza"
          />
          <div className={styles.agentMeta}>
            <div className={styles.agentName}>Valdinei Souza</div>
            <div className={styles.agentRole}>Corretor Responsável · CRECI 9720-J</div>
          </div>
        </div>

        <div className={styles.priceWrap}>
          <div className={styles.priceLabel}>Valor</div>
          <div className={styles.priceValue}>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>{price.toLocaleString("pt-BR")}</span>
          </div>
          <div className={styles.code}>Código: {code}</div>
        </div>

        {(condo > 0 || iptu > 0) && (
          <div className={styles.taxes}>
            {condo > 0 && (
              <div>Condomínio: {condo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            )}
            {iptu > 0 && (
              <div>IPTU: {iptu.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            )}
          </div>
        )}

        <div className={styles.cta}>
          <button type="button" className={styles.whatsappBtn} onClick={openModal}>
            <MessageCircle size={20} />
            <span>Quero esse imóvel</span>
          </button>
          <button type="button" className={styles.visitBtn} onClick={onScheduleVisit}>
            Agendar Visita
          </button>
        </div>
      </aside>

      {isModalOpen && createPortal(
        <div
          className={styles.modalOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className={styles.modalBox} role="dialog" aria-modal="true">
            <button className={styles.modalClose} onClick={closeModal} aria-label="Fechar">
              <X size={18} />
            </button>

            {isSuccess ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckCircle2 size={32} />
                </div>
                <h3>Mensagem enviada!</h3>
                <p>
                  O Valdinei já recebeu sua solicitação pelo WhatsApp e entrará em contato em breve.
                </p>
                <button className={styles.whatsappBtn} onClick={closeModal}>
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalBadge}>
                    <MessageCircle size={16} />
                    <span>Contato via WhatsApp</span>
                  </div>
                  <h3 className={styles.modalTitle}>Interessado neste imóvel?</h3>
                  <p className={styles.modalSubtitle}>
                    Preencha seus dados e o Valdinei receberá sua mensagem diretamente no WhatsApp dele com os detalhes do imóvel.
                  </p>
                </div>

                <div className={styles.propertyPreview}>
                  <span className={styles.previewLabel}>Imóvel selecionado</span>
                  <strong className={styles.previewTitle}>{propertyTitle}</strong>
                  <span className={styles.previewCode}>Código: {code}</span>
                </div>

                <div className={styles.formFields}>
                  <label className={styles.fieldWrap}>
                    <span className={styles.fieldLabel}>
                      <User size={14} />
                      Seu nome
                    </span>
                    <input
                      className={`${styles.fieldInput} ${errors.name ? styles.fieldInputError : ""}`}
                      type="text"
                      placeholder="Como você se chama?"
                      value={form.name}
                      onChange={updateField("name")}
                    />
                    {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                  </label>

                  <label className={styles.fieldWrap}>
                    <span className={styles.fieldLabel}>
                      <Phone size={14} />
                      Seu telefone (WhatsApp)
                    </span>
                    <input
                      className={`${styles.fieldInput} ${errors.phone ? styles.fieldInputError : ""}`}
                      type="tel"
                      placeholder="(41) 9XXXX-XXXX"
                      value={form.phone}
                      onChange={updateField("phone")}
                    />
                    {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.whatsappBtn} onClick={handleConfirm}>
                    <MessageCircle size={18} />
                    <span>Confirmar e enviar no WhatsApp</span>
                  </button>
                  <p className={styles.modalDisclaimer}>
                    Você será redirecionado para o WhatsApp com a mensagem já preenchida.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}