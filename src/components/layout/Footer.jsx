import { NavLink } from "react-router-dom";
import logoImg from "../../assets/images/logo.png";
import styles from "./Footer.module.css";

const quickLinks = [
  { label: "Imóveis em Destaque", to: "/#destaques" },
  { label: "Sobre a Empresa", to: "/#sobre-nos" },
  { label: "Nossos Serviços", to: "/#servicos" },
  { label: "Fale Conosco", to: "/contato" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandColumn}>
          <img
            src={logoImg}
            alt="Logo Valdinei Souza"
            className={styles.brandMark}
            width="151"
            height="151"
            loading="lazy"
          />
          <p>
            Sua imobiliária de confiança em Curitiba. Encontrando o lar ideal
            com transparência e agilidade.
          </p>
        </div>

        <div>
          <h2 className={styles.title}>Links Rápidos</h2>
          <ul className={styles.linkList}>
            {quickLinks.map((link) => (
              <li key={link.label}>
                <NavLink className={styles.link} to={link.to}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={styles.title}>Localização</h2>
          <address className={styles.address}>
            Rua XV de Novembro, 456 - Centro
            <br />
            Curitiba - PR, 80020-310
            <br />
            <br />
            (41) 99999-9999
            <br />
            contato@valdineisouza.com.br
          </address>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>
          © 2026 Valdinei Souza Imóveis para Todos. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
