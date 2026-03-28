import React from "react";
import { cn } from "../../utils/cn";

export const Input = React.forwardRef(
  (
    {
      className = "",
      label,
      hint,
      error,
      as = "input",
      rows = 4,
      children,
      ...props
    },
    ref
  ) => {
    const Element = as;

    return (
      <label className="flex w-full flex-col gap-2">
        {label ? <span className="text-sm font-medium text-textPrimary">{label}</span> : null}
        <Element
          ref={ref}
          rows={as === "textarea" ? rows : undefined}
          className={cn("input-base", className)}
          {...props}
        >
          {children}
        </Element>
        {error ? <span className="text-sm text-rose-400">{error}</span> : null}
        {!error && hint ? <span className="text-sm text-textSecondary">{hint}</span> : null}
      </label>
    );
  }
);

Input.displayName = "Input";
