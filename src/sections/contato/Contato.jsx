import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
  MessageCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import { addLead } from "@services/leadService.js";
import { logWhatsAppClickAnalytics } from "@services/analyticsService.js";
import {
  validateContactForm,
  sanitizeFormData,
  FIELD_LIMITS,
} from "@utils/validation.js";
import styles from "./Contato.module.css";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

// Variantes de animação encadeada
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ContatoSection() {
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Marca o campo como "tocado" ao sair dele (onBlur) e valida imediatamente
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateContactForm(formData);
    setFieldErrors(errors);
  };

  const handleFieldChange = (field) => (event) => {
    let { value } = event.target;

    if (field === "phone") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 0) value = "";
      else if (numbers.length <= 2) value = `(${numbers}`;
      else if (numbers.length <= 6) value = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      else if (numbers.length <= 10) value = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      else value = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    // Respeita o limite máximo de caracteres sem deixar digitar além
    const limit = FIELD_LIMITS[field]?.max;
    if (field !== "phone" && limit && value.length > limit) return;

    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Só revalida em tempo real se o campo já foi tocado
    if (touched[field]) {
      setFieldErrors(validateContactForm(updated));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    // Marca todos os campos como tocados e valida de uma vez
    const allTouched = Object.fromEntries(Object.keys(formData).map((k) => [k, true]));
    setTouched(allTouched);

    const errors = validateContactForm(formData);
    setFieldErrors(errors);

    // Bloqueia o envio se houver qualquer erro
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const clean = sanitizeFormData(formData);

      await addLead({
        name: clean.name,
        email: clean.email,
        phone: clean.phone,
        subject: clean.subject,
        message: clean.message,
        origin: "Página de Contato",
        status: "Novo",
      });

      setFormData(initialFormState);
      setFieldErrors({});
      setTouched({});
      setIsSuccess(true);

      setTimeout(() => setIsSuccess(false), 6000);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setErrorMsg("Ops! Não conseguimos enviar sua mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: retorna a classe de erro para campos nativos (assunto/mensagem)
  const fieldClass = (field) =>
    touched[field] && fieldErrors[field] ? styles.fieldHasError : "";

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={styles.heroEyebrow}>Contato</p>
          <h2 className={styles.heroTitle}>
            Fale <span>Conosco</span>
          </h2>
          <p className={styles.heroText}>
            Estamos prontos para entender e atender suas necessidades. Entre em contato conosco hoje mesmo.
          </p>
        </motion.div>
      </header>

      <div className={styles.contentWrap}>
        <motion.div
          className={styles.container}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Coluna de informações */}
          <motion.div className={styles.infoColumn} variants={itemVariants}>
            <div>
              <h2 className={styles.sectionTitle}>
                Informações de <span>Contato</span>
              </h2>
              <p className={styles.sectionText}>
                Nossa equipe está à disposição para encontrar o imóvel perfeito para você ou gerenciar
                seu patrimônio imobiliário com total transparência.
              </p>
            </div>

            <div className={styles.contactCards}>
              <a href="https://wa.me/5541988591433" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.pulse}`}>
                <div className={styles.contactIcon}>
                  <Phone size={26} />
                </div>
                <div>
                  <span className={styles.contactLabel}>Telefone</span>
                  <strong className={styles.contactValue}>(41) 98859-1433</strong>
                </div>
              </a>

              <motion.div className={styles.contactCard} variants={itemVariants}>
                <div className={styles.contactIcon}>
                  <Mail size={26} />
                </div>
                <div>
                  <span className={styles.contactLabel}>E-mail</span>
                  <strong className={styles.contactValue}>contato@valdineisouza.com.br</strong>
                </div>
              </motion.div>
            </div>

            <Button
              variant="primary"
              type="button"
              className={styles.whatsappButton}
              onClick={() => logWhatsAppClickAnalytics("Contato Geral", "pagina_contato")}
            >
              <MessageCircle size={18} />
              Falar pelo WhatsApp
            </Button>
          </motion.div>

          {/* Card do formulário */}
          <motion.div className={styles.formCard} variants={itemVariants}>
            <h2 className={styles.formTitle}>
              Envie uma <span>Mensagem</span>
            </h2>

            {/* Banner de sucesso */}
            {isSuccess && (
              <motion.div
                className={styles.successBanner}
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <CheckCircle2 size={20} />
                Sua mensagem foi enviada! Entraremos em contato em breve.
              </motion.div>
            )}

            {/* Banner de erro de envio */}
            {errorMsg && (
              <motion.div
                className={styles.errorBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={18} />
                {errorMsg}
              </motion.div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {/* NOME */}
              <div className={styles.fieldGroup}>
                <Input
                  icon={UserRound}
                  label="Nome Completo"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleFieldChange("name")}
                  onBlur={handleBlur("name")}
                  type="text"
                  className={`${styles.fullWidthField} ${touched.name && fieldErrors.name ? styles.inputError : ""}`}
                />
                {touched.name && fieldErrors.name && (
                  <span className={styles.fieldError}>{fieldErrors.name}</span>
                )}
              </div>

              {/* E-MAIL + TELEFONE */}
              <div className={styles.inlineFields}>
                <div className={styles.fieldGroup}>
                  <Input
                    icon={Mail}
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleFieldChange("email")}
                    onBlur={handleBlur("email")}
                    type="email"
                    className={touched.email && fieldErrors.email ? styles.inputError : ""}
                  />
                  {touched.email && fieldErrors.email && (
                    <span className={styles.fieldError}>{fieldErrors.email}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <Input
                    icon={Phone}
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleFieldChange("phone")}
                    onBlur={handleBlur("phone")}
                    type="tel"
                    className={touched.phone && fieldErrors.phone ? styles.inputError : ""}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <span className={styles.fieldError}>{fieldErrors.phone}</span>
                  )}
                </div>
              </div>

              {/* ASSUNTO */}
              <div className={styles.fieldGroup}>
                <label className={`${styles.textField} ${fieldClass("subject")}`}>
                  <span className={styles.fieldLabel}>Assunto</span>
                  <div className={styles.textControl}>
                    <MessageSquareText size={16} />
                    <input
                      type="text"
                      placeholder="Ex: Dúvida sobre imóvel"
                      value={formData.subject}
                      onChange={handleFieldChange("subject")}
                      onBlur={handleBlur("subject")}
                      maxLength={FIELD_LIMITS.subject.max}
                    />
                  </div>
                </label>
                {touched.subject && fieldErrors.subject && (
                  <span className={styles.fieldError}>{fieldErrors.subject}</span>
                )}
              </div>

              {/* MENSAGEM */}
              <div className={styles.fieldGroup}>
                <label className={styles.textField}>
                  <span className={styles.fieldLabel}>
                    Mensagem
                    <span className={`${styles.charCount} ${formData.message.length > FIELD_LIMITS.message.max * 0.85 ? styles.charCountWarn : ""}`}>
                      {" "}{formData.message.length}/{FIELD_LIMITS.message.max}
                    </span>
                  </span>
                  <textarea
                    className={`${styles.textarea} ${fieldClass("message")}`}
                    placeholder="Como podemos ajudar?"
                    rows="6"
                    value={formData.message}
                    onChange={handleFieldChange("message")}
                    onBlur={handleBlur("message")}
                    maxLength={FIELD_LIMITS.message.max}
                  />
                </label>
                {touched.message && fieldErrors.message && (
                  <span className={styles.fieldError}>{fieldErrors.message}</span>
                )}
              </div>

              <Button
                variant="primary"
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={18} className={styles.spinner} />
                ) : (
                  <Send size={18} />
                )}
                {isLoading ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}