import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.css";

function getTransactionFromProperty(property) {
  const category = property?.category?.toLowerCase?.() || "";
  const id = property?.id?.toLowerCase?.() || "";

  if (category.includes("compr" ) || id.startsWith("buy")) {
    return { label: "Comprar", path: "/comprar" };
  }

  if (category.includes("alug") || id.startsWith("rent")) {
    return { label: "Alugar", path: "/alugar" };
  }

  return { label: "Imóveis", path: "/" };
}

export default function Breadcrumb({ property }) {
  const transaction = getTransactionFromProperty(property);

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link to="/">Início</Link>
      <span className={styles.separator}>/</span>
      <Link to={transaction.path}>{transaction.label}</Link>
      <span className={styles.separator}>/</span>
      <span className={styles.current}>{property?.title}</span>
    </nav>
  );
}