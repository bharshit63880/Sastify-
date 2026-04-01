import React from "react";
import { motion } from "framer-motion";
import { Card } from "./Card";
import { Container } from "./Container";
import { fadeUp, staggerContainer } from "./motion";

export const AuthShell = ({ eyebrow, title, description, highlights = [], children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(104,138,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(200,139,74,0.16),transparent_28%),linear-gradient(180deg,#090d14_0%,#0d1320_100%)]" />
        <div className="absolute left-[8%] top-[10%] h-52 w-52 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute right-[8%] top-[18%] h-56 w-56 rounded-full bg-[#688aff]/18 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[28%] h-64 w-64 rounded-full bg-white/8 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
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
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-textPrimary shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                {eyebrow}
              </span>
              <div className="space-y-4">
                <h1 className="hero-title max-w-2xl bg-[linear-gradient(135deg,#ffffff_10%,#d7e2ff_44%,#c88b4a_100%)] bg-clip-text text-transparent">{title}</h1>
                <p className="body-copy max-w-2xl">{description}</p>
              </div>
              <div className="grid gap-4">
                {highlights.map((item, index) => (
                  <Card
                    key={item}
                    hover={false}
                    className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-white/[0.05] p-5"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(200,139,74,0.95),rgba(104,138,255,0.92))] text-sm font-semibold text-white">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-7 text-textPrimary">{item}</p>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card hover={false} className="mx-auto w-full max-w-xl rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,35,0.92),rgba(9,13,20,0.9))] p-2">
              <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,40,0.86),rgba(9,13,20,0.84))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl md:p-8">
                {children}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};
