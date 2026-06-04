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
} from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import { addLead } from "@services/leadService.js";
import { logWhatsAppClickAnalytics } from "@services/analyticsService.js";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;
    setFormData((currentData) => ({ ...currentData, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await addLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        origin: "Página de Contato",
        status: "Novo",
      });

      setFormData(initialFormState);
      setIsSuccess(true);

      // Esconde a mensagem de sucesso após 6 segundos
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setErrorMsg("Ops! Não conseguimos enviar sua mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <motion.div className={styles.contactCard} variants={itemVariants}>
                <div className={styles.contactIcon}>
                  <Phone size={26} />
                </div>
                <div>
                  <span className={styles.contactLabel}>Telefone</span>
                  <strong className={styles.contactValue}>(41) 99999-9999</strong>
                </div>
              </motion.div>

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

            {/* Banner de erro */}
            {errorMsg && (
              <motion.div
                className={styles.errorBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {errorMsg}
              </motion.div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Input
                icon={UserRound}
                label="Nome Completo"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleFieldChange("name")}
                type="text"
                className={styles.fullWidthField}
                required
              />

              <div className={styles.inlineFields}>
                <Input
                  icon={Mail}
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleFieldChange("email")}
                  type="email"
                  required
                />

                <Input
                  icon={Phone}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleFieldChange("phone")}
                  type="tel"
                />
              </div>

              <label className={styles.textField}>
                <span className={styles.fieldLabel}>Assunto</span>
                <div className={styles.textControl}>
                  <MessageSquareText size={16} />
                  <input
                    type="text"
                    placeholder="Ex: Dúvida sobre imóvel"
                    value={formData.subject}
                    onChange={handleFieldChange("subject")}
                  />
                </div>
              </label>

              <label className={styles.textField}>
                <span className={styles.fieldLabel}>Mensagem</span>
                <textarea
                  className={styles.textarea}
                  placeholder="Como podemos ajudar?"
                  rows="6"
                  value={formData.message}
                  onChange={handleFieldChange("message")}
                  required
                />
              </label>

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