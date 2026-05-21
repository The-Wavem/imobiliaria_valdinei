import { useState } from "react";
import { Mail, MessageSquareText, Phone, Send, UserRound, MessageCircle } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import styles from "./Contato.module.css";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContatoSection() {
  const [formData, setFormData] = useState(initialFormState);

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;

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
    <section className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Contato</p>
          <h2 className={styles.heroTitle}>
            Fale <span>Conosco</span>
          </h2>
          <p className={styles.heroText}>
            Estamos prontos para entender e atender suas necessidades. Entre em contato conosco hoje mesmo.
          </p>
        </div>
      </header>

      <div className={styles.contentWrap}>
        <div className={styles.container}>
          <div className={styles.infoColumn}>
            <div>
              <h2 className={styles.sectionTitle}>
                Informações de <span>Contato</span>
              </h2>

              <p className={styles.sectionText}>
                Nossa equipe está à disposição para encontrar o imóvel perfeito para você ou gerenciar seu patrimônio imobiliário com total transparência.
              </p>
            </div>

            <div className={styles.contactCards}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <Phone size={26} />
                </div>

                <div>
                  <span className={styles.contactLabel}>Telefone</span>
                  <strong className={styles.contactValue}>(41) 99999-9999</strong>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <Mail size={26} />
                </div>

                <div>
                  <span className={styles.contactLabel}>E-mail</span>
                  <strong className={styles.contactValue}>contato@valdineisouza.com.br</strong>
                </div>
              </div>
            </div>

            <Button variant="primary" type="button" className={styles.whatsappButton}>
              <MessageCircle size={18} />
              Falar pelo WhatsApp
            </Button>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              Envie uma <span>Mensagem</span>
            </h2>

            <form className={styles.form} onSubmit={handleSubmit}>
              <Input
                icon={UserRound}
                label="Nome Completo"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleFieldChange("name")}
                type="text"
                className={styles.fullWidthField}
              />

              <div className={styles.inlineFields}>
                <Input
                  icon={Mail}
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleFieldChange("email")}
                  type="email"
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
                />
              </label>

              <Button variant="primary" type="submit" className={styles.submitButton}>
                <Send size={18} />
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}