import { Heart, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useFavorites } from "@hooks/useFavorites";
import { useState } from "react";
import logoImg from "../../assets/images/logo.png";
import styles from "./Navbar.module.css";

const navigationItems = [
  { label: "Início", to: "/" },
  { label: "Alugar", to: "/alugar" },
  { label: "Comprar", to: "/comprar" },
  { label: "Sobre Nós", to: "/sobre" },
  { label: "Serviços", to: "/servicos" },
  { label: "Contato", to: "/contato" },
];

export default function Navbar() {
  const { favorites } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink
          to="/"
          className={styles.brand}
        >
          <img
            src={logoImg}
            alt="Logo Valdinei Souza"
            className={styles.logo_navbar}
            width="151"
            height="151"
          />
        </NavLink>

        <nav className={styles.nav} aria-label="Navegação principal">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`.trim()
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <NavLink
            to="/favorito"
            className={styles.iconButton}
            aria-label="Ver favoritos"
          >
            <Heart size={18} />
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </NavLink>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div 
            className={styles.mobileOverlay} 
            onClick={() => setIsMenuOpen(false)} 
            aria-hidden="true"
          />
          <div className={styles.mobileSidebar}>
            <div className={styles.mobileSidebarHeader}>
              <img src={logoImg} alt="Logo Valdinei Souza" className={styles.mobileLogo} />
              <button 
                type="button" 
                className={styles.closeButton}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className={styles.mobileNav}>
              {navigationItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`.trim()
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
