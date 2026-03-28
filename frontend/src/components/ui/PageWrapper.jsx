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
      className={cn("space-y-8 pb-16 pt-8 md:space-y-10 md:pt-10", className)}
    >
      <motion.div variants={fadeUp}>{children}</motion.div>
    </motion.div>
  );
};
