import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css";
import styles from "./PropertyGallery.module.css";

export default function PropertyGallery({ images = [], title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const safeImages = images.filter(Boolean);

  const openGallery = (index) => {
    setActiveIndex(index || 0);
    setIsOpen(true);
  };

  if (safeImages.length === 0) return null;

  return (
    <div className={styles.gallery}>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerView={1}
        onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
      >
        {safeImages.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={src}
              alt={`${title} - ${idx + 1}`}
              className={styles.image}
              onClick={() => openGallery(idx)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {isOpen && createPortal(
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
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
              initialSlide={activeIndex}
              spaceBetween={20}
              slidesPerView={1}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
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
            {activeIndex + 1} / {safeImages.length}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}