import React from "react";
import { NewsletterBanner } from "../components/NewsletterBanner";
import { Card } from "../components/ui/Card";
import { PageWrapper } from "../components/ui/PageWrapper";
import { Section } from "../components/ui/Section";
import { Cart } from "../features/cart/components/Cart";

export const CartPage = () => {
  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Section className="pt-4">
        <Card
          hover={false}
          className="rounded-[28px] border border-border bg-white px-5 py-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:px-6 sm:py-7 md:rounded-[32px] lg:px-8"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-textSecondary">Cart</p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-textPrimary sm:text-4xl">YOUR CART</h1>
            <p className="max-w-2xl text-base leading-7 text-textSecondary">
              Review your items, update quantities, and continue to checkout with the cleaner storefront layout.
            </p>
          </div>
        </Card>
      </Section>

      <Section className="pt-8">
        <Cart />
      </Section>

      <Section className="pb-4">
        <NewsletterBanner />
      </Section>
    </PageWrapper>
  );
};
