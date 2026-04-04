import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { fadeUp, staggerContainer, viewportOnce } from "./motion";

export const Section = ({ className = "", children }) => {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn("relative py-10 md:py-12", className)}
    >
      {children}
    </motion.section>
  );
};

export const SectionIntro = ({ eyebrow, title, description, action }) => {
  return (
    <motion.div
      variants={fadeUp}
      className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="max-w-3xl space-y-3">
        {eyebrow ? (
          <span className="inline-flex rounded-full border border-border bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="body-copy max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
};
