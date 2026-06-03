import { useNavigate } from "react-router-dom";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Ops! Página não encontrada.</h2>
      <p className={styles.description}>
        O imóvel ou a página que você está procurando pode ter sido removido ou o link está incorreto.
      </p>
      <Button variant="primary" onClick={() => navigate("/")}>
        Voltar ao Início
      </Button>
    </main>
  );
}