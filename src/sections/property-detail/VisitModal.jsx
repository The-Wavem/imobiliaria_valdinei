import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import Modal from "@components/ui/Modal/Modal.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./VisitModal.module.css";
import { addLead } from "../../services/leadService";

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

export default function VisitModal({ isOpen, onClose, property }) {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'

  useEffect(() => {
    if (!isOpen) {
      setForm(initialFormState);
      setStatus("idle");
    }
  }, [isOpen]);

  const updateField = (field) => (eventOrValue) => {
    const value = eventOrValue?.target
      ? eventOrValue.target.value
      : eventOrValue;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === "submitting") return;
    setStatus("submitting");

    try {
      const propertyTitle =
        property?.title || property?.content?.summary || "Imóvel selecionado";

      const visitMessage = `Olá, Valdinei! Gostaria de agendar uma visita para o imóvel "${propertyTitle}" no dia ${form.date} no período da ${form.period}.`;

      await addLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: visitMessage,
        propertyId: property?.id || "Sem ID",
        propertyTitle: propertyTitle,
        propertyCode: property?.code || "Sem código",
        source: "Modal de Visita do Site",
        visitDate: form.date,
        visitPeriod: form.period,
      });

      const numeroValdinei = import.meta.env.VALDINEI_PHONE;

      const textoWhatsApp =
        `*Nova Solicitação de Visita!* 🏠\n\n` +
        `*Cliente:* ${form.name}\n` +
        `*Imóvel:* ${propertyTitle} (Cód: ${property?.code || "S/N"})\n` +
        `*Data sugerida:* ${form.date}\n` +
        `*Período:* ${form.period}\n\n` +
        `Gostaria de confirmar este agendamento!`;

      const urlEncodedText = encodeURIComponent(textoWhatsApp);

      setStatus("success");

      setTimeout(() => {
        window.open(
          `https://wa.me/${numeroValdinei}?text=${urlEncodedText}`,
          "_blank",
        );
      }, 800);
    } catch (error) {
      console.error("Erro ao enviar Lead da Visita:", error);
      setStatus("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.wrapper}>
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <CheckCircle
              size={48}
              color="var(--color-brand-primary)"
              style={{ margin: "0 auto 1rem" }}
            />
            <h3>Solicitação enviada com sucesso!</h3>
            <p>
              O Valdinei já recebeu seu contato e as informações da visita. Ele
              retornará em breve para confirmar.
            </p>
            <Button
              variant="primary"
              onClick={onClose} // Fecha o modal elegantemente
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
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.grid}>
                  <Input
                    label="Nome Completo"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Seu nome completo"
                    className={styles.field}
                    required
                  />
                  <Input
                    label="Telefone (WhatsApp)"
                    value={form.phone}
                    onChange={updateField("phone")}
                    placeholder="(41) 9XXXX-XXXX"
                    className={styles.field}
                    required
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
                    required
                  />
                  <Select
                    label="Período Preferencial"
                    options={periodOptions}
                    value={form.period}
                    onChange={updateField("period")}
                    className={styles.field}
                    required
                  />
                </div>

                {status === "error" && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.875rem",
                      marginTop: "1rem",
                    }}
                  >
                    Ocorreu um erro ao enviar. Tente novamente mais tarde.
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className={styles.submitButton}
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? "Enviando..."
                    : "Solicitar intenção de visita"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
