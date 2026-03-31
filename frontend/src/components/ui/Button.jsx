import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const styles = {
  primary:
    "border border-black/10 bg-button-gradient text-white shadow-[0_18px_40px_rgba(17,17,17,0.18)] hover:shadow-[0_22px_55px_rgba(200,139,74,0.24)]",
  secondary:
    "border border-white/60 bg-white/70 text-textPrimary shadow-[0_10px_30px_rgba(17,17,17,0.07)] hover:border-accent/30 hover:bg-white",
  ghost:
    "border border-transparent bg-transparent text-textSecondary hover:bg-white/60 hover:text-textPrimary",
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
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3.5 text-sm font-semibold transition duration-200",
    "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_55%)] before:opacity-70",
    styles[variant],
    fullWidth && "w-full",
    disabled && "cursor-not-allowed opacity-60",
    className
  );

  const content = (
    <>
      {icon ? <span className="relative z-[1] text-base">{icon}</span> : null}
      <span className="relative z-[1]">{children}</span>
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
      whileHover={disabled ? undefined : { scale: 1.03, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
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
