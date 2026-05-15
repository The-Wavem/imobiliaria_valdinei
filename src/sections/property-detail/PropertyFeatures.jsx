import {
  Bath,
  BedDouble,
  CarFront,
  ChefHat,
  Home,
  Sofa,
  Waves,
  Wind,
  Building2,
  Sparkles,
} from "lucide-react";
import styles from "./PropertyFeatures.module.css";

const featureIcons = {
  mobiliado: Sofa,
  elevador: Building2,
  varanda: Home,
  piscina: Waves,
  churrasqueira: ChefHat,
  arcondicionado: Wind,
  ar: Wind,
  suite: Bath,
  suíte: Bath,
  garagem: CarFront,
  vagas: CarFront,
  vagasdegaragem: CarFront,
  closet: Sparkles,
  quarto: BedDouble,
  quartos: BedDouble,
  sala: Sofa,
  decorado: Sparkles,
  garden: Home,
};

function normalizeFeature(feature) {
  return feature
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export default function PropertyFeatures({ features = [] }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.subtitle}>Características</h3>
      <div className={styles.features}>
        {features.map((f) => (
          <span key={f} className={styles.feature}>
            {(() => {
              const Icon = featureIcons[normalizeFeature(f)] || Sparkles;
              return <Icon className={styles.featureIcon} aria-hidden="true" />;
            })()}
            <span className={styles.featureLabel}>{f}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
