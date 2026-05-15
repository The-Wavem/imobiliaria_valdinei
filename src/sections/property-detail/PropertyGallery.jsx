import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { X } from "lucide-react";
import styles from "./PropertyGallery.module.css";

export default function PropertyGallery({ images = [], title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openGallery = (index) => {
    setActiveIndex(index || 0);
    setIsOpen(true);
  };

  return (
    <div className={styles.gallery}>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerView={1}
        onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
      >
        {images.map((src, idx) => (
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

      {isOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Fechar">
              <X size={20} />
            </button>

            <div className={styles.modalSwiperWrap}>
              <Swiper modules={[Navigation]} navigation initialSlide={activeIndex} spaceBetween={20} slidesPerView={1}>
                {images.map((src, idx) => (
                  <SwiperSlide key={idx}>
                    <img src={src} alt={`${title} - ${idx + 1}`} className={styles.modalImage} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
