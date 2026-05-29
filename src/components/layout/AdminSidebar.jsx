import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
import Modal from "@components/ui/Modal/Modal.jsx";
import Button from "@components/ui/Button/Button.jsx";
import Input from "@components/ui/Input/Input.jsx";
import styles from "./AdminSidebar.module.css";

const navigationItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Imóveis", path: "/admin/imoveis", icon: Home },
  { label: "Leads", path: "/admin/leads", icon: Users },
  { label: "Visitas", path: "/admin/visitas", icon: CalendarDays },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configTab, setConfigTab] = useState("menu");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
    setConfigTab("menu");
    setNewPassword("");
    setConfirmPassword("");
  };

  const openConfigModal = () => {
    setConfigTab("menu");
    setIsConfigModalOpen(true);
    setIsOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setIsOpen(false);
  };

  const handleGoToSite = () => {
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const handleLogout = () => {
    // Placeholder até a integração com o logout do Firebase.
    console.log("Firebase Logout Placeholder");
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const handleSavePassword = () => {
    // Placeholder até a integração com atualização real de senha.
    console.log("Config Password Save Placeholder");
    closeConfigModal();
  };

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
          <button type="button" className={styles.footerButton} onClick={openConfigModal}>
            <Settings size={18} />
            <span className={styles.navText}>Configurações</span>
          </button>

          <button type="button" className={`${styles.footerButton} ${styles.footerButtonDanger}`} onClick={openLogoutModal}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sair do Painel"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalPrompt}>O que você deseja fazer?</p>

          <div className={styles.modalActionStack}>
            <Button variant="outline" className={styles.modalActionButton} onClick={handleGoToSite}>
              Apenas voltar para o site
            </Button>

            <Button variant="secondary" className={styles.modalActionButton} onClick={handleLogout}>
              Sair da Conta (Logout)
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConfigModalOpen}
        onClose={closeConfigModal}
        title="Configurações"
      >
        <div className={styles.modalContent}>
          {configTab === "menu" ? (
            <div className={styles.configMenu}>
              <p className={styles.modalPrompt}>
                Escolha uma opção de configuração rápida.
              </p>

              <Button
                variant="outline"
                className={styles.modalActionButton}
                onClick={() => setConfigTab("password")}
              >
                Trocar Senha
              </Button>
            </div>
          ) : (
            <div className={styles.configPasswordForm}>
              <Input
                type="password"
                label="Nova Senha"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              <Input
                type="password"
                label="Confirmar Senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              <div className={styles.configActions}>
                <Button variant="primary" className={styles.configActionButton} onClick={handleSavePassword}>
                  Salvar
                </Button>

                <Button
                  variant="outline"
                  className={styles.configActionButton}
                  onClick={() => setConfigTab("menu")}
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}