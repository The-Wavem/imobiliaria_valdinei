import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

const navigationItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Imóveis", path: "/admin/imoveis", icon: Home },
  { label: "Leads", path: "/admin/leads", icon: Users },
  { label: "Visitas", path: "/admin/visitas", icon: CalendarDays },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar navegação administrativa"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <button
        type="button"
        className={styles.mobileToggle}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            IV
          </div>
          <div className={styles.brandInfo}>
            <strong>Imobiliária Valdinei</strong>
            <span>Painel administrativo</span>
          </div>
        </div>

        <nav className={styles.navigation} aria-label="Navegação principal do admin">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className={styles.navIcon} />
                <span className={styles.navText}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button type="button" className={styles.footerButton}>
            <Settings size={18} />
            <span className={styles.navText}>Configurações</span>
          </button>

          <button type="button" className={`${styles.footerButton} ${styles.footerButtonDanger}`}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}