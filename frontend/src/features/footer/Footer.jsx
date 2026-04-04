import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";

const footerLinks = [
  { label: "Shop", to: "/products" },
  { label: "Categories", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Profile", to: "/account" },
];

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border/80">
      <Container className="py-10">
        <div className="flex flex-col gap-8 rounded-[32px] border border-border bg-white px-6 py-8 shadow-card lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-xl space-y-3">
            <Link to="/" className="text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
              Sastify
            </Link>
            <p className="body-copy max-w-lg">
              Minimal commerce for people who want a faster path from discovery to checkout.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <div className="flex flex-wrap gap-5 text-sm text-textSecondary">
              {footerLinks.map((item) => (
                <Link key={item.label} to={item.to} className="transition hover:text-textPrimary">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-sm text-textSecondary">Ready to browse the catalog?</span>
              <Button to="/products">Start shopping</Button>
            </div>
            <p className="text-sm text-textSecondary">© 2026 Sastify. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
};
