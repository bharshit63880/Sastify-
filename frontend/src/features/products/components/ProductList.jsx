import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter, FiSliders, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { NewsletterBanner } from "../../../components/NewsletterBanner";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { PageWrapper } from "../../../components/ui/PageWrapper";
import { Section } from "../../../components/ui/Section";
import { ITEMS_PER_PAGE } from "../../../constants";
import { selectBrands } from "../../brands/BrandSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import {
  fetchProductsAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectProductTotalResults,
  selectProducts,
} from "../ProductSlice";
import { ProductCard } from "./ProductCard";

const sortOptions = [
  { label: "Most Popular", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Best Rated", value: "rating" },
  { label: "Discount", value: "discount" },
];

const FilterChip = ({ active, children, onClick, disabled = false }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
      "rounded-full border px-4 py-2 text-sm font-medium transition",
      active
        ? "border-[#111111] bg-[#111111] text-white"
        : "border-border bg-white text-textSecondary hover:border-[#111111] hover:text-textPrimary",
      disabled ? "cursor-not-allowed opacity-40" : "",
    ].join(" ")}
  >
    {children}
  </button>
);

const FilterPanel = ({ filters, setFilters, categories, brands, lockedCategoryId }) => (
  <div className="space-y-7">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <p className="text-lg font-semibold text-textPrimary">Filters</p>
      <FiSliders className="text-textSecondary" />
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Categories</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <FilterChip
            key={category._id}
            active={filters.category.includes(category._id)}
            disabled={Boolean(lockedCategoryId && category._id !== lockedCategoryId)}
            onClick={() => {
              if (lockedCategoryId) {
                return;
              }

              setFilters((prev) => ({
                ...prev,
                category: prev.category.includes(category._id)
                  ? prev.category.filter((item) => item !== category._id)
                  : [...prev.category, category._id],
              }));
            }}
          >
            {category.name}
          </FilterChip>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Brands</p>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <FilterChip
            key={brand._id}
            active={filters.brand.includes(brand._id)}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                brand: prev.brand.includes(brand._id)
                  ? prev.brand.filter((item) => item !== brand._id)
                  : [...prev.brand, brand._id],
              }))
            }
          >
            {brand.name}
          </FilterChip>
        ))}
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      <Input
        label="Min price"
        type="number"
        value={filters.priceRange[0]}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, priceRange: [Number(event.target.value || 0), prev.priceRange[1]] }))
        }
      />
      <Input
        label="Max price"
        type="number"
        value={filters.priceRange[1]}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, priceRange: [prev.priceRange[0], Number(event.target.value || 0)] }))
        }
      />
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Rating</p>
      <div className="flex flex-wrap gap-2">
        {[4, 3, 2].map((rating) => (
          <FilterChip
            key={rating}
            active={filters.rating === rating}
            onClick={() => setFilters((prev) => ({ ...prev, rating: prev.rating === rating ? 0 : rating }))}
          >
            {rating}+ Stars
          </FilterChip>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Discount</p>
      <div className="flex flex-wrap gap-2">
        {[10, 25, 40].map((discount) => (
          <FilterChip
            key={discount}
            active={filters.discount === discount}
            onClick={() => setFilters((prev) => ({ ...prev, discount: prev.discount === discount ? 0 : discount }))}
          >
            {discount}% or More
          </FilterChip>
        ))}
      </div>
    </div>

    <label className="flex items-center gap-3 rounded-[22px] border border-border bg-[#faf7f2] px-4 py-3 text-sm text-textPrimary">
      <input
        type="checkbox"
        checked={filters.inStock}
        onChange={(event) => setFilters((prev) => ({ ...prev, inStock: event.target.checked }))}
        className="h-4 w-4 rounded border-border accent-black"
      />
      In stock only
    </label>
  </div>
);

export const ProductList = ({
  title = "CASUAL",
  description = "Explore the catalog in a cleaner, more fashion-led grid with the same product data and flows.",
  baseFilters = {},
}) => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults);
  const productFetchStatus = useSelector(selectProductFetchStatus);
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: baseFilters.category || [],
    brand: [],
    priceRange: [0, 250000],
    rating: 0,
    discount: 0,
    inStock: false,
  });

  const normalizedBaseFilters = baseFilters;
  const normalizedBaseCategory = useMemo(() => normalizedBaseFilters.category || [], [normalizedBaseFilters]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: normalizedBaseCategory,
    }));
    setPage(1);
  }, [normalizedBaseCategory]);

  useEffect(() => {
    dispatch(
      fetchProductsAsync({
        ...normalizedBaseFilters,
        category: filters.category,
        brand: filters.brand,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        rating: filters.rating || undefined,
        discount: filters.discount || undefined,
        inStock: filters.inStock || undefined,
        pagination: { page, limit: ITEMS_PER_PAGE },
        sort,
      })
    );

    return () => {
      dispatch(resetProductFetchStatus());
    };
  }, [dispatch, filters, normalizedBaseFilters, page, sort]);

  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  const activeChips = useMemo(() => {
    const chips = [];

    filters.category.forEach((categoryId) => {
      const category = categories.find((item) => item._id === categoryId);
      if (category) {
        chips.push({ key: `category-${categoryId}`, label: category.name });
      }
    });

    filters.brand.forEach((brandId) => {
      const brand = brands.find((item) => item._id === brandId);
      if (brand) {
        chips.push({ key: `brand-${brandId}`, label: brand.name });
      }
    });

    if (filters.rating) {
      chips.push({ key: "rating", label: `${filters.rating}+ stars` });
    }

    if (filters.discount) {
      chips.push({ key: "discount", label: `${filters.discount}% off` });
    }

    if (filters.inStock) {
      chips.push({ key: "stock", label: "In stock" });
    }

    return chips;
  }, [brands, categories, filters]);

  const pageButtons = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const resetFilters = () =>
    setFilters({
      category: normalizedBaseCategory,
      brand: [],
      priceRange: [0, 250000],
      rating: 0,
      discount: 0,
      inStock: false,
    });

  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Section className="pt-4">
        <Card
          hover={false}
          className="rounded-[28px] border border-border bg-white px-5 py-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:px-6 sm:py-7 md:rounded-[32px] lg:px-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-textSecondary">Category page</p>
              <h1 className="text-3xl font-black uppercase tracking-tight text-textPrimary sm:text-4xl">{title}</h1>
              <p className="max-w-2xl text-base leading-7 text-textSecondary">{description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#f8f4ee] px-4 py-2 text-sm font-medium text-textPrimary">
                {totalResults} products
              </span>
              <Button
                variant="secondary"
                icon={<FiFilter />}
                className="rounded-full xl:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                Filters
              </Button>
            </div>
          </div>
        </Card>
      </Section>

      <Section className="pt-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="hidden w-full max-w-[290px] xl:block">
            <Card
              hover={false}
              className="sticky top-28 rounded-[28px] border border-border bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
            >
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                brands={brands}
                lockedCategoryId={baseFilters.category?.[0]}
              />
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <Card
              hover={false}
              className="rounded-[28px] border border-border bg-white px-4 py-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:px-5 md:px-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <span key={chip.key} className="rounded-full border border-border bg-[#faf7f2] px-4 py-2 text-sm text-textPrimary">
                      {chip.label}
                    </span>
                  ))}
                  {activeChips.length ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-full px-4 py-2 text-sm font-medium text-textSecondary transition hover:text-textPrimary"
                    >
                      Clear all
                    </button>
                  ) : (
                    <span className="text-sm text-textSecondary">Use filters to narrow the catalog.</span>
                  )}
                </div>

                <div className="w-full sm:w-[240px]">
                  <Input as="select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Input>
                </div>
              </div>
            </Card>

            {productFetchStatus === "pending" ? (
              <LoadingState />
            ) : products.length ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    className="rounded-full"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  {pageButtons.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={[
                        "inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
                        pageNumber === page
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-border bg-white text-textPrimary hover:border-[#111111]",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <Button
                    variant="secondary"
                    disabled={page === totalPages}
                    className="rounded-full"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                title="No products matched these filters"
                description="Try clearing a few filters or widening your price range to see more results."
                actionLabel="Browse all products"
                actionTo="/products"
              />
            )}
          </div>
        </div>
      </Section>

      <Section className="pb-4">
        <NewsletterBanner />
      </Section>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm xl:hidden"
          >
            <motion.div
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 32, opacity: 0 }}
              className="ml-auto h-full w-full max-w-sm border-l border-border bg-[#f4efe8] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-lg font-semibold text-textPrimary">Filters</p>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-textPrimary"
                >
                  <FiX />
                </button>
              </div>
              <Card hover={false} className="rounded-[28px] border border-border bg-white p-5">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  brands={brands}
                  lockedCategoryId={baseFilters.category?.[0]}
                />
              </Card>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageWrapper>
  );
};
