import { useState } from "react";
import { Phone, Mail, UserRound, MessageSquareText, Loader2, CheckCircle2 } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import { addLead } from "@services/leadService.js";
import { validateContactForm, sanitizeFormData } from "@utils/validation.js";
import styles from "./Contact.module.css";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFieldChange = (field) => (event) => {
    const value = typeof event === "string" ? event : event?.target?.value;

    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    // Clean field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare data for validation
    const formErrors = validateContactForm({
      ...formData,
      subject: "", // Optional field required by validation.js
    });

    // Remove null or undefined errors
    const activeErrors = Object.fromEntries(
      Object.entries(formErrors).filter(([_, v]) => v != null)
    );

    if (Object.keys(activeErrors).length > 0) {
      setErrors(activeErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const cleanData = sanitizeFormData(formData);

      await addLead({
        name: cleanData.name,
        email: cleanData.email,
        phone: cleanData.phone,
        message: cleanData.message,
        origin: "Página Home - Seção Contato",
        status: "Novo",
        createdAt: new Date().toISOString(),
      });

      setIsSuccess(true);
      setFormData(initialFormState);

      // Dismiss the success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setErrors({ form: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.info}>
          <h2>Fale Conosco</h2>
          <p>
            Queremos ajudar você a encontrar o lugar que você chamará de lar.
            Nossa equipe é treinada para oferecer o melhor atendimento,
            independente do seu orçamento.
          </p>

          <div className={styles.phoneCard}>
            <div className={styles.phoneIcon}>
              <Phone size={24} />
            </div>

            <div>
              <p className={styles.phoneLabel}>Atendimento via WhatsApp</p>
              <p className={styles.phoneNumber}>(41) 99999-9999</p>
            </div>
          </div>
        </div>

        <div className={styles.formCard}>
          <h3>
            <Mail size={22} />
            Envie sua dúvida
          </h3>

          {isSuccess ? (
            <div className={styles.successMessage}>
              <CheckCircle2 size={48} className={styles.successIcon} />
              <h4>Sua mensagem foi enviada com sucesso!</h4>
              <p>Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldWrapper}>
                  <Input
                    icon={UserRound}
                    label="Nome Completo"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleFieldChange("name")}
                    type="text"
                    className={errors.name ? styles.inputError : ""}
                  />
                  {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>

                <div className={styles.fieldWrapper}>
                  <Input
                    icon={Mail}
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleFieldChange("email")}
                    type="email"
                    className={errors.email ? styles.inputError : ""}
                  />
                  {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.fieldWrapper}>
                <Input
                  icon={Phone}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleFieldChange("phone")}
                  type="tel"
                  className={errors.phone ? styles.inputError : ""}
                />
                {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
              </div>

              <div className={styles.fieldWrapper}>
                <label className={styles.textField}>
                  <span className={styles.fieldLabel}>Mensagem</span>
                  <div className={styles.textControl}>
                    <MessageSquareText size={16} className={styles.textareaIcon} />
                    <textarea
                      className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                      placeholder="Como podemos ajudar?"
                      rows="4"
                      value={formData.message}
                      onChange={handleFieldChange("message")}
                    />
                  </div>
                </label>
                {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
              </div>

              {errors.form && <div className={styles.formError}>{errors.form}</div>}

              <Button
                variant="primary"
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensagem"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}