import Hero from "@sections/home/Hero";
import FeaturedProperties from "@sections/home/FeaturedProperties";
import Stats from "@sections/home/Stats";

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <FeaturedProperties />
    </main>
  );
}