import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiStar, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { NewsletterBanner } from "../components/NewsletterBanner";
import { LoadingState } from "../components/LoadingState";
import { SectionHeader } from "../components/SectionHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageWrapper } from "../components/ui/PageWrapper";
import { Section } from "../components/ui/Section";
import { selectBrands } from "../features/brands/BrandSlice";
import { fetchProducts } from "../features/products/ProductApi";
import { ProductCard } from "../features/products/components/ProductCard";
import { selectStorefrontMetrics, selectStorefrontTestimonials } from "../features/storefront/StorefrontSlice";

const sectionConfig = [
  {
    key: "newArrivals",
    title: "NEW ARRIVALS",
    description: "Fresh drops presented with a cleaner premium retail layout.",
    filters: { sort: "newest", pagination: { page: 1, limit: 4 } },
  },
  {
    key: "topSelling",
    title: "TOP SELLING",
    description: "Most-shopped picks that customers keep returning to.",
    filters: { bestseller: true, pagination: { page: 1, limit: 4 } },
  },
];

const styleTiles = [
  {
    title: "Casual Layers",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
  {
    title: "Structured Formal",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
  {
    title: "Evening Drop",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
  {
    title: "Active Motion",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
];

export const HomePage = () => {
  const brands = useSelector(selectBrands);
  const metrics = useSelector(selectStorefrontMetrics);
  const testimonials = useSelector(selectStorefrontTestimonials);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    Promise.all(sectionConfig.map((section) => fetchProducts(section.filters)))
      .then((responses) => {
        if (!isActive) return;
        const nextState = {};
        responses.forEach((response, index) => {
          nextState[sectionConfig[index].key] = response.data;
        });
        setSections(nextState);
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const heroStats = useMemo(
    () => [
      { label: Number(metrics.activeProducts || 0).toLocaleString("en-IN"), value: "Premium products" },
      { label: Number(metrics.totalOrders || 0).toLocaleString("en-IN"), value: "Verified orders" },
      { label: `${Number(metrics.averageRating || 0).toFixed(1)}/5`, value: "Average satisfaction" },
    ],
    [metrics.activeProducts, metrics.averageRating, metrics.totalOrders]
  );

  const featuredBrands = brands.length ? brands.slice(0, 6).map((brand) => brand.name) : ["Aajanta", "Ambrane", "Bajaj", "Bata India", "Biotique", "Zebronics"];

  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Section className="pt-4">
        <Card hover={false} className="noise-overlay overflow-hidden rounded-[36px] bg-white/56 p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <span className="inline-flex rounded-full border border-white/70 bg-white/78 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-textPrimary shadow-[0_10px_26px_rgba(17,17,17,0.06)]">
                  Premium commerce, softer motion
                </span>
                <div className="space-y-4">
                  <h1 className="hero-title max-w-3xl">
                    FIND PRODUCTS THAT FEEL MODERN, CURATED, AND WORTH EXPLORING.
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-textSecondary">
                    A lighter glassmorphism storefront with calmer spacing, layered depth, and richer product presentation while preserving the existing ecommerce flow.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button to="/products" icon={<FiArrowRight />} className="rounded-full px-7">
                    Shop the catalog
                  </Button>
                  <Button to="/products?sort=newest" variant="secondary" className="rounded-full px-7">
                    Explore new arrivals
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 border-t border-black/5 pt-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.value} className="rounded-[24px] border border-white/60 bg-white/58 p-4 shadow-[0_12px_30px_rgba(17,17,17,0.05)]">
                    <p className="text-3xl font-black tracking-tight text-textPrimary">{stat.label}</p>
                    <p className="mt-2 text-sm text-textSecondary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-h-[420px] gap-4 md:grid-cols-[1fr_0.78fr]">
              <motion.div whileHover={{ y: -8 }} className="overflow-hidden rounded-[30px] border border-white/60 bg-white/70 shadow-[0_18px_44px_rgba(17,17,17,0.08)]">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                  alt="Fashion hero"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </motion.div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <motion.div whileHover={{ y: -8 }} className="overflow-hidden rounded-[30px] border border-white/60 bg-white/70 shadow-[0_18px_44px_rgba(17,17,17,0.08)]">
                  <img
                    src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                    alt="Style showcase"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </motion.div>
                <div className="glass-dark rounded-[30px] p-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    <FiZap />
                    Editorial mode
                  </span>
                  <p className="mt-5 text-3xl font-black leading-tight tracking-tight">
                    Soft glass layers with high-trust product focus.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/72">
                    The storefront now leans into premium dashboard polish while still behaving like familiar ecommerce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section className="py-8">
        <div className="glass-card overflow-hidden rounded-[34px] px-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3 lg:grid-cols-6">
            {featuredBrands.map((brand) => (
              <p key={brand} className="text-sm font-semibold uppercase tracking-[0.28em] text-textPrimary">
                {brand}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {loading ? (
        <Section className="pt-6">
          <LoadingState />
        </Section>
      ) : (
        sectionConfig.map((section) => (
          <Section key={section.key} className="pt-4">
            <SectionHeader
              eyebrow="Curated rail"
              title={section.title}
              description={section.description}
              action={
                <Button to="/products" variant="ghost" icon={<FiArrowRight />} className="rounded-full">
                  View all
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(sections[section.key] || []).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Section>
        ))
      )}

      <Section>
        <SectionHeader
          eyebrow="Shop by mood"
          title="BROWSE BY STYLE"
          description="Editorial category blocks with stronger contrast, softer motion, and mobile-first spacing."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {styleTiles.map((tile, index) => (
            <Link key={tile.title} to={tile.to} className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white/60 shadow-[0_18px_46px_rgba(17,17,17,0.08)]">
              <img
                src={tile.image}
                alt={tile.title}
                className="h-60 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-72"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                    0{index + 1}
                  </span>
                  <p className="mt-3 text-2xl font-black tracking-tight text-white">{tile.title}</p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-xl">
                  <FiArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Customer signal"
          title="OUR HAPPY CUSTOMERS"
          description="Real reviews with slightly more editorial layout and elevated premium contrast."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {(testimonials.length
            ? testimonials.slice(0, 3)
            : [{ _id: "fallback-1", customerName: "Verified Buyer", comment: "Smooth checkout, clean layout, and much easier product browsing.", rating: 5 }]).map((item) => (
            <Card key={item._id} className="rounded-[30px] p-6">
              <div className="flex items-center gap-1 text-[#f5b301]">
                {Array.from({ length: 5 }, (_, index) => (
                  <FiStar key={`${item._id}-${index}`} className={index < Number(item.rating || 5) ? "fill-current" : ""} />
                ))}
              </div>
              <p className="mt-5 text-base leading-8 text-textSecondary">"{item.comment}"</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">{item.customerName}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pb-4">
        <NewsletterBanner />
      </Section>
    </PageWrapper>
  );
};
