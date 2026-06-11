import { useNavigate } from "react-router-dom";
import Hero from "@sections/home/Hero";
import FeaturedProperties from "@sections/home/FeaturedProperties";
import Stats from "@sections/home/Stats";
import Contact from "@sections/home/Contact";
import HomeAbout from "@sections/home/HomeAbout.jsx";

export default function Home() {
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