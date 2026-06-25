import { useEffect, useMemo, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import Input from "@components/ui/Input/Input";
import Button from "@components/ui/Button/Button.jsx";
import inputStyles from "@components/ui/Input/Input.module.css";
import { addLead } from "@services/leadService.js";
import { incrementPropertyLead } from "@services/propertyService.js";
import { logLeadSubmissionAnalytics } from "@/services/analyticsService.js";
import { validateContactForm, sanitizeFormData } from "@utils/validation.js";
import styles from "./PropertyContactForm.module.css";

export default function PropertyContactForm({ property }) {
  const defaultMessage = useMemo(
    () => `Olá, tenho interesse no imóvel ${property?.title || ""}. Gostaria de mais informações.`,
    [property?.title],
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const isFormEmpty = !name.trim() || !email.trim() || !phone.trim();
  const isButtonDisabled = isSubmitting || isFormEmpty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
    
    // Validate fields using validation.js
    const formErrors = validateContactForm({
      name,
      email,
      phone,
      message,
      subject: "" // Not used here, but required by validateContactForm schema
    });

    // Filter out null/undefined errors
    const activeErrors = Object.fromEntries(
      Object.entries(formErrors).filter(([_, v]) => v != null)
    );

    if (Object.keys(activeErrors).length > 0) {
      setErrors(activeErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Sanitize the inputs before sending
      const cleanData = sanitizeFormData({ name, email, phone, message });

      await addLead({
        name: cleanData.name,
        email: cleanData.email,
        phone: cleanData.phone,
        message: cleanData.message,
        origin: "Página de Detalhes do Imóvel",
        propertyId: property?.id || "",
        propertyTitle: property?.title || "",
        status: "Novo",
        createdAt: new Date().toISOString(),
      });

      logLeadSubmissionAnalytics(property?.id, property?.title);

      // Incrementa o leadCount do imóvel para o Wavem Rank 2.0 (Silenciosamente)
      try {
        if (property?.id) incrementPropertyLead(property.id);
      } catch (e) {
        // Ignora erros para não quebrar a UI
      }

      setIsSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage(defaultMessage);
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Falha ao salvar lead:", error);
      setFeedback("Não foi possível enviar sua mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>Ficou interessado no {property?.title}?</h2>
          <p className={styles.subtitle}>
            Preencha os dados abaixo e o Valdinei entrará em contato rapidamente.
          </p>
        </div>

        {isSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={40} />
            </div>
            <h3 className={styles.successTitle}>Interesse enviado!</h3>
            <p className={styles.successText}>
              Entraremos em contato sobre este imóvel em breve.
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {feedback && (
              <div className={styles.feedbackError} role="status" aria-live="polite">
                {feedback}
              </div>
            )}

            <div className={styles.inputGrid}>
              <div className={styles.fieldWrapper}>
                <Input
                  label="Nome"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                  }}
                  placeholder="Seu nome"
                  className={`${styles.field} ${errors.name ? styles.inputError : ""}`}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.fieldWrapper}>
                <Input
                  label="Telefone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError("phone");
                  }}
                  placeholder="(41) 9XXXX-XXXX"
                  type="tel"
                  className={`${styles.field} ${errors.phone ? styles.inputError : ""}`}
                />
                {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
              </div>
            </div>

            <div className={styles.fieldWrapper}>
              <Input
                label="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                placeholder="seu@email.com"
                type="email"
                className={`${styles.field} ${errors.email ? styles.inputError : ""}`}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.fieldWrapper}>
              <label
                className={`${inputStyles.field} ${styles.messageField} ${errors.message ? styles.inputError : ""}`.trim()}
              >
                <span className={inputStyles.label}>Mensagem</span>
                <div className={inputStyles.control}>
                  <textarea
                    className={styles.textarea}
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearFieldError("message");
                    }}
                  />
                </div>
              </label>
              {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
            </div>

            <div className={styles.actions}>
              <Button 
                variant="primary" 
                className={styles.submitButton} 
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
