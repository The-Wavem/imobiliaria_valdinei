import { useState } from "react";
import { Phone, Mail, UserRound, MessageSquareText } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import Select from "@components/ui/Select/Select.jsx";
import styles from "./Contact.module.css";

const initialFormState = {
  name: "",
  email: "",
  interest: "Comprar",
};

const interestOptions = [
  { value: "Comprar", label: "Comprar um imóvel" },
  { value: "Alugar", label: "Alugar um imóvel" },
  { value: "Vender", label: "Vender meu imóvel" },
];

export default function Contact() {
  const [formData, setFormData] = useState(initialFormState);

  const handleFieldChange = (field) => (event) => {
    const value = typeof event === "string" ? event : event?.target?.value;

    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Mensagem enviada com sucesso!");
    setFormData(initialFormState);
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

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldsGrid}>
              <Input
                icon={UserRound}
                label="Nome Completo"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleFieldChange("name")}
                type="text"
              />

              <Input
                icon={Mail}
                label="E-mail"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleFieldChange("email")}
                type="email"
              />
            </div>

            <Select
              icon={MessageSquareText}
              label="Qual o seu objetivo?"
              options={interestOptions}
              value={formData.interest}
              onChange={handleFieldChange("interest")}
            />

            <Button variant="primary" type="submit" className={styles.submitButton}>
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}