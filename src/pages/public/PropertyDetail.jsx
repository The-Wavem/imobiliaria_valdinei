import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion as motionFactory } from "framer-motion";
import styles from "./PropertyDetail.module.css";
import { trackBairroView } from "@utils/analytics";

import Breadcrumb from "@components/ui/Breadcrumb/Breadcrumb.jsx";
import PropertyGallery from "@sections/property-detail/PropertyGallery";
import PropertyHeader from "@sections/property-detail/PropertyHeader";
import PropertyInfo from "@sections/property-detail/PropertyInfo";
import PropertyDescription from "@sections/property-detail/PropertyDescription";
import PropertyFeatures from "@sections/property-detail/PropertyFeatures";
import PropertyMap from "@sections/property-detail/PropertyMap";
import ContactSidebar from "@sections/property-detail/ContactSidebar";
import PropertyContactForm from "@sections/property-detail/PropertyContactForm";
import VisitModal from "@sections/property-detail/VisitModal";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const sidebarVariants = {
  hidden: { opacity: 0, x: 24, y: 12 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
  },
};

const MotionMain = motionFactory.main;
const MotionSection = motionFactory.section;
const MotionDiv = motionFactory.div;

const dummyProperties = [
  {
    id: "rent-1",
    category: "Alugar",
    code: "RNT-001",
    title: "Studio mobiliado próximo ao centro",
    bairro: "Centro",
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
  {
    id: "1",
    category: "Comprar",
    code: "BUY-001",
    title: "Apartamento Garden no Batel",
    bairro: "Batel",
    location: "Batel, Curitiba",
    price: 1450000,
    beds: 3,
    baths: 2,
    area: 142,
    parking: 2,
    amenities: ["Mobiliado", "Elevador"],
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1600",
    ],
    description: "Apartamento garden com áreas amplas, acabamento moderno e excelente localização.",
  },
  {
    id: "2",
    category: "Comprar",
    code: "BUY-002",
    title: "Casa moderna em condomínio fechado",
    bairro: "Santa Felicidade",
    location: "Santa Felicidade, Curitiba",
    price: 890000,
    beds: 4,
    baths: 3,
    area: 210,
    parking: 3,
    amenities: ["Piscina", "Churrasqueira"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1600",
    ],
    description: "Casa moderna em condomínio com área externa, projeto contemporâneo e lazer completo.",
  },
  {
    id: "3",
    category: "Alugar",
    code: "STU-001",
    title: "Studio mobiliado próximo ao centro",
    bairro: "Centro",
    location: "Centro, Curitiba",
    price: 3200,
    beds: 1,
    baths: 1,
    area: 42,
    parking: 1,
    amenities: ["Mobiliado", "Elevador"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600",
    ],
    description: "Studio compacto, mobiliado, ótima localização e fácil acesso aos serviços.",
  },
];

export default function PropertyDetail() {
  const { id } = useParams();
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  const property = useMemo(() => {
    return dummyProperties.find((p) => p.id === id) || dummyProperties[0];
  }, [id]);

  useEffect(() => {
    if (property?.bairro) {
      trackBairroView(property.bairro);
    }
  }, [property]);

  return (
    <div className={styles.page}>
      <Breadcrumb property={property} />

      <PropertyGallery images={property.images} title={property.title} />

      <MotionMain className={styles.container} variants={pageVariants} initial="hidden" animate="visible">
        <MotionSection className={styles.left}>
          <MotionDiv variants={itemVariants}>
            <PropertyHeader title={property.title} location={property.location} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyInfo beds={property.beds} baths={property.baths} area={property.area} parking={property.parking} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyFeatures features={property.amenities} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyDescription description={property.description} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyMap address={property.location} />
          </MotionDiv>
        </MotionSection>

        <aside className={styles.sidebar}>
          <MotionDiv variants={sidebarVariants}>
            <ContactSidebar
              code={property.code}
              price={property.price}
              condo={property.condo}
              iptu={property.iptu}
              onScheduleVisit={() => setIsVisitModalOpen(true)}
            />
          </MotionDiv>
        </aside>
      </MotionMain>

      <PropertyContactForm property={property} />

      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        propertyName={property.title}
      />
    </div>
  );
}
