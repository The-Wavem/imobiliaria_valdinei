import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css";
import styles from "./PropertyGallery.module.css";

export default function PropertyGallery({ 
  images = [], 
  title, 
  isOpen, 
  onClose, 
  initialIndex = 0, 
  onOpenGallery 
}) {
  const [modalIndex, setModalIndex] = useState(initialIndex);
  const swiperRef = useRef(null);
  const safeImages = images.filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      setModalIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (safeImages.length === 0) return null;

  return (
    <div className={styles.gallery}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1}
      >
        {safeImages.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={src}
              alt={`${title} - ${idx + 1}`}
              className={styles.image}
              onClick={() => onOpenGallery && onOpenGallery(idx)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

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
              {safeImages.map((src, idx) => (
                <SwiperSlide key={idx}>
                  <div className={styles.modalSlide}>
                    <img
                      src={src}
                      alt={`${title} - ${idx + 1}`}
                      className={styles.modalImage}
                    />
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
            {modalIndex + 1} / {safeImages.length}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}