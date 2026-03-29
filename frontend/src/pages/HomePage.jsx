import React, { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiStar } from "react-icons/fi";
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
    description: "Fresh picks with the clean, product-first presentation from your reference.",
    filters: { sort: "newest", pagination: { page: 1, limit: 4 } },
  },
  {
    key: "topSelling",
    title: "TOP SELLING",
    description: "Best-performing pieces and essentials customers keep adding to cart.",
    filters: { bestseller: true, pagination: { page: 1, limit: 4 } },
  },
];

const styleTiles = [
  {
    title: "Casual",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
  {
    title: "Formal",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
  {
    title: "Party",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    to: "/products",
  },
  {
    title: "Gym",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
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
    Promise.all(sectionConfig.map((section) => fetchProducts(section.filters)))
      .then((responses) => {
        const nextState = {};
        responses.forEach((response, index) => {
          nextState[sectionConfig[index].key] = response.data;
        });
        setSections(nextState);
      })
      .finally(() => setLoading(false));
  }, []);

  const heroStats = useMemo(
    () => [
      { label: "200+", value: "International Brands" },
      { label: Number(metrics.activeProducts || 0).toLocaleString("en-IN"), value: "High-Quality Products" },
      { label: Number(metrics.totalOrders || 0).toLocaleString("en-IN"), value: "Happy Customers" },
    ],
    [metrics.activeProducts, metrics.totalOrders]
  );

  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Section className="pt-4 md:pt-6">
        <Card
          hover={false}
          className="overflow-hidden rounded-[28px] border border-border bg-[#f1e9df] p-0 shadow-[0_24px_60px_rgba(17,17,17,0.06)] md:rounded-[32px]"
        >
          <div className="grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <span className="inline-flex rounded-full border border-[#d8ccbc] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-textPrimary">
                  Fresh styles, daily drops
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-2xl text-3xl font-black uppercase leading-[0.95] tracking-tight text-textPrimary sm:text-4xl md:text-5xl xl:text-6xl">
                    FIND PRODUCTS THAT MATCH YOUR STYLE
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-textSecondary">
                    Clean product browsing, fashion-led presentation, and a storefront that feels closer to the
                    reference you shared while keeping the existing flow intact.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button to="/products" icon={<FiArrowRight />} className="rounded-full px-7">
                    Shop now
                  </Button>
                  <Button to="/products" variant="secondary" className="rounded-full px-7">
                    Browse catalog
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 border-t border-[#dfd3c6] pt-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.value}>
                    <p className="text-3xl font-black text-textPrimary">{stat.label}</p>
                    <p className="mt-1 text-sm text-textSecondary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-h-[320px] gap-4 md:grid-cols-[1fr_0.78fr]">
              <div className="overflow-hidden rounded-[24px] bg-white md:rounded-[28px]">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                  alt="Fashion hero"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <div className="overflow-hidden rounded-[24px] bg-white md:rounded-[28px]">
                  <img
                    src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                    alt="Fashion showcase"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[24px] bg-[#111111] p-5 text-white md:rounded-[28px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Curated edits</p>
                  <p className="mt-3 text-2xl font-bold leading-tight">Premium storefront styling with cleaner product focus.</p>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Product cards still keep the floating hover motion, but the visual language now follows the light fashion reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section className="py-10">
          <div className="overflow-hidden rounded-[26px] border border-border bg-white px-4 py-4 shadow-[0_14px_30px_rgba(17,17,17,0.04)] sm:rounded-full sm:px-5">
            <div className="grid grid-cols-2 gap-4 text-center lg:grid-cols-5">
            {(brands.length ? brands.slice(0, 5).map((brand) => brand.name) : ["Versace", "Zara", "Gucci", "Prada", "Calvin Klein"]).map((brand) => (
              <p key={brand} className="text-sm font-semibold uppercase tracking-[0.26em] text-textPrimary">
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
              title={section.title}
              description={section.description}
              action={
                <Button to="/products" variant="ghost" icon={<FiArrowRight />} className="rounded-full">
                  View all
                </Button>
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              {(sections[section.key] || []).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Section>
        ))
      )}

      <Section>
        <SectionHeader
          title="BROWSE BY DRESS STYLE"
          description="A cleaner category discovery block inspired by the visual rhythm in your reference."
        />
        <Card
          hover={false}
          className="grid gap-4 rounded-[28px] border border-border bg-white p-4 shadow-[0_18px_40px_rgba(17,17,17,0.04)] md:grid-cols-2 md:rounded-[32px]"
        >
          {styleTiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.to}
              className="group relative overflow-hidden rounded-[24px] bg-[#f3eee7]"
            >
              <img
                src={tile.image}
                alt={tile.title}
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-textPrimary">
                {tile.title}
              </div>
            </Link>
          ))}
        </Card>
      </Section>

      <Section>
        <SectionHeader
          title="OUR HAPPY CUSTOMERS"
          description="Real reviews stay visible, but the section now feels more polished and editorial."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {(testimonials.length ? testimonials.slice(0, 3) : [{ _id: "fallback-1", customerName: "Verified Buyer", comment: "Smooth checkout, clean layout, and much easier product browsing.", rating: 5 }]).map((item) => (
            <Card
              key={item._id}
              className="rounded-[28px] border border-border bg-white p-6 shadow-[0_20px_40px_rgba(17,17,17,0.04)]"
            >
              <div className="flex items-center gap-1 text-[#f5b301]">
                {Array.from({ length: 5 }, (_, index) => (
                  <FiStar key={`${item._id}-${index}`} className={index < Number(item.rating || 5) ? "fill-current" : ""} />
                ))}
              </div>
              <p className="mt-5 text-base leading-7 text-textSecondary">"{item.comment}"</p>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-textPrimary">{item.customerName}</p>
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
