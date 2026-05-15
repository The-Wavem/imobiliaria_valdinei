import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { MapPin, Bed, Bath, Maximize, Phone } from "lucide-react";
import Button from "@components/ui/Button/Button.jsx";
import styles from "./PropertyDetail.module.css";

const dummyProperties = [
  {
    id: "rent-1",
    code: "RNT-001",
    title: "Studio mobiliado próximo ao centro",
    location: "Centro, Curitiba",
    price: 3200,
    beds: 1,
    baths: 1,
    area: 42,
    parking: 1,
    amenities: ["Mobiliado", "Elevador", "Varanda"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1600",
    ],
    description:
      "Belíssimo studio com acabamento premium, posição solar excelente e acabamento de alto padrão. Próximo a transporte, serviços e com fácil acesso ao centro.",
  },
];

function BadgeList({ items = [] }) {
  return (
    <div className={styles.badges}>
      {items.map((b) => (
        <span key={b} className={styles.badge}>
          {b}
        </span>
      ))}
    </div>
  );
}

function Specs({ beds, baths, area, parking }) {
  return (
    <ul className={styles.specs}>
      <li>
        <Bed size={16} /> <span>{beds} quarto{beds > 1 ? "s" : ""}</span>
      </li>
      <li>
        <Bath size={16} /> <span>{baths} banheiro{baths > 1 ? "s" : ""}</span>
      </li>
      <li>
        <Maximize size={16} /> <span>{area} m²</span>
      </li>
      <li>
        <Phone size={16} /> <span>{parking} vaga{parking > 1 ? "s" : ""}</span>
      </li>
    </ul>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();

  const property = useMemo(() => {
    return dummyProperties.find((p) => p.id === id) || dummyProperties[0];
  }, [id]);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link to="/">Início</Link>
        <span>›</span>
        <Link to={"/alugar"}>Alugar</Link>
        <span>›</span>
        <span>{property.title}</span>
      </nav>

      <div className={styles.topCarousel}>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={10}
          slidesPerView={1}
        >
          {property.images.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`${property.title} - ${idx + 1}`}
                className={styles.carouselImage}
                onClick={() => console.log("Simular abrir em tela cheia", src)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <main className={styles.container}>
        <section className={styles.left}>
          <header className={styles.header}>
            <h1 className={styles.title}>{property.title}</h1>
            <div className={styles.location}>
              <MapPin size={14} /> <span>{property.location}</span>
            </div>
            <Specs beds={property.beds} baths={property.baths} area={property.area} parking={property.parking} />
            <BadgeList items={property.amenities} />
          </header>

          <section className={styles.description}>
            <h2>Descrição</h2>
            <p>{property.description}</p>
          </section>
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.priceWrap}>
              <div className={styles.priceLabel}>Preço</div>
              <div className={styles.priceValue}>
                {property.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <div className={styles.code}>Código: {property.code}</div>
            </div>

            <div className={styles.cta}>
              <Button variant="primary" className={styles.ctaPrimary}>Agendar Visita</Button>
              <Button variant="outline" className={styles.ctaOutline}>Falar com Corretor</Button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
