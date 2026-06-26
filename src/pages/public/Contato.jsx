import ContatoSection from "@sections/contato/Contato";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export default function Contato() {
  useDocumentTitle('Fale Conosco');

  return (
    <>
      <ContatoSection />
    </>
  );
}