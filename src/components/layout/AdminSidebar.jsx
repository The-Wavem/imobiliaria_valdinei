import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut, updatePassword } from "firebase/auth";
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
import { auth } from "@services/firebaseConfig";
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
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const navigate = useNavigate();

  const resetPasswordState = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
    setIsSavingPassword(false);
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
    setConfigTab("menu");
    resetPasswordState();
  };

  const openConfigModal = () => {
    setConfigTab("menu");
    setIsConfigModalOpen(true);
    setIsOpen(false);
    resetPasswordState();
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

  const handleLogout = async () => {
    await signOut(auth);
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const handleSavePassword = () => {
    closeConfigModal();
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setPasswordError("Não foi possível localizar a sessão autenticada.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await updatePassword(currentUser, newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } catch (error) {
      if (error?.code === "auth/requires-recent-login") {
        setPasswordError("Por segurança, faça logout e login novamente antes de mudar a senha.");
        return;
      }

      setPasswordError("Não foi possível alterar a senha no momento. Tente novamente.");
    } finally {
      setIsSavingPassword(false);
    }
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
                onClick={() => {
                  resetPasswordState();
                  setConfigTab("password");
                }}
              >
                Trocar Senha
              </Button>
            </div>
          ) : (
            <form className={styles.configPasswordForm} onSubmit={handleUpdatePassword}>
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

              {passwordError ? <p className={styles.passwordError}>{passwordError}</p> : null}
              {passwordSuccess ? <p className={styles.passwordSuccess}>Senha alterada com sucesso!</p> : null}

              <div className={styles.configActions}>
                <Button
                  variant="primary"
                  className={styles.configActionButton}
                  type="submit"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "Salvando..." : "Salvar"}
                </Button>

                <Button
                  variant="outline"
                  className={styles.configActionButton}
                  type="button"
                  onClick={() => {
                    resetPasswordState();
                    setConfigTab("menu");
                  }}
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}