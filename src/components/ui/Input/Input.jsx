import styles from "./Input.module.css";

export default function Input({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
}) {
  return (
    <label className={`${styles.field} ${className}`.trim()}>
      <span className={styles.label}>{label}</span>

      <div className={styles.control}>
        {Icon ? (
          <span className={styles.icon}>
            <Icon size={16} strokeWidth={2} />
          </span>
        ) : null}

        <input
          className={styles.input}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  );
}