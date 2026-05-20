import React, { useState } from "react";
import Input from "@components/ui/Input/Input";
import Button from "@components/ui/Button/Button.jsx";
import inputStyles from "@components/ui/Input/Input.module.css";
import styles from "./PropertyContactForm.module.css";

export default function PropertyContactForm({ property }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Olá, tenho interesse no imóvel ${property?.title || ""}. Gostaria de mais informações.`,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, phone, message, propertyId: property?.id });
    alert("Mensagem enviada (simulada). Obrigado!");
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
            <Button variant="primary" className={styles.submitButton}>
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
