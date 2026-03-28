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
      className={cn("py-16", className)}
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
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
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
