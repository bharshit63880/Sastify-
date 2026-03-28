import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const MotionLink = motion(Link);

const styles = {
  primary:
    "bg-brand-gradient text-white shadow-glow hover:brightness-110 border border-primary/20",
  secondary:
    "border border-border bg-white text-textPrimary hover:border-primary/30 hover:bg-[#faf7f2]",
  ghost:
    "border border-transparent bg-transparent text-textSecondary hover:bg-black/[0.04] hover:text-textPrimary",
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
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200",
    styles[variant],
    fullWidth && "w-full",
    disabled && "cursor-not-allowed opacity-60",
    className
  );

  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <MotionLink
        whileHover={disabled ? undefined : { scale: 1.05, filter: "brightness(1.06)" }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        className={sharedClassName}
        to={to}
        {...props}
      >
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a
        whileHover={disabled ? undefined : { scale: 1.05, filter: "brightness(1.06)" }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        className={sharedClassName}
        href={href}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.05, filter: "brightness(1.06)" }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={sharedClassName}
      disabled={disabled}
      type={type}
      {...props}
    >
      {content}
    </motion.button>
  );
};
