import { useNavigate } from "react-router-dom";
import Hero from "@sections/home/Hero";
import FeaturedProperties from "@sections/home/FeaturedProperties";
import Stats from "@sections/home/Stats";
import Contact from "@sections/home/Contact";
import HomeAbout from "@sections/home/HomeAbout.jsx";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export default function Home() {
  useDocumentTitle('Encontre seu Imóvel Ideal');
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId) => {
    navigate(`/imovel/${propertyId}`);
  };

  return (
    <main>
      <Hero />
      <Stats />
      <FeaturedProperties onPropertyClick={handlePropertyClick} />
      <HomeAbout />
      <Contact />
    </main>
  );
}