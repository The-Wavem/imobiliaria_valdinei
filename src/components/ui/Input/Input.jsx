import { useId } from "react";
import styles from "./Input.module.css";

export default function Input({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  error,
  success,
  successText,
  maxLength,
  onKeyDown,
}) {
  const inputId = useId();

  return (
    <label className={`${styles.field} ${className}`.trim()} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>

      <div className={`${styles.control} ${error ? styles.controlError : ""} ${success ? styles.controlSuccess : ""}`.trim()}>
        {Icon ? (
          <span className={styles.icon}>
            <Icon size={16} strokeWidth={2} />
          </span>
        ) : null}

        <input
          id={inputId}
          className={styles.input}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
        />
      </div>
      
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && successText && <span className={styles.successText}>{successText}</span>}
    </label>
  );
}