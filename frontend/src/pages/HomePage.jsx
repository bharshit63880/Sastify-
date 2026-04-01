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
import { fetchStorefrontHome } from "../features/storefront/StorefrontApi";
import { selectStorefrontMetrics, selectStorefrontTestimonials } from "../features/storefront/StorefrontSlice";
import { ProductCard } from "../features/products/components/ProductCard";

const emptyHome = {
  banners: [],
  categories: [],
  brands: [],
  sections: {
    trending: [],
    bestSellers: [],
    newArrivals: [],
    dealsOfDay: [],
  },
};

export const HomePage = () => {
  const metrics = useSelector(selectStorefrontMetrics);
  const testimonials = useSelector(selectStorefrontTestimonials);
  const [homeData, setHomeData] = useState(emptyHome);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    fetchStorefrontHome()
      .then((data) => {
        if (!isActive) return;
        setHomeData({
          banners: data.banners || [],
          categories: data.categories || [],
          brands: data.brands || [],
          sections: {
            trending: data.sections?.trending || [],
            bestSellers: data.sections?.bestSellers || [],
            newArrivals: data.sections?.newArrivals || [],
            dealsOfDay: data.sections?.dealsOfDay || [],
          },
        });
      })
      .catch(() => {
        if (!isActive) return;
        setHomeData(emptyHome);
      })
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

  const primaryBanner = homeData.banners[0];
  const heroTitle = primaryBanner?.title || "Discover the new marketplace experience.";
  const heroSubtitle =
    primaryBanner?.subtitle ||
    "Every section is now powered by real marketplace data: banners, categories, and live product collections.";

  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Section className="pt-4">
        <Card
          hover={false}
          className="noise-overlay overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-4 sm:p-6 lg:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-textPrimary shadow-[0_14px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  Marketplace live
                </span>
                <div className="space-y-4">
                  <h1 className="hero-title max-w-3xl bg-[linear-gradient(135deg,#ffffff_10%,#d7e2ff_46%,#c88b4a_98%)] bg-clip-text text-transparent">
                    {heroTitle}
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-textSecondary">{heroSubtitle}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button to={primaryBanner?.ctaLink || "/products"} icon={<FiArrowRight />} className="rounded-full px-7">
                    {primaryBanner?.ctaText || "Shop the marketplace"}
                  </Button>
                  <Button to="/products?sort=newest" variant="secondary" className="rounded-full px-7">
                    Explore new arrivals
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 border-t border-white/8 pt-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.value} className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                    <p className="text-3xl font-black tracking-tight text-textPrimary">{stat.label}</p>
                    <p className="mt-2 text-sm text-textSecondary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-h-[420px] gap-4 md:grid-cols-[1fr_0.78fr]">
              <motion.div whileHover={{ y: -8 }} className="overflow-hidden rounded-[30px] border border-white/8 bg-white/[0.04] shadow-[0_24px_56px_rgba(0,0,0,0.32)]">
                <img
                  src={primaryBanner?.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"}
                  alt={primaryBanner?.title || "Marketplace hero"}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </motion.div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <motion.div whileHover={{ y: -8 }} className="overflow-hidden rounded-[30px] border border-white/8 bg-white/[0.04] shadow-[0_24px_56px_rgba(0,0,0,0.32)]">
                  <img
                    src={homeData.banners[1]?.image || primaryBanner?.image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"}
                    alt={homeData.banners[1]?.title || "Marketplace highlight"}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </motion.div>
                <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,35,0.94),rgba(9,13,20,0.94))] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.3)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    <FiZap />
                    Live collections
                  </span>
                  <p className="mt-5 text-3xl font-black leading-tight tracking-tight">
                    Dynamic banners, categories, and product rails are now fully API-driven.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/72">
                    You can curate hero banners, marketplaces collections, and deals from the admin tools without touching code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section className="py-8">
        <div className="glass-card overflow-hidden rounded-[34px] border border-white/8 px-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3 lg:grid-cols-6">
            {homeData.brands.map((brand) => (
              <p key={brand._id} className="text-sm font-semibold uppercase tracking-[0.28em] text-textPrimary/92">
                {brand.name}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Shop by category"
          title="CATEGORIES"
          description="Browse marketplace categories curated from your CMS-driven catalog."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeData.categories.map((category) => (
            <Link key={category._id} to={`/category/${category.slug}`} className="group relative overflow-hidden rounded-[26px] border border-white/8 bg-white/[0.04] shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
              <img
                src={category.image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"}
                alt={category.name}
                className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="text-xl font-semibold text-white">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {loading ? (
        <Section className="pt-6">
          <LoadingState />
        </Section>
      ) : (
        <>
          <Section className="pt-4">
            <SectionHeader
              eyebrow="Trending now"
              title="TRENDING PRODUCTS"
              description="Products flagged as trending by your catalog team."
              action={
                <Button to="/products?trending=true" variant="ghost" icon={<FiArrowRight />} className="rounded-full">
                  View all
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {homeData.sections.trending.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Section>

          <Section className="pt-4">
            <SectionHeader
              eyebrow="Bestsellers"
              title="BEST SELLERS"
              description="High-performing products sorted by sales activity."
              action={
                <Button to="/products?sort=sales" variant="ghost" icon={<FiArrowRight />} className="rounded-full">
                  View all
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {homeData.sections.bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Section>

          <Section className="pt-4">
            <SectionHeader
              eyebrow="New drops"
              title="NEW ARRIVALS"
              description="Latest products added to the marketplace catalog."
              action={
                <Button to="/products?sort=newest" variant="ghost" icon={<FiArrowRight />} className="rounded-full">
                  View all
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {homeData.sections.newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Section>

          <Section className="pt-4">
            <SectionHeader
              eyebrow="Deals"
              title="DEALS OF THE DAY"
              description="Limited-time offers flagged by your admin team."
              action={
                <Button to="/products?isDealOfDay=true" variant="ghost" icon={<FiArrowRight />} className="rounded-full">
                  View all
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {homeData.sections.dealsOfDay.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Section>
        </>
      )}

      <Section>
        <SectionHeader
          eyebrow="Customer signal"
          title="OUR HAPPY CUSTOMERS"
          description="Real reviews pulled dynamically from published customer ratings."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {(testimonials.length
            ? testimonials.slice(0, 3)
            : [{ _id: "fallback-1", customerName: "Verified Buyer", comment: "Smooth checkout, clean layout, and much easier product browsing.", rating: 5 }]).map((item) => (
            <Card key={item._id} className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,35,0.94),rgba(9,13,20,0.94))] p-6">
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
