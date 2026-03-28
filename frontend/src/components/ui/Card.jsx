import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Card = ({ className = "", children, hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.04, y: -6, boxShadow: "0 0 0 1px rgba(17,17,17,0.08), 0 24px 60px rgba(17,17,17,0.14)" } : undefined}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={cn("surface-panel rounded-2xl p-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
