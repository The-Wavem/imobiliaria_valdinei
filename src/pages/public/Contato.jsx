import { useEffect } from "react";
import ContatoSection from "@sections/contato/Contato";

export default function Contato() {
  useEffect(() => {
    document.title = "Contato | Imobiliária Valdinei";
  }, []);

  return (
    <main>
      <ContatoSection />
    </main>
  );
}