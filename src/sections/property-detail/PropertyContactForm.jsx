import React, { useState } from "react";
import Input from "@components/ui/Input/Input";
import Button from "@components/ui/Button/Button.jsx";
import inputStyles from "@components/ui/Input/Input.module.css";
import styles from "./PropertyContactForm.module.css";

export default function PropertyContactForm({ property }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Olá, tenho interesse no imóvel ${property?.title || ""}. Gostaria de mais informações.`);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, phone, message, propertyId: property?.id });
    alert("Mensagem enviada (simulada). Obrigado!");
  };

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Ficou interessado no {property?.title}?</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email" />
          <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(41) 9XXXX-XXXX" />

          <label className={`${inputStyles.field} ${styles.textareaLabel}`.trim()}>
            <span className={inputStyles.label}>Mensagem</span>
            <div className={inputStyles.control}>
              <textarea className={inputStyles.input} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </label>

          <div className={styles.actions}>
            <Button variant="primary">Enviar</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
