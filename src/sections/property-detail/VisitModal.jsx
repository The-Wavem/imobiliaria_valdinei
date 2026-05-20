import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input";
import Select from "@components/ui/Select/Select";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./VisitModal.module.css";

const initialFormState = {
  name: "",
  phone: "",
  email: "",
  date: "",
  period: "",
};

const periodOptions = [
  { value: "", label: "Selecione..." },
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export default function VisitModal({ isOpen, onClose, propertyName }) {
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setForm(initialFormState);
    setIsSubmitting(false);
    setIsSuccess(false);

    return undefined;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateField = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    timeoutRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} >
      <div className={styles.wrapper}>
        {isSuccess ? (
          <div className={styles.successPanel} aria-live="polite">
            <div className={styles.successIcon}>
              <CheckCircle2 size={28} />
            </div>
            <h3 className={styles.successTitle}>Solicitação enviada com sucesso!</h3>
            <p className={styles.successText}>
              Em breve o Valdinei confirmará seu horário.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.heroCard}>
              <span className={styles.eyebrow}>Intenção de visita</span>
              <p className={styles.propertyName}>{propertyName || "Imóvel selecionado"}</p>
              <p className={styles.subtitle}>
                Sugira uma data e o corretor Valdinei entrará em contato para confirmar.
              </p>
            </div>

            <div className={styles.formPanel}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.grid}>
                  <Input
                    label="Nome Completo"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Seu nome completo"
                    className={styles.field}
                  />
                  <Input
                    label="Telefone (WhatsApp)"
                    value={form.phone}
                    onChange={updateField("phone")}
                    placeholder="(41) 9XXXX-XXXX"
                    className={styles.field}
                  />
                  <Input
                    label="E-mail"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="seu@email.com"
                    type="email"
                    className={styles.fullWidth}
                  />
                  <Input
                    label="Data Desejada"
                    value={form.date}
                    onChange={updateField("date")}
                    type="date"
                    className={styles.field}
                  />
                  <Select
                    label="Período Preferencial"
                    options={periodOptions}
                    value={form.period}
                    onChange={updateField("period")}
                    className={styles.field}
                  />
                </div>

                <Button type="submit" variant="primary" className={styles.submitButton}>
                  {isSubmitting ? "Enviando..." : "Solicitar intenção de visita"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
