import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const styles = {
  primary:
    "border border-white/10 bg-[linear-gradient(135deg,rgba(200,139,74,0.95),rgba(104,138,255,0.92))] text-white shadow-[0_20px_45px_rgba(9,13,20,0.42)] hover:shadow-[0_24px_60px_rgba(200,139,74,0.22)]",
  secondary:
    "border border-white/12 bg-white/[0.05] text-textPrimary shadow-[0_16px_34px_rgba(0,0,0,0.25)] backdrop-blur-xl hover:border-accent/35 hover:bg-white/[0.08]",
  ghost:
    "border border-transparent bg-transparent text-textSecondary hover:bg-white/[0.06] hover:text-textPrimary",
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
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3.5 text-sm font-semibold tracking-[-0.01em] transition duration-200",
    "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)] before:opacity-70",
    "after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] after:opacity-70",
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
