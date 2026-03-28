import React from "react";
import { motion } from "framer-motion";
import { Card } from "./Card";
import { Container } from "./Container";
import { fadeUp, staggerContainer } from "./motion";

export const AuthShell = ({ eyebrow, title, description, highlights = [], children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Container className="flex min-h-screen items-center py-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <motion.div variants={fadeUp} className="flex items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </span>
              <div className="space-y-4">
                <h1 className="hero-title max-w-2xl">{title}</h1>
                <p className="body-copy max-w-2xl">{description}</p>
              </div>
              <div className="grid gap-4">
                {highlights.map((item) => (
                  <Card key={item} hover={false} className="bg-white/[0.04]">
                    <p className="text-sm text-textPrimary">{item}</p>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Card hover={false} className="mx-auto w-full max-w-xl p-0">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-6 md:p-8">{children}</div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};
