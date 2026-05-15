import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./PropertyGallery.module.css";

export default function PropertyGallery({ images = [], title }) {
  return (
    <div className={styles.gallery}>
      <Swiper modules={[Navigation]} navigation spaceBetween={10} slidesPerView={1}>
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={src}
              alt={`${title} - ${idx + 1}`}
              className={styles.image}
              onClick={() => console.log("Abrir imagem fullscreen (simulado)", src)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
