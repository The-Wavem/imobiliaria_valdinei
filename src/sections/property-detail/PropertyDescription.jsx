import React, { useMemo } from "react";
import styles from "./PropertyDescription.module.css";

export function cleanAndFixDescription(raw) {
  if (!raw || typeof raw !== "string") return "";

  let str = String(raw)
    // 1. Remove caracteres de hifenização oculta, zero-width e marcadores de formatação
    .replace(/&shy;/gi, "")
    .replace(/\u00AD/g, "")
    .replace(/\u200B/g, "")
    .replace(/\u200C/g, "")
    .replace(/\u200D/g, "")
    .replace(/\uFEFF/g, "")
    .replace(/&nbsp;/gi, " ");

  // 2. Trata palavras que foram cortadas ao meio por quebra de linha de PDFs/colunas (ex: "Boulev-\nard" -> "Boulevard")
  str = str.replace(
    /([a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])-\s*(?:\r?\n|<br\s*\/?>)\s*([a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])/g,
    "$1$2"
  );

  // 3. Se for texto puro sem tags HTML, converte quebras duplas em parágrafos e quebras simples em espaços
  if (!/<[a-z][\s\S]*>/i.test(str)) {
    str = str
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.replace(/\r?\n/g, " ").trim()}</p>`)
      .join("");
  }

  return str;
}

export default function PropertyDescription({ description }) {
  const cleanHtml = useMemo(() => {
    return cleanAndFixDescription(description);
  }, [description]);

  return (
    <section className={styles.section}>
      <h2 className={styles.subtitle}>Descrição</h2>
      <div 
        className={`${styles.propertyDescription} ${styles.richTextContainer}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }} 
      />
    </section>
  );
}
