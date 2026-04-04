import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { SectionHeader } from "../components/SectionHeader";
import { Button } from "../components/ui/Button";
import { PageWrapper } from "../components/ui/PageWrapper";
import { Section } from "../components/ui/Section";
import { ProductCard } from "../features/products/components/ProductCard";
import { fetchStorefrontHome } from "../features/storefront/StorefrontApi";
import { buildCategoryTree, getCategoryHref } from "../utils/categoryTree";
import { CategoryGlyph } from "../utils/categoryPresentation";

const emptyHome = {
  banners: [],
  categories: [],
  sections: {
    trending: [],
    bestSellers: [],
    newArrivals: [],
    dealsOfDay: [],
  },
};

const getShelfProducts = (primary, fallback = []) => (primary.length ? primary : fallback);

const ProductShelf = ({ eyebrow, title, products, loading }) => (
  <Section>
    <div className="rounded-[34px] border border-border bg-white p-5 shadow-card sm:p-6">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        action={
          <Button to="/products" variant="ghost" icon={<FiArrowRight />}>
            View all
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : products.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : null}
    </div>
  </Section>
);

export const HomePage = () => {
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

  const { roots: categoryRoots } = useMemo(() => buildCategoryTree(homeData.categories), [homeData.categories]);
  const rootCategories = categoryRoots.slice(0, 6);

  const primaryBanner = homeData.banners[0];
  const heroLabel = "Limited-time offer";
  const heroTitle =
    primaryBanner?.title && primaryBanner.title.length <= 46
      ? primaryBanner.title
      : "Up to 40% off premium essentials";
  const heroImage =
    primaryBanner?.image ||
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80";

  const trendingProducts = getShelfProducts(homeData.sections.trending, homeData.sections.newArrivals);
  const dealProducts = getShelfProducts(homeData.sections.dealsOfDay, homeData.sections.bestSellers);
  const bestSellerProducts = getShelfProducts(homeData.sections.bestSellers, homeData.sections.trending);

  return (
    <PageWrapper className="py-6 md:py-8">
      <Section className="pt-2">
        <div className="overflow-hidden rounded-[36px] border border-border bg-white shadow-card">
          <div className="grid min-h-[320px] gap-0 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
              <span className="inline-flex w-fit rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">
                {heroLabel}
              </span>
              <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-[-0.05em] text-textPrimary sm:text-5xl">
                {heroTitle}
              </h1>
              <Button to="/products" icon={<FiArrowRight />} className="mt-7 w-fit">
                Shop now
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative min-h-[240px] lg:min-h-full"
            >
              <img src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
            </motion.div>
          </div>
        </div>
      </Section>

      {rootCategories.length ? (
        <Section className="pt-3">
          <div className="rounded-[32px] border border-border bg-white p-4 shadow-card sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {rootCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
                >
                  <Link
                    to={getCategoryHref(category)}
                    className="group flex h-full flex-col items-center justify-center gap-3 rounded-[24px] border border-border bg-surface px-4 py-5 text-center transition duration-200 hover:scale-[1.03] hover:bg-white hover:shadow-card"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-textPrimary shadow-[0_10px_24px_rgba(17,17,17,0.06)] transition group-hover:bg-primary group-hover:text-white">
                      <CategoryGlyph category={category} className="text-lg" />
                    </span>
                    <span className="text-sm font-semibold text-textPrimary">{category.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <ProductShelf eyebrow="Trending" title="Trending" products={trendingProducts} loading={loading} />
      <ProductShelf eyebrow="Top deals" title="Top Deals" products={dealProducts} loading={loading} />
      <ProductShelf eyebrow="Best sellers" title="Best Sellers" products={bestSellerProducts} loading={loading} />
    </PageWrapper>
  );
};
