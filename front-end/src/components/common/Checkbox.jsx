"use client";

import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./Checkbox.module.css";

const Checkbox = forwardRef(function Checkbox(
  {
    label,
    checked,
    defaultChecked,
    onChange,
    id,
    name,
    className = "",
    ...props
  },
  ref
) {
  const checkProps = {};
  if (checked !== undefined) checkProps.checked = checked;
  if (defaultChecked !== undefined) checkProps.defaultChecked = defaultChecked;

  const isChecked = checked ?? defaultChecked ?? false;

  return (
    <label
      htmlFor={id || name}
      className={cn(styles.container, className)}
    >
      <input
        ref={ref}
        type="checkbox"
        id={id || name}
        name={name}
        {...checkProps}
        onChange={onChange}
        className={styles.hiddenCheckbox}
        {...props}
      />

      <div
        className={cn(
          styles.styledCheckbox,
          isChecked && styles.checked
        )}
      >
        {isChecked && (
          <Check size={14} className={styles.checkIcon} />
        )}
      </div>

      {label && (
        <span className={styles.label}>{label}</span>
      )}
    </label>
  );
});

export default Checkbox;
