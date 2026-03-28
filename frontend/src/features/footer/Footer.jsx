import React from "react";
import { FiArrowUpRight, FiRefreshCw, FiShield, FiStar, FiTruck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container } from "../../components/ui/Container";
import { selectStorefrontMetrics } from "../storefront/StorefrontSlice";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "Cart", to: "/cart" },
      { label: "Wishlist", to: "/wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My account", to: "/account" },
      { label: "My orders", to: "/orders" },
      { label: "Track your order", to: "/orders" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Search products", to: "/search" },
      { label: "New arrivals", to: "/products?sort=newest" },
      { label: "Best rated", to: "/products?sort=rating" },
    ],
  },
];

export const Footer = () => {
  const metrics = useSelector(selectStorefrontMetrics);

  const badges = [
    { icon: <FiShield />, label: `${Number(metrics.activeProducts || 0).toLocaleString("en-IN")} active products` },
    { icon: <FiTruck />, label: `${Number(metrics.activeCategories || 0).toLocaleString("en-IN")} live categories` },
    { icon: <FiRefreshCw />, label: `${Number(metrics.totalOrders || 0).toLocaleString("en-IN")} orders recorded` },
    { icon: <FiStar />, label: `${Number(metrics.publishedReviews || 0).toLocaleString("en-IN")} customer reviews` },
  ];

  return (
    <footer className="mt-14 border-t border-border bg-[#fbf8f4] sm:mt-16 lg:mt-20">
      <Container className="py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="space-y-5">
            <div>
              <p className="text-2xl font-semibold text-textPrimary">Sastify</p>
              <p className="mt-3 max-w-md text-sm leading-7 text-textSecondary">
                A premium marketplace interface for transparent pricing, fast product discovery, and trustworthy post-purchase flows.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {badges.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-textSecondary"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-textSecondary">{column.title}</p>
              <div className="space-y-3">
                {column.links.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group flex items-center gap-2 text-sm text-textSecondary transition hover:text-textPrimary"
                  >
                    {item.label}
                    <FiArrowUpRight className="text-xs opacity-0 transition group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-textSecondary md:mt-12 md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left">© 2026 Sastify Marketplace. All rights reserved.</p>
          <p className="text-center leading-7 md:text-right">
            support@sastify.com · 1800-000-2026 · Bengaluru, India · {Number(metrics.averageRating || 0).toFixed(1)} average rating
          </p>
        </div>
      </Container>
    </footer>
  );
};
