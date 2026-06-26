import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Imobiliária Valdinei`;
    } else {
      document.title = "Imobiliária Valdinei";
    }
  }, [title]);
}
