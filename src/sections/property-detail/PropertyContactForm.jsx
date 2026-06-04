import { useEffect, useMemo, useState } from "react";
import Input from "@components/ui/Input/Input";
import Button from "@components/ui/Button/Button.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
import inputStyles from "@components/ui/Input/Input.module.css";
import { addLead } from "@services/leadService.js";
import { logLeadSubmissionAnalytics } from "@/services/analyticsService.js";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    try {
      await addLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        propertyId: property?.id || "",
        propertyTitle: property?.title || "",
      });

      logLeadSubmissionAnalytics(property?.id, property?.title);

      setName("");
      setEmail("");
      setPhone("");
      setMessage(defaultMessage);
      setFeedbackType("success");
      setFeedback("Mensagem enviada com sucesso. Em breve entraremos em contato.");
    } catch (error) {
      console.error("Falha ao salvar lead:", error);
      setFeedbackType("error");
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

        <form className={styles.form} onSubmit={handleSubmit}>
          {feedback ? (
            <div
              className={`${styles.feedback} ${
                feedbackType === "success" ? styles.feedbackSuccess : styles.feedbackError
              }`}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </div>
          ) : null}

          <div className={styles.inputGrid}>
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={styles.field}
            />
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(41) 9XXXX-XXXX"
              className={styles.field}
            />
          </div>

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            type="email"
            className={styles.field}
          />

          <label
            className={`${inputStyles.field} ${styles.messageField}`.trim()}
          >
            <span className={inputStyles.label}>Mensagem</span>
            <div className={inputStyles.control}>
              <textarea
                className={styles.textarea}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </label>

          <div className={styles.actions}>
            <Button variant="primary" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? <Loader size={20} /> : null}
              <span>{isSubmitting ? "Enviando..." : "Enviar"}</span>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
