import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion as motionFactory } from "framer-motion";
import styles from "./PropertyDetail.module.css";
import { trackBairroView } from "@utils/analytics";
import { incrementPropertyViews } from "@/services/propertyService";
import { logPropertyViewAnalytics, logNeighborhoodView } from "@/services/analyticsService";
import { extractNeighborhood } from "@utils/address.js";
import { getYouTubeThumbnailUrl } from "@utils/videoUtils.js";
  
import Breadcrumb from "@components/ui/Breadcrumb/Breadcrumb.jsx";
import PropertyGallery from "@sections/property-detail/PropertyGallery";
import PropertyHeader from "@sections/property-detail/PropertyHeader";
import PropertyInfo from "@sections/property-detail/PropertyInfo";
import PropertyMosaic from "@sections/property-detail/PropertyMosaic";
import PropertyDescription from "@sections/property-detail/PropertyDescription";
import PropertyFeatures from "@sections/property-detail/PropertyFeatures";
import PropertyMap from "@sections/property-detail/PropertyMap";
import ContactSidebar from "@sections/property-detail/ContactSidebar";
import PropertyContactForm from "@sections/property-detail/PropertyContactForm";
import VisitModal from "@sections/property-detail/VisitModal";

import { fetchPropertyById } from "@services/properties";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);

  useDocumentTitle(property ? property.title : 'Carregando Imóvel...');

  const handleOpenGallery = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  // Efeito 1: responsável APENAS por carregar o imóvel do Firebase
  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      try {
        const item = await fetchPropertyById(id);

        if (isMounted) {
          setProperty(item);
          // Métricas de visualização não dependem do bairro — disparam imediatamente
          incrementPropertyViews(item.id);
          logPropertyViewAnalytics(item);
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

  // Efeito 2: reage APÓS o state 'property' estar 100% hidratado no React
  // Dependência [property] garante que só executa quando o objeto existir de verdade
  useEffect(() => {
    if (!property || !property.location) return;

    const bairroName = extractNeighborhood(property.location);

    if (!bairroName) return;

    logNeighborhoodView(bairroName);
    trackBairroView(bairroName);
  }, [property]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div style={{ height: '24px', width: '30%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '2rem' }} />
        <div style={{ height: '500px', width: '100%', background: '#e2e8f0', borderRadius: '16px' }} />
        <div className={styles.container}>
          <div className={styles.left}>
            <div style={{ height: '40px', width: '70%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '1rem' }} />
            <div style={{ height: '24px', width: '40%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '3rem' }} />
            <div style={{ height: '120px', width: '100%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '2rem' }} />
            <div style={{ height: '200px', width: '100%', background: '#e2e8f0', borderRadius: '8px' }} />
          </div>
          <div className={styles.sidebar}>
            <div style={{ height: '420px', width: '100%', background: '#e2e8f0', borderRadius: '16px' }} />
          </div>
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

  let rawVideos = property.videos || [];
  if (!Array.isArray(rawVideos)) rawVideos = [rawVideos];
  if (rawVideos.length === 0 && property.videoUrl) rawVideos = [property.videoUrl];
  if (rawVideos.length === 0 && property.video) rawVideos = [property.video];

  const safeImages = galleryImages.filter(Boolean);
  
  const videoThumbnails = rawVideos.map((url) => {
    return getYouTubeThumbnailUrl(url);
  }).filter(Boolean);

  const mosaicUrls = [...videoThumbnails, ...safeImages];

  return (
    <div className={styles.page}>
      <Breadcrumb property={property} />

      <PropertyGallery 
        images={galleryImages} 
        videos={rawVideos}
        title={property.title} 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={initialGalleryIndex}
        onOpenGallery={handleOpenGallery}
      />

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
              propertyId={property.id}
              price={property.price}
              rentPrice={property.pricing?.rentPrice || property.rentPrice}
              condo={property.pricing?.condo || property.pricing?.condominio || property.condo || 0}
              iptu={property.pricing?.iptu || property.iptu || 0}
              category={property.category}
            />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyInfo
              beds={property.beds}
              baths={property.baths}
              area={property.area}
              landArea={property.landArea}
              parking={property.parking}
            />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyFeatures features={property.amenities} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyMosaic photos={mosaicUrls} onOpenGallery={handleOpenGallery} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyDescription description={property.description} />
          </MotionDiv>
          <MotionDiv variants={itemVariants}>
            <PropertyMap address={property.location} />
          </MotionDiv>
        </MotionSection>

        <aside className={styles.sidebar}>
          <div>
            <ContactSidebar
              code={property.code}
              price={property.price}
              rentPrice={property.pricing?.rentPrice || property.rentPrice}
              category={property.category}
              condo={property.pricing?.condo || property.pricing?.condominio || property.condo || 0}
              iptu={property.pricing?.iptu || property.iptu || 0}
              propertyTitle={property.title}
              propertyId={property.id}
              status={property.status}
              onScheduleVisit={() => setIsVisitModalOpen(true)}
            />
          </div>
        </aside>
      </MotionMain>

      <PropertyContactForm property={property} />

      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        property={property}
      />
    </div>
  );
}
