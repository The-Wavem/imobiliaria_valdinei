import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import styles from "./Select.module.css";

export default function Select({ icon: Icon, label, options = [], value, onChange, className = "" }) {
  const selectableOptions = options.filter((option) => option.value !== "");

  const handleValueChange = (nextValue) => {
    if (typeof onChange === "function") {
      onChange({ target: { value: nextValue } });
    }
  };

  return (
    <SelectPrimitive.Root value={value} onValueChange={handleValueChange}>
      <SelectPrimitive.Trigger className={`${styles.container} ${className}`.trim()}>
        <div className={styles.visualLayout}>
          {Icon ? <Icon className={styles.icon} size={20} /> : null}

          <div className={styles.textStack}>
            <span className={styles.label}>{label}</span>
            <SelectPrimitive.Value className={styles.value} placeholder="Selecione..." />
          </div>

          <SelectPrimitive.Icon asChild>
            <ChevronDown className={styles.arrow} size={20} />
          </SelectPrimitive.Icon>
        </div>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className={styles.content} position="popper" sideOffset={10}>
          <SelectPrimitive.Viewport className={styles.viewport}>
            {selectableOptions.map((option) => (
              <SelectPrimitive.Item key={option.value} className={styles.item} value={option.value}>
                <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
                  <Check size={16} />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}