import React from "react";
import { FiArrowUpRight, FiInstagram, FiRefreshCw, FiShield, FiStar, FiTruck, FiTwitter } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
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
    { icon: <FiStar />, label: `${Number(metrics.publishedReviews || 0).toLocaleString("en-IN")} reviews` },
  ];

  return (
    <footer className="relative mt-16 sm:mt-20">
      <Container className="pb-10">
        <div className="glass-card overflow-hidden rounded-[34px] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <p className="bg-button-gradient bg-clip-text text-3xl font-black tracking-tight text-transparent">Sastify</p>
                <p className="mt-3 max-w-md text-sm leading-7 text-textSecondary">
                  A premium commerce interface shaped with glass surfaces, soft depth, and calmer shopping flows.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {badges.map((item) => (
                  <div key={item.label} className="rounded-[20px] border border-white/60 bg-white/70 px-4 py-3 text-sm text-textSecondary shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-button-gradient text-white">
                      {item.icon}
                    </div>
                    <p>{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/60 bg-white/68 p-4 shadow-[0_10px_26px_rgba(17,17,17,0.06)]">
                <p className="text-sm font-semibold text-textPrimary">Stay in the loop</p>
                <p className="mt-1 text-sm text-textSecondary">Get launch drops, pricing updates, and editorial picks.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Input placeholder="Enter your email" className="rounded-full" />
                  <Button className="rounded-full px-6">Subscribe</Button>
                </div>
              </div>
            </div>

            {columns.map((column) => (
              <div key={column.title} className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">{column.title}</p>
                <div className="space-y-3">
                  {column.links.map((item) => (
                    <Link key={item.label} to={item.to} className="group flex items-center gap-2 text-sm text-textSecondary transition hover:text-textPrimary">
                      <span className="relative after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-full after:origin-center after:scale-x-0 after:bg-current after:transition after:duration-300 group-hover:after:scale-x-100">
                        {item.label}
                      </span>
                      <FiArrowUpRight className="text-xs opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-black/5 pt-6 text-sm text-textSecondary md:flex-row md:items-center md:justify-between">
            <p>© 2026 Sastify Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {[FiInstagram, FiTwitter].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/70 text-textPrimary shadow-[0_10px_24px_rgba(17,17,17,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(200,139,74,0.18)]"
                >
                  <Icon />
                </button>
              ))}
              <span className="pl-2">
                support@sastify.com · {Number(metrics.averageRating || 0).toFixed(1)} average rating
              </span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
