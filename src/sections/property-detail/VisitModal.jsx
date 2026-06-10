import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import Button from "@components/ui/Button/Button.jsx";
import inputStyles from "@components/ui/Input/Input.module.css";
import styles from "./VisitModal.module.css";
import { addLead } from "../../services/leadService";
import { validateName, validateEmail, validatePhone, validateMessage, sanitizeFormData } from "../../utils/validation";

const initialFormState = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  message: "",
};

const periodOptions = [
  { value: "", label: "Selecione..." },
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export default function VisitModal({ isOpen, onClose, property }) {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setForm(initialFormState);
      setStatus("idle");
      setErrors({});
    }
  }, [isOpen]);

  const updateField = (field) => (eventOrValue) => {
    const value = eventOrValue?.target
      ? eventOrValue.target.value
      : eventOrValue;
    
    setForm((current) => ({ ...current, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const isFormEmpty = !form.name.trim() || !form.phone.trim() || !form.date.trim() || !form.time.trim();
  const isButtonDisabled = status === "submitting" || isFormEmpty;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === "submitting") return;
    
    // Custom Validation 
    const nextErrors = {};
    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);
    // E-mail e Mensagem são opcionais no agendamento se não informados? A requisição original falava "se e-mail for válido", vou assumir que se preencher deve ser válido.
    const emailError = form.email.trim() ? validateEmail(form.email) : null;
    const messageError = form.message.trim() ? validateMessage(form.message) : null;

    if (!form.name.trim()) nextErrors.name = "Informe seu nome.";
    else if (nameError) nextErrors.name = nameError;

    if (!form.phone.trim()) nextErrors.phone = "Informe seu WhatsApp.";
    else if (phoneError) nextErrors.phone = phoneError;

    if (emailError) nextErrors.email = emailError;
    if (messageError) nextErrors.message = messageError;

    if (!form.date) nextErrors.date = "Selecione uma data.";
    if (!form.time) nextErrors.time = "Selecione um período.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setStatus("submitting");
    setErrors({});

    try {
      const propertyTitle = property?.title || property?.content?.summary || "Imóvel selecionado";
      const cleanData = sanitizeFormData(form);

      const visitMessage = cleanData.message || `Gostaria de agendar uma visita para o imóvel "${propertyTitle}" no dia ${cleanData.date} no período da ${cleanData.time}.`;

      await addLead({
        name: cleanData.name,
        phone: cleanData.phone,
        email: cleanData.email,
        message: visitMessage,
        dateRequested: cleanData.date,
        timeRequested: cleanData.time,
        origin: "Agendamento de Visita",
        propertyId: property?.id || "",
        propertyTitle: propertyTitle,
        propertyCode: property?.code || "",
        status: "Novo",
        createdAt: new Date().toISOString()
      });

      setStatus("success");
      
      setTimeout(() => {
        if (isOpen) {
          onClose();
        }
      }, 5000);
      
    } catch (error) {
      console.error("Erro ao enviar Lead da Visita:", error);
      setStatus("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.wrapper}>
        {status === "success" ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={40} />
            </div>
            <h3 className={styles.successTitle}>Sua visita foi pré-agendada!</h3>
            <p className={styles.successText}>
              Nossa equipe entrará em contato para confirmar o horário e passar as orientações.
            </p>
            <Button
              variant="primary"
              onClick={onClose}
              style={{ marginTop: "1.5rem" }}
            >
              Concluir
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.heroCard}>
              <span className={styles.eyebrow}>Intenção de visita</span>
              <p className={styles.propertyName}>
                {property?.title ||
                  property?.content?.summary ||
                  "Imóvel selecionado"}
              </p>
              <p className={styles.subtitle}>
                Sugira uma data e o corretor Valdinei entrará em contato para
                confirmar.
              </p>
            </div>

            <div className={styles.formPanel}>
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.grid}>
                  <div className={styles.fieldWrapper}>
                    <Input
                      label="Nome Completo *"
                      value={form.name}
                      onChange={updateField("name")}
                      placeholder="Seu nome"
                      className={`${styles.field} ${errors.name ? styles.inputError : ""}`}
                    />
                    {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                  </div>
                  
                  <div className={styles.fieldWrapper}>
                    <Input
                      label="Telefone (WhatsApp) *"
                      value={form.phone}
                      onChange={updateField("phone")}
                      placeholder="(41) 9XXXX-XXXX"
                      type="tel"
                      className={`${styles.field} ${errors.phone ? styles.inputError : ""}`}
                    />
                    {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                  </div>
                  
                  <div className={`${styles.fieldWrapper} ${styles.fullWidth}`}>
                    <Input
                      label="E-mail"
                      value={form.email}
                      onChange={updateField("email")}
                      placeholder="seu@email.com"
                      type="email"
                      className={`${styles.fullWidth} ${errors.email ? styles.inputError : ""}`}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                  </div>
                  
                  <div className={styles.fieldWrapper}>
                    <Input
                      label="Data Desejada *"
                      value={form.date}
                      onChange={updateField("date")}
                      type="date"
                      className={`${styles.field} ${errors.date ? styles.inputError : ""}`}
                    />
                    {errors.date && <span className={styles.fieldError}>{errors.date}</span>}
                  </div>
                  
                  <div className={styles.fieldWrapper}>
                    <Select
                      label="Período Preferencial *"
                      options={periodOptions}
                      value={form.time}
                      onChange={updateField("time")}
                      className={`${styles.field} ${errors.time ? styles.inputError : ""}`}
                    />
                    {errors.time && <span className={styles.fieldError}>{errors.time}</span>}
                  </div>
                </div>

                <div className={styles.fieldWrapper}>
                  <label className={`${inputStyles.field} ${styles.messageField} ${errors.message ? styles.inputError : ""}`.trim()}>
                    <span className={inputStyles.label}>Mensagem Adicional</span>
                    <div className={inputStyles.control}>
                      <textarea
                        className={styles.textarea}
                        rows={3}
                        placeholder="Alguma dúvida ou observação?"
                        value={form.message}
                        onChange={updateField("message")}
                        maxLength={500}
                      />
                    </div>
                  </label>
                  {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
                </div>

                {status === "error" && (
                  <div className={styles.feedbackError}>
                    Ocorreu um erro ao enviar. Tente novamente mais tarde.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className={styles.submitButton}
                  disabled={isButtonDisabled}
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Enviando...
                    </>
                  ) : (
                    "Solicitar intenção de visita"
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
