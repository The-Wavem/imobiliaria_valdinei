import styles from "./PropertyMosaic.module.css";

export default function PropertyMosaic({ photos = [], onOpenGallery }) {
  if (!photos || photos.length < 5) return null;

  const displayPhotos = photos.slice(0, 5);
  const remainingCount = photos.length - 5;

  return (
    <div className={styles.mosaicContainer}>
      <div className={styles.mainPhoto} onClick={() => onOpenGallery && onOpenGallery(0)}>
        <img src={displayPhotos[0]} alt="Destaque Principal" className={styles.image} />
      </div>
      
      <div className={styles.sidePhotos}>
        {displayPhotos.slice(1).map((photo, index) => {
          const isLast = index === 3;
          
          return (
            <div key={index} className={styles.photoWrapper} onClick={() => onOpenGallery && onOpenGallery(index + 1)}>
              <img src={photo} alt={`Detalhe ${index + 1}`} className={styles.image} />
              
              {isLast && remainingCount > 0 && (
                <div className={styles.overlay}>
                  <span className={styles.overlayText}>+ {remainingCount} fotos</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
