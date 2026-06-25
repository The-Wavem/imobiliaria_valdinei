import SobreSection from "../../sections/sobre/sobre.jsx";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export default function Sobre() {
  useDocumentTitle('Nossa História');
  return (
    <SobreSection />
  );
} 