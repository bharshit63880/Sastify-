import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const styles = {
  primary:
    "border border-primary bg-primary text-white shadow-[0_14px_34px_rgba(17,17,17,0.16)] hover:bg-[#222222] hover:shadow-[0_20px_44px_rgba(17,17,17,0.2)]",
  secondary:
    "border border-border bg-white text-textPrimary shadow-[0_10px_26px_rgba(17,17,17,0.05)] hover:border-primary/15 hover:bg-surface",
  ghost:
    "border border-transparent bg-transparent text-textSecondary hover:bg-white hover:text-textPrimary",
};

export const Button = ({
  className = "",
  children,
  variant = "primary",
  to,
  href,
  icon,
  fullWidth = false,
  disabled = false,
  type = "button",
  ...props
}) => {
  const sharedClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold tracking-[-0.01em] transition duration-200",
    styles[variant],
    fullWidth && "w-full",
    disabled && "cursor-not-allowed opacity-60",
    className
  );

  const content = (
    <>
      {icon ? <span className="text-base">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link className={sharedClassName} to={to} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={sharedClassName} href={href} {...props}>
        {content}
      </a>
    );
  }

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.01, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={sharedClassName}
      disabled={disabled}
      type={type}
      {...props}
    >
      {content}
    </motion.button>
  );
};
