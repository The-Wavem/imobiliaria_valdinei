import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Check } from "lucide-react";
import styles from "./Select.module.css";

export default function Select({
  icon: Icon,
  label,
  options = [],
  value,
  onChange,
  className = "",
  compact = false,
  contentClassName = "",
  statusColor = "",
}) {
  const selectableOptions = options.filter((option) => option.value !== "");
  const [open, setOpen] = useState(false);

  const handleOptionSelect = (nextValue) => {
    if (typeof onChange === "function") {
      onChange(nextValue);
    }

    setOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : "Selecione...";
  const containerClassName = `${styles.container} ${compact ? styles.compact : ""} ${className}`.trim();
  const statusColorDataAttr = statusColor || undefined;

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger type="button" className={containerClassName} data-status-color={statusColorDataAttr}>
        <div className={styles.visualLayout}>
          {Icon ? <Icon className={styles.icon} size={20} /> : null}

          <div className={styles.textStack}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{displayValue}</span>
          </div>

          <span aria-hidden="true">
            <ChevronDown className={styles.arrow} size={20} />
          </span>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`${styles.content} ${contentClassName}`.trim()}
          data-status-color={statusColorDataAttr}
          sideOffset={10}
          align="start"
        >
          <div className={styles.viewport}>
            {selectableOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={styles.item}
                onClick={() => handleOptionSelect(option.value)}
              >
                <span className={styles.itemIndicator} aria-hidden="true">
                  <Check size={16} />
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}