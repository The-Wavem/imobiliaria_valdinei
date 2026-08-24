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
  warning,
  warningText,
  success,
  successText,
  helperText,
  maxLength,
  onKeyDown,
  onPaste,
  onBlur,
  disabled,
  readOnly,
  ...rest
}) {
  const inputId = useId();

  return (
    <label className={`${styles.field} ${disabled ? styles.fieldDisabled : ""} ${className}`.trim()} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>

      <div className={`${styles.control} ${error ? styles.controlError : ""} ${!error && warning ? styles.controlWarning : ""} ${success ? styles.controlSuccess : ""} ${disabled ? styles.controlDisabled : ""}`.trim()}>
        {Icon ? (
          <span className={`${styles.icon} ${!error && warning ? styles.iconWarning : ""}`.trim()}>
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
          onPaste={onPaste}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />
      </div>
      
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && warningText && <span className={styles.warningText}>{warningText}</span>}
      {!error && !warningText && successText && <span className={styles.successText}>{successText}</span>}
      {!error && !warningText && !successText && helperText && <span className={styles.helperText}>{helperText}</span>}
    </label>
  );
}