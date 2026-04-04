import React from "react";
import { Input } from "./ui/Input";

export const NewsletterBanner = ({
  title = "Stay close to new drops",
  description = "Get product launches, limited offers, and curated picks in one clean weekly email.",
}) => {
  return (
    <div className="overflow-hidden rounded-[32px] border border-border bg-white px-6 py-6 shadow-card md:px-8 md:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="max-w-md text-2xl font-semibold tracking-tight text-textPrimary">{title}</p>
          <p className="text-sm text-textSecondary">{description}</p>
        </div>

        <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
          <Input
            type="email"
            placeholder="Enter your email address"
            className="min-h-[52px] rounded-full"
          />
          <button
            type="submit"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-[#222222] sm:w-auto"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};
