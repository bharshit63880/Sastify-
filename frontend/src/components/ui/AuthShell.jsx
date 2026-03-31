import React from "react";
import { motion } from "framer-motion";
import { Card } from "./Card";
import { Container } from "./Container";
import { fadeUp, staggerContainer } from "./motion";

export const AuthShell = ({ eyebrow, title, description, highlights = [], children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[10%] h-52 w-52 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute right-[8%] top-[18%] h-56 w-56 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[28%] h-64 w-64 rounded-full bg-white/70 blur-[110px]" />
      </div>

      <Container className="relative z-[1] flex min-h-screen items-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid w-full gap-8 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <motion.div variants={fadeUp} className="flex items-center">
            <div className="space-y-7">
              <span className="inline-flex rounded-full border border-white/60 bg-white/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-textPrimary shadow-[0_12px_30px_rgba(17,17,17,0.06)]">
                {eyebrow}
              </span>
              <div className="space-y-4">
                <h1 className="hero-title max-w-2xl">{title}</h1>
                <p className="body-copy max-w-2xl">{description}</p>
              </div>
              <div className="grid gap-4">
                {highlights.map((item, index) => (
                  <Card
                    key={item}
                    hover={false}
                    className="flex items-center gap-4 rounded-[24px] bg-white/45 p-5"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-button-gradient text-sm font-semibold text-white">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-7 text-textPrimary">{item}</p>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card hover={false} className="mx-auto w-full max-w-xl rounded-[34px] p-2">
              <div className="rounded-[30px] border border-white/50 bg-white/58 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl md:p-8">
                {children}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};
