import { useId } from "react";
import styles from "./Select.module.css";

export default function Select({ icon: Icon, label, options, value, onChange }) {
  const selectId = useId();

  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>

      <div className={styles.control}>
        {Icon ? (
          <span className={styles.icon}>
            <Icon size={16} strokeWidth={2} />
          </span>
        ) : null}

        <select id={selectId} className={styles.select} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}