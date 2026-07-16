import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, X, Camera, Maximize, PlaySquare } from "lucide-react";
import "swiper/css";
import styles from "./PropertyGallery.module.css";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@utils/videoUtils";

export default function PropertyGallery({ 
  images = [], 
  videos = [],
  title, 
  isOpen, 
  onClose, 
  initialIndex = 0, 
  onOpenGallery 
}) {
  const [modalIndex, setModalIndex] = useState(initialIndex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);
  const safeImages = images ? images.filter(Boolean) : [];

  const rawVideos = videos || [];
  const videoItems = rawVideos.map((url, index) => {
    const defaultThumb = getYouTubeThumbnailUrl(url);
    // Para o 1º vídeo, tenta usar a capa do imóvel (alta qualidade). Se não houver fotos, cai pro YouTube default.
    const thumb = (index === 0 && safeImages.length > 0) ? safeImages[0] : defaultThumb;
    
    return {
      type: 'video', 
      url: getYouTubeEmbedUrl(url),
      thumbnail: thumb
    };
  }).filter(v => v.url);
  const photoItems = safeImages.map(url => ({ type: 'image', url }));
  const mediaList = [...videoItems, ...photoItems];

  useEffect(() => {
    if (isOpen) {
      setModalIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  if (mediaList.length === 0) return null;

  return (
    <div className={styles.gallery}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1}
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
      >
        {mediaList.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div className={styles.imageContainer} onClick={() => onOpenGallery && onOpenGallery(idx)}>
              <img
                src={item.thumbnail || item.url}
                alt={`${title} - ${item.type === 'video' ? 'Vídeo ' : ''}${idx + 1}`}
                className={styles.image}
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                decoding="async"
              />
              <div className={styles.hoverOverlay}>
                <Maximize size={40} color="white" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={styles.counterBadge}>
        <Camera size={16} />
        <span>{currentIndex + 1} / {mediaList.length}</span>
      </div>

      {isOpen && createPortal(
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar galeria"
          >
            <X size={18} />
          </button>

          <button
            className={`${styles.navBtn} ${styles.navBtnPrev}`}
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.modalSwiperWrap}>
            <Swiper
              modules={[]}
              initialSlide={initialIndex}
              spaceBetween={20}
              slidesPerView={1}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              onSlideChange={(sw) => setModalIndex(sw.activeIndex)}
            >
              {mediaList.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <div className={styles.modalSlide}>
                    {item.type === 'video' ? (
                      <iframe 
                        src={item.url} 
                        allow="autoplay; fullscreen" 
                        className={styles.modalVideoIframe} 
                        frameBorder="0" 
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`${title} - ${idx + 1}`}
                        className={styles.modalImage}
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button
            className={`${styles.navBtn} ${styles.navBtnNext}`}
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Próxima foto"
          >
            <ChevronRight size={24} />
          </button>

          <div className={styles.modalCounter}>
            {modalIndex + 1} / {mediaList.length}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}