import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { fadeUp, staggerContainer } from "./motion";

export const PageWrapper = ({ className = "", children }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn("relative space-y-8 pb-20 pt-8 md:space-y-10 md:pt-10", className)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_70%)] blur-3xl" />
      <motion.div variants={fadeUp}>{children}</motion.div>
    </motion.div>
  );
};
