import styles from "./Skeleton.module.css";

export default function Skeleton({ width = "100%", height = "1rem", borderRadius = "1rem", className = "" }) {
  return (
    <div
      className={`${styles.skeletonBase} ${className}`.trim()}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}