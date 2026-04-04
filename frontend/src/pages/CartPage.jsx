import React from "react";
import { PageWrapper } from "../components/ui/PageWrapper";
import { Section } from "../components/ui/Section";
import { Cart } from "../features/cart/components/Cart";

export const CartPage = () => {
  return (
    <PageWrapper className="py-6 md:py-8">
      <Section className="pt-2">
        <div className="rounded-[36px] border border-border bg-white px-6 py-6 shadow-card lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">Cart</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-textPrimary sm:text-4xl">Review your order</h1>
          <p className="mt-3 body-copy max-w-2xl">
            Keep the checkout flow focused: adjust quantities, remove items, and confirm the final total.
          </p>
        </div>
      </Section>

      <Section className="pt-4">
        <Cart />
      </Section>
    </PageWrapper>
  );
};
