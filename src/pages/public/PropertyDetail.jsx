import { useEffect, useState } from "react";
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

import { fetchPropertyById } from "@services/properties";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
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

export default function PropertyDetail() {
  const { id } = useParams();
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      try {
        const item = await fetchPropertyById(id);

        if (isMounted) {
          setProperty(item);

          if (item?.bairro) {
            await trackBairroView(item.bairro);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Carregando imóvel...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div>
            <h1>Imóvel não encontrado</h1>
            <p>Esse imóvel não existe mais ou ainda não está publicado.</p>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = property.images.length
    ? property.images
    : property.image
      ? [property.image]
      : [];

  return (
    <div className={styles.page}>
      <Breadcrumb property={property} />

      <PropertyGallery images={galleryImages} title={property.title} />

      <MotionMain
        className={styles.container}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <MotionSection className={styles.left}>
          <MotionDiv variants={itemVariants}>
            <PropertyHeader
              title={property.title}
              location={property.location}
            />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyInfo
              beds={property.beds}
              baths={property.baths}
              area={property.area}
              parking={property.parking}
            />
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
              propertyTitle={property.title}
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
