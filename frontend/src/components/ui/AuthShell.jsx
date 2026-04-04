import React from "react";
import { Link } from "react-router-dom";
import { Container } from "./Container";

export const AuthShell = ({ eyebrow, title, description, highlights = [], children }) => {
  return (
    <div className="min-h-screen py-10">
      <Container className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-4 text-center">
            <Link to="/" className="inline-flex text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
              Sastify
            </Link>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">{eyebrow}</p>
            ) : null}
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary sm:text-4xl">{title}</h1>
              {description ? <p className="body-copy">{description}</p> : null}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6 shadow-card sm:p-8">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
};
