import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { cardHover } from "./motion";

export const Card = ({ className = "", children, hover = true, ...props }) => {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover={hover ? "hover" : undefined}
      variants={cardHover}
      className={cn("glass-card p-6", className)}
      style={{ transformStyle: "preserve-3d" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
