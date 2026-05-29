import Skeleton from "@components/ui/Skeleton/Skeleton.jsx";
import styles from "./SkeletonCard.module.css";

export default function SkeletonCard() {
  return (
    <article className={styles.card} aria-hidden="true">
      <Skeleton height="200px" borderRadius="24px" className={styles.image} />

      <div className={styles.content}>
        <Skeleton width="45%" height="0.9rem" borderRadius="999px" />
        <Skeleton width="80%" height="1.3rem" borderRadius="999px" />
        <Skeleton width="55%" height="1.6rem" borderRadius="999px" />

        <div className={styles.stats}>
          <Skeleton width="32%" height="2.1rem" borderRadius="999px" />
          <Skeleton width="32%" height="2.1rem" borderRadius="999px" />
          <Skeleton width="32%" height="2.1rem" borderRadius="999px" />
        </div>

        <div className={styles.actions}>
          <Skeleton width="48%" height="2.8rem" borderRadius="16px" />
          <Skeleton width="48%" height="2.8rem" borderRadius="16px" />
        </div>
      </div>
    </article>
  );
}