import React from "react";
import { Input } from "./ui/Input";

export const NewsletterBanner = ({
  title = "STAY UPTO DATE ABOUT OUR LATEST OFFERS",
  description = "Get launch drops, limited deals, and curated edits delivered first.",
}) => {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#111111] px-6 py-6 text-white md:px-8 md:py-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="max-w-md text-xl font-bold uppercase leading-tight tracking-tight md:text-2xl">{title}</p>
          <p className="text-sm text-white/70">{description}</p>
        </div>

        <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
          <Input
            type="email"
            placeholder="Enter your email address"
            className="min-h-[48px] border-white/10 bg-white text-sm text-[#111111] placeholder:text-[#8d857d]"
          />
          <button
            type="submit"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#111111] transition hover:bg-[#f1ece5] sm:w-auto"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};
