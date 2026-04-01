import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter, FiSliders, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
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
import { fetchProducts } from "../ProductApi";
import { ProductCard } from "./ProductCard";

const sortOptions = [
  { label: "Most Popular", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Best Rated", value: "rating" },
  { label: "Discount", value: "discount" },
  { label: "Best Sellers", value: "sales" },
];

const EMPTY_BASE_FILTERS = Object.freeze({});

const FilterChip = ({ active, children, onClick, disabled = false }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
      "rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition duration-300",
      active
        ? "border-accent/40 bg-[linear-gradient(135deg,rgba(200,139,74,0.24),rgba(104,138,255,0.18))] text-white shadow-[0_14px_32px_rgba(200,139,74,0.14)]"
        : "border-white/10 bg-white/[0.04] text-textSecondary hover:border-accent/25 hover:bg-white/[0.06] hover:text-textPrimary",
      disabled ? "cursor-not-allowed opacity-40" : "",
    ].join(" ")}
  >
    {children}
  </button>
);

const FilterPanel = ({ filters, setFilters, categories, brands, availableBrands, lockedCategoryId }) => (
  <div className="space-y-7">
    <div className="flex items-center justify-between border-b border-white/8 pb-4">
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
                category: prev.category.includes(category._id) ? [] : [category._id],
              }));
            }}
          >
            {category.name}
          </FilterChip>
        ))}
      </div>
      <p className="text-xs text-textSecondary">Pick one category to keep the catalog clean and focused.</p>
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Brands</p>
      {filters.category.length ? (
        <div className="flex flex-wrap gap-2">
          {availableBrands.length ? (
            availableBrands.map((brand) => (
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
            ))
          ) : (
            <p className="text-xs text-textSecondary">No brands found for this category.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-textSecondary">Select a category to reveal matching brands.</p>
      )}
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

    <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-textPrimary backdrop-blur-xl">
      <input
        type="checkbox"
        checked={filters.inStock}
        onChange={(event) => setFilters((prev) => ({ ...prev, inStock: event.target.checked }))}
        className="h-4 w-4 rounded border-white/20 accent-accent"
      />
      In stock only
    </label>
  </div>
);

export const ProductList = ({
  title = "CATALOG",
  description = "Explore a darker cinematic product grid with glass filters, quieter motion, and stronger product focus.",
  baseFilters,
}) => {
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [productFetchStatus, setProductFetchStatus] = useState("idle");
  const stableBaseFilters = useMemo(
    () => baseFilters || EMPTY_BASE_FILTERS,
    [baseFilters]
  );
  const normalizedBaseCategory = useMemo(
    () => (Array.isArray(stableBaseFilters?.category) ? stableBaseFilters.category : []),
    [stableBaseFilters]
  );
  const baseCategoryKey = normalizedBaseCategory.join("|");
  const baseSearch = stableBaseFilters?.search || "";
  const [filters, setFilters] = useState({
    category: normalizedBaseCategory,
    brand: [],
    priceRange: [0, 250000],
    rating: 0,
    discount: 0,
    inStock: false,
  });
  const filtersKey = JSON.stringify(filters);
  const invalidPriceRange = filters.priceRange[0] > filters.priceRange[1];
  const requestPayload = useMemo(
    () => ({
      ...stableBaseFilters,
      search: baseSearch || undefined,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      rating: filters.rating || undefined,
      discount: filters.discount || undefined,
      inStock: filters.inStock || undefined,
      pagination: { page, limit: ITEMS_PER_PAGE },
      sort,
    }),
    [
      stableBaseFilters,
      baseSearch,
      filters.category,
      filters.brand,
      filters.priceRange,
      filters.rating,
      filters.discount,
      filters.inStock,
      page,
      sort,
    ]
  );

  useEffect(() => {
    setFilters((prev) => {
        const sameCategory =
          prev.category.length === normalizedBaseCategory.length &&
          prev.category.every((item) => normalizedBaseCategory.includes(item));

      if (sameCategory) {
        return prev;
      }

      return {
        ...prev,
        category: normalizedBaseCategory,
      };
    });
    setPage(1);
  }, [baseCategoryKey, normalizedBaseCategory]);

  useEffect(() => {
    let isActive = true;
    if (invalidPriceRange) {
      setProducts([]);
      setTotalResults(0);
      setProductFetchStatus("fulfilled");
      return () => {
        isActive = false;
      };
    }

    setProductFetchStatus("pending");

    fetchProducts(requestPayload)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setProducts(Array.isArray(response.data) ? response.data : []);
        setTotalResults(Number(response.totalResults || 0));
        setProductFetchStatus("fulfilled");
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setProducts([]);
        setProductFetchStatus("rejected");
      });

    return () => {
      isActive = false;
    };
  }, [invalidPriceRange, requestPayload]);

  useEffect(() => {
    setPage(1);
  }, [filtersKey, sort, baseSearch, baseCategoryKey]);

  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  const availableBrands = useMemo(() => {
    if (!filters.category.length) {
      return [];
    }

    const activeBrandIds = new Set();
    products.forEach((product) => {
      const brandId = product?.brand?._id || product?.brand;
      if (brandId) {
        activeBrandIds.add(String(brandId));
      }
    });

    return brands.filter((brand) => activeBrandIds.has(String(brand._id)));
  }, [brands, filters.category, products]);

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
    <PageWrapper className="space-y-0 py-4 md:py-6">
      <Section className="pt-2">
        <Card
          hover={false}
          className="noise-overlay rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,20,31,0.94),rgba(8,12,20,0.92))] px-5 py-6 sm:px-6 md:rounded-[36px] lg:px-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-textSecondary">Digital showroom</p>
              <h1 className="text-3xl font-black uppercase tracking-tight text-textPrimary sm:text-4xl">{title}</h1>
              <p className="max-w-2xl text-base leading-7 text-textSecondary">{description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-textPrimary shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
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

      <Section className="pt-4">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
          <div className="hidden w-full max-w-[290px] xl:block">
            <Card
              hover={false}
              className="sticky top-28 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,35,0.94),rgba(9,13,20,0.92))] p-6"
            >
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                brands={brands}
                availableBrands={availableBrands}
                lockedCategoryId={normalizedBaseCategory[0]}
              />
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <Card
              hover={false}
              className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,35,0.94),rgba(9,13,20,0.92))] px-4 py-4 sm:px-5 md:px-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <span key={chip.key} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-textPrimary shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                      {chip.label}
                    </span>
                  ))}
                  {activeChips.length ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-full px-4 py-2 text-sm font-medium text-textSecondary transition hover:bg-white/[0.05] hover:text-textPrimary"
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                        "inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold backdrop-blur-xl transition",
                        pageNumber === page
                          ? "border-accent/40 bg-[linear-gradient(135deg,rgba(200,139,74,0.24),rgba(104,138,255,0.18))] text-white"
                          : "border-white/10 bg-white/[0.05] text-textPrimary hover:border-accent/25",
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
              className="ml-auto h-full w-full max-w-sm border-l border-white/10 bg-[linear-gradient(180deg,rgba(9,13,20,0.98),rgba(14,20,31,0.98))] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-lg font-semibold text-textPrimary">Filters</p>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-textPrimary backdrop-blur-xl"
                >
                  <FiX />
                </button>
              </div>
              <Card hover={false} className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,35,0.96),rgba(9,13,20,0.94))] p-5">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  brands={brands}
                  availableBrands={availableBrands}
                  lockedCategoryId={normalizedBaseCategory[0]}
                />
              </Card>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageWrapper>
  );
};
