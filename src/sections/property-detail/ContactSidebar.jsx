import { useState } from "react";
import { MessageCircle, CheckCircle2, X, Phone, User, Loader2, MessageSquareText } from "lucide-react";
import { createPortal } from "react-dom";
import { addLead } from "@services/leadService";
import { logWhatsAppClickAnalytics } from "@services/analyticsService.js";
import { validateName, validatePhone, sanitizeFormData } from "@utils/validation.js";
import styles from "./ContactSidebar.module.css";
import logoImg from "../../assets/images/valdinei entre em contato.png"; 

const VALDINEI_PHONE = import.meta.env.VITE_VALDINEI_PHONE || "";

function buildWhatsAppMessage({ propertyTitle, propertyCode, propertyPrice, clientName, clientMessage, propertyLink }) {
  const price = propertyPrice ? Number(propertyPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : 'Sob consulta';
  const customMessage = clientMessage ? `\n\n💬 *Minha mensagem:*\n_${clientMessage}_` : '';
  
  return encodeURIComponent(
    `Olá Valdinei! 👋\n\n` +
    `Meu nome é *${clientName}* e fiquei muito interessado(a) no imóvel abaixo:\n\n` +
    `🏠 *${propertyTitle}*\n` +
    `📋 *Código:* ${propertyCode || 'N/A'}\n` +
    `💰 *Valor:* ${price}\n` +
    `🔗 *Link:* ${propertyLink}\n` +
    customMessage +
    `\n\nGostaria de receber mais informações ou agendar uma visita. Aguardo seu retorno!`
  );
}

export default function ContactSidebar({
  code,
  price,
  rentPrice,
  category,
  condo,
  iptu,
  onScheduleVisit,
  propertyTitle,
  propertyId,
  status,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});

  const openModal = () => {
    setForm({ name: "", phone: "", message: "" });
    setErrors({});
    setIsSuccess(false);
    setSaveError(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setSaveError(false);
    }, 300);
  };

  const validate = () => {
    const next = {};
    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);
    
    if (!form.name.trim()) {
      next.name = "Informe seu nome";
    } else if (nameError) {
      next.name = nameError;
    }

    if (!form.phone.trim()) {
      next.phone = "Informe seu WhatsApp";
    } else if (phoneError) {
      next.phone = phoneError;
    }
    
    return next;
  };

  const isFormEmpty = !form.name.trim() || !form.phone.trim();
  const isButtonDisabled = isSaving || isFormEmpty;

  const handleConfirm = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setSaveError(false);

    try {
      const cleanData = sanitizeFormData(form);

      await addLead({
        name: cleanData.name,
        phone: cleanData.phone,
        email: "",
        message: cleanData.message || "Interesse via botão de WhatsApp",
        origin: "Sidebar de Detalhes do Imóvel",
        propertyId: propertyId || "",
        propertyTitle: propertyTitle || "",
        propertyCode: code,
        status: "Novo",
        createdAt: new Date().toISOString()
      });

      const messageText = buildWhatsAppMessage({
        propertyTitle: propertyTitle || "Imóvel",
        propertyCode: code,
        propertyPrice: price,
        clientName: cleanData.name,
        clientMessage: cleanData.message,
        propertyLink: `https://valdineiimoveis.com.br/imoveis/${propertyId || ''}`,
      });

      logWhatsAppClickAnalytics(propertyTitle || "Imóvel", "sidebar_imovel");

      setTimeout(() => {
        window.open(
          `https://wa.me/${VALDINEI_PHONE}?text=${messageText}`,
          "_blank",
          "noopener,noreferrer"
        );
      }, 300);

      setIsSuccess(true);
      setForm({ name: "", phone: "", message: "" });
    } catch (error) {
      console.error("Falha ao salvar lead:", error);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field) => (e) => {
    let { value } = e.target;

    if (field === "phone") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 0) value = "";
      else if (numbers.length <= 2) value = `(${numbers}`;
      else if (numbers.length <= 6) value = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      else if (numbers.length <= 10) value = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      else value = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    if (field === "name" && value.length > 80) return;
    if (field === "message" && value.length > 500) return;

    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isButtonDisabled && e.target.tagName !== "TEXTAREA") {
      handleConfirm();
    }
  };

  return (
    <>
      <aside className={styles.sidebarInner}>
        <div className={styles.agentCard}>
          <img
            className={styles.agentPhoto}
            src={logoImg}
            alt="Valdinei Souza"
          />
          <div className={styles.agentMeta}>
            <div className={styles.agentName}>Valdinei Souza</div>
            <div className={styles.agentRole}>Corretor Responsável · CRECI F34715</div>
          </div>
        </div>

        <div className={styles.priceWrap}>
          {(category === "Venda e Aluguel" || category === "Ambos") ? (
            <>
              <div className={styles.priceLabel}>Valor de Venda</div>
              <div className={styles.priceValue}>
                <span className={styles.currency}>R$</span>
                <span className={styles.amount}>{price ? price.toLocaleString("pt-BR") : "---"}</span>
              </div>
              <div className={styles.priceLabel} style={{ marginTop: '0.75rem' }}>Valor de Aluguel</div>
              <div className={styles.priceValue}>
                <span className={styles.currency}>R$</span>
                <span className={styles.amount}>{rentPrice ? rentPrice.toLocaleString("pt-BR") : "---"}</span>
              </div>
            </>
          ) : category === "Alugar" ? (
            <>
              <div className={styles.priceLabel}>Valor de Aluguel</div>
              <div className={styles.priceValue}>
                <span className={styles.currency}>R$</span>
                <span className={styles.amount}>{rentPrice ? rentPrice.toLocaleString("pt-BR") : (price ? price.toLocaleString("pt-BR") : "---")}</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.priceLabel}>Valor de Venda</div>
              <div className={styles.priceValue}>
                <span className={styles.currency}>R$</span>
                <span className={styles.amount}>{price ? price.toLocaleString("pt-BR") : "---"}</span>
              </div>
            </>
          )}
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

        {(!status || status === "Disponível" || status === "Ativo") && (
          <div className={styles.cta}>
            <button 
              type="button" 
              className={`${styles.whatsappBtn} ${styles.whatsappBtnDesktop}`} 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const text = encodeURIComponent(`Olá Valdinei! Gostaria de mais informações sobre o imóvel: ${propertyTitle} (Cód: ${code}).\n\nLink: ${window.location.href}`);
                  window.open(`https://wa.me/55${VALDINEI_PHONE.replace(/\D/g, '')}?text=${text}`, "_blank", "noopener,noreferrer");
                  if (logWhatsAppClickAnalytics) logWhatsAppClickAnalytics();
                }
              }}
            >
              <MessageCircle size={20} />
              <span>Quero esse imóvel</span>
            </button>

            <button type="button" className={`${styles.visitBtn} ${styles.visitBtnDesktop}`} onClick={onScheduleVisit || openModal}>
              <span>Agendar Visita</span>
            </button>
          </div>
        )}
      </aside>

      {(!status || status === "Disponível" || status === "Ativo") && typeof window !== 'undefined' && createPortal(
        <div className={styles.mobileCtaContainer}>
          <a 
            href={`https://wa.me/55${VALDINEI_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá Valdinei! Gostaria de mais informações sobre o imóvel: ${propertyTitle} (Cód: ${code}).\n\nLink: ${window.location.href}`)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.whatsappBtnMobile}
            onClick={() => logWhatsAppClickAnalytics && logWhatsAppClickAnalytics()}
          >
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </a>

          <button type="button" className={styles.visitBtnMobile} onClick={openModal}>
            <span>Contatar</span>
          </button>
        </div>,
        document.body
      )}

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
                <h3>Tudo certo!</h3>
                <p>
                  Seu interesse foi registrado e o WhatsApp foi aberto com a mensagem pronta.
                  O Valdinei entrará em contato em breve.
                </p>
                <button className={styles.whatsappBtn} onClick={closeModal}>
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalBadge}>
                    <MessageCircle size={14} />
                    <span>Contato rápido via WhatsApp</span>
                  </div>
                  <h3 className={styles.modalTitle}>Falar com o corretor</h3>
                  <p className={styles.modalSubtitle}>
                    Preencha seus dados abaixo. Vamos abrir o WhatsApp com a mensagem já pronta e registrar seu interesse automaticamente.
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
                      <User size={13} />
                      Seu nome completo
                    </span>
                    <input
                      className={`${styles.fieldInput} ${errors.name ? styles.fieldInputError : ""}`}
                      type="text"
                      placeholder="Como você se chama?"
                      value={form.name}
                      onChange={updateField("name")}
                      onKeyDown={handleKeyDown}
                      disabled={isSaving}
                      autoFocus
                    />
                    {errors.name && (
                      <span className={styles.fieldError}>{errors.name}</span>
                    )}
                  </label>

                  <label className={styles.fieldWrap}>
                    <span className={styles.fieldLabel}>
                      <Phone size={13} />
                      Seu WhatsApp
                    </span>
                    <input
                      className={`${styles.fieldInput} ${errors.phone ? styles.fieldInputError : ""}`}
                      type="tel"
                      placeholder="(41) 9XXXX-XXXX"
                      value={form.phone}
                      onChange={updateField("phone")}
                      onKeyDown={handleKeyDown}
                      disabled={isSaving}
                    />
                    {errors.phone && (
                      <span className={styles.fieldError}>{errors.phone}</span>
                    )}
                  </label>
                  
                  <label className={styles.fieldWrap}>
                    <span className={styles.fieldLabel}>
                      <MessageSquareText size={13} />
                      Sua mensagem (opcional)
                    </span>
                    <textarea
                      className={styles.fieldTextarea}
                      placeholder="Quer deixar alguma dúvida registrada?"
                      value={form.message}
                      onChange={updateField("message")}
                      onKeyDown={handleKeyDown}
                      disabled={isSaving}
                      rows="3"
                    />
                  </label>
                </div>

                {saveError && (
                  <p className={styles.saveError}>
                    Não foi possível registrar seu contato. Tente novamente.
                  </p>
                )}

                <div className={styles.modalActions}>
                  <button
                    className={`${styles.whatsappBtn} ${isButtonDisabled ? styles.whatsappBtnDisabled : ""}`}
                    onClick={handleConfirm}
                    disabled={isButtonDisabled}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className={styles.spinIcon} />
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={18} />
                        <span>Falar com o Valdinei agora</span>
                      </>
                    )}
                  </button>
                  <p className={styles.modalDisclaimer}>
                    Seus dados ficam salvos com segurança e o Valdinei poderá entrar em contato com você.
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