import React from "react";
import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  ...props
}) {
  // Junta a classe base do botão com a classe da variação escolhida
  const buttonClass = `${styles.btn} ${styles[variant]} ${className}`;

  return (
    <button className={buttonClass} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
