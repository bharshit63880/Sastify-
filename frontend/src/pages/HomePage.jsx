import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
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

const getShowcaseCategories = (roots = []) => {
  const picked = [];

  const pushUnique = (category) => {
    if (!category || picked.some((item) => String(item._id) === String(category._id))) {
      return;
    }

    picked.push(category);
  };

  roots.forEach((root) => pushUnique(root));

  roots.forEach((root) => {
    if (!root.children.length) {
      pushUnique(root);
      return;
    }

    root.children.forEach((child) => {
      if (child.children.length) {
        child.children.slice(0, 2).forEach((leaf) => pushUnique(leaf));
        return;
      }

      pushUnique(child);
    });
  });

  return picked.slice(0, 12);
};

const getProductImage = (product) =>
  product?.thumbnail || product?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80";

const ProductShelf = ({ eyebrow, title, products, loading }) => (
  <Section className="py-5 md:py-6">
    <div className="rounded-[32px] border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-border bg-surface px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
            {eyebrow}
          </span>
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-textPrimary sm:text-[2.2rem]">{title}</h2>
        </div>
        <Button to="/products" variant="ghost" icon={<FiArrowRight />}>
          View all
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : products.length ? (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {products.slice(0, 10).map((product) => (
            <div key={product._id} className="w-[252px] min-w-[252px] shrink-0 sm:w-[272px] sm:min-w-[272px]">
              <ProductCard product={product} />
            </div>
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
  const showcaseCategories = useMemo(() => getShowcaseCategories(categoryRoots), [categoryRoots]);

  const primaryBanner = homeData.banners[0];
  const heroLabel = "Fresh marketplace edit";
  const heroTitle =
    primaryBanner?.title && primaryBanner.title.length <= 44
      ? primaryBanner.title
      : "Shop cleaner picks across every category";
  const heroImage =
    primaryBanner?.image ||
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80";

  const trendingProducts = getShelfProducts(homeData.sections.trending, homeData.sections.newArrivals);
  const dealProducts = getShelfProducts(homeData.sections.dealsOfDay, homeData.sections.bestSellers);
  const bestSellerProducts = getShelfProducts(homeData.sections.bestSellers, homeData.sections.trending);
  const heroProducts = useMemo(
    () => [...trendingProducts, ...dealProducts, ...bestSellerProducts].filter(Boolean).slice(0, 3),
    [bestSellerProducts, dealProducts, trendingProducts]
  );

  return (
    <PageWrapper className="py-4 md:py-6">
      <Section className="py-4">
        <div className="overflow-hidden rounded-[36px] border border-border bg-white shadow-card">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center px-6 py-7 sm:px-8 lg:px-10 lg:py-9">
           
              <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-[-0.06em] text-textPrimary sm:text-[3.3rem]">
                {heroTitle}
              </h1>
              <Button to="/products" icon={<FiArrowRight />} className="mt-7 w-fit">
                Shop now
              </Button>
            </div>

            <div className="grid gap-3 border-t border-border bg-surface p-4 sm:grid-cols-[1.1fr_0.9fr] lg:border-l lg:border-t-0 lg:p-5">
              <motion.div
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="overflow-hidden rounded-[28px] bg-white"
              >
                <img src={heroImage} alt={heroTitle} className="h-[300px] w-full object-cover sm:h-full" />
              </motion.div>

              <div className="grid gap-3">
                {heroProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.05, ease: "easeOut" }}
                  >
                    <Link
                      to={`/products/${product.slug || product._id}`}
                      className="flex items-center gap-3 rounded-[24px] border border-border bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name || product.title}
                        className="h-20 w-20 rounded-[18px] object-cover"
                      />
                      <div className="min-w-0 space-y-1">
                        <p className="line-clamp-2 text-sm font-semibold text-textPrimary">
                          {product.name || product.title}
                        </p>
                        <p className="text-sm text-textSecondary">Explore now</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {showcaseCategories.length ? (
        <Section className="py-4">
          <div className="rounded-[32px] border border-border bg-white p-4 shadow-card sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-border bg-surface px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                  Categories
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-textPrimary sm:text-3xl">
                  Browse by category
                </h2>
              </div>
            </div>

            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              {showcaseCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
                  className="w-[156px] min-w-[156px] shrink-0 sm:w-[180px] sm:min-w-[180px]"
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

      <ProductShelf eyebrow="Trending" title="Trending now" products={trendingProducts} loading={loading} />
      <ProductShelf eyebrow="Top deals" title="Top deals" products={dealProducts} loading={loading} />
      <ProductShelf eyebrow="Best sellers" title="Best sellers" products={bestSellerProducts} loading={loading} />
    </PageWrapper>
  );
};
