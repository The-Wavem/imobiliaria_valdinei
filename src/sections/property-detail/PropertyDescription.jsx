import React, { useMemo } from "react";
import styles from "./PropertyDescription.module.css";

export function cleanAndFixDescription(raw) {
  if (!raw || typeof raw !== "string") return "";

  let str = String(raw)
    // 1. Remove caracteres de hifenização oculta e zero-width
    .replace(/&shy;/gi, "")
    .replace(/\u00AD/g, "")
    .replace(/\u200B/g, "");

  // 2. Trata hífens com quebra de linha no meio de palavras compostas/hifenizadas (ex: "integra-\n se")
  str = str.replace(
    /([a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])\s*-\s*(?:\r?\n|<br\s*\/?>)\s*([a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])/g,
    "$1-$2"
  );

  // 3. Se for texto puro sem tags HTML, converte quebras duplas em parágrafos
  if (!/<[a-z][\s\S]*>/i.test(str)) {
    str = str
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.trim()}</p>`)
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
