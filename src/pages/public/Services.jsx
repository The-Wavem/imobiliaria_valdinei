import Services from "../../sections/services/Services.jsx";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export default function ServicesPage() {
  useDocumentTitle('Nossos Serviços');
  return (
    <>
      <Services />
    </>
  );
}