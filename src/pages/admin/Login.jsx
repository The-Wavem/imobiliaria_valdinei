import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import Input from "@components/ui/Input/Input.jsx";
import Button from "@components/ui/Button/Button.jsx";
import { auth } from "@services/firebaseConfig";
import styles from "./Login.module.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/admin/dashboard", { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.loginCard} aria-label="Autenticação administrativa">
        <div className={styles.logoArea}>
          <span className={styles.logoMark} aria-hidden="true">
            IV
          </span>
          <div>
            <p className={styles.logoLabel}>Acesso Restrito</p>
            <h1 className={styles.title}>Painel Administrativo</h1>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <Input
            type="email"
            label="E-mail"
            placeholder="admin@imobiliaria.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            type="password"
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className={styles.errorMessage}>{error}</p> : null}

          <Button type="submit" variant="primary" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? "Autenticando..." : "Entrar no Painel"}
          </Button>
        </form>
      </section>
    </main>
  );
}