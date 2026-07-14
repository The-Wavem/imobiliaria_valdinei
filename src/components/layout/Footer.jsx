import { NavLink } from "react-router-dom";
import logoImg from "../../assets/images/logo.png";
import styles from "./Footer.module.css";

const quickLinks = [
  { label: "Início", to: "/" },
  { label: "Alugar", to: "/alugar" },
  { label: "Comprar", to: "/comprar" },
  { label: "Sobre Nós", to: "/sobre-nos" },
  { label: "Serviços", to: "/servicos" },
  { label: "Contato", to: "/contato" },
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
          <h2 className={styles.title}>Contato</h2>
          <address className={styles.address}>
            (41) 98859-1433
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
        <p style={{ marginTop: "12px" }}>
          Feito pela{" "}
          <a
            href="https://thewavem.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            style={{ fontWeight: "bold" }}
          >
            Wavem
          </a>
        </p>
      </div>
    </footer>
  );
}
