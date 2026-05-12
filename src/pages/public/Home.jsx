import Hero from "@sections/home/Hero";
import FeaturedProperties from "@sections/home/FeaturedProperties";
import Stats from "@sections/home/Stats";
import Contact from "@sections/home/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <FeaturedProperties />
      <Contact />
    </main>
  );
}