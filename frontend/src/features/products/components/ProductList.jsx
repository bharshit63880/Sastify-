import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter, FiSliders, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { Button } from "../../../components/ui/Button";
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
      "rounded-full border px-4 py-2 text-sm font-medium transition",
      active
        ? "border-primary bg-primary text-white"
        : "border-border bg-white text-textSecondary hover:border-primary/15 hover:text-textPrimary",
      disabled ? "cursor-not-allowed opacity-40" : "",
    ].join(" ")}
  >
    {children}
  </button>
);

const FilterPanel = ({ filters, setFilters, categories, availableBrands, lockedCategoryIds = [] }) => (
  <div className="space-y-7">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <p className="text-lg font-semibold text-textPrimary">Filters</p>
      <FiSliders className="text-textSecondary" />
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textSecondary">Categories</p>
      {lockedCategoryIds.length ? (
        <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-textSecondary">
          Category scope is fixed for this page. Use the category links above to move across departments.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <FilterChip
              key={category._id}
              active={filters.category.includes(category._id)}
              disabled={Boolean(lockedCategoryIds.length && !lockedCategoryIds.includes(category._id))}
              onClick={() => {
                if (lockedCategoryIds.length) return;

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
      )}
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textSecondary">Brands</p>
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
            <p className="text-sm text-textSecondary">No matching brands for this category.</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-textSecondary">Choose a category to narrow the available brands.</p>
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
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textSecondary">Rating</p>
      <div className="flex flex-wrap gap-2">
        {[4, 3, 2].map((rating) => (
          <FilterChip
            key={rating}
            active={filters.rating === rating}
            onClick={() => setFilters((prev) => ({ ...prev, rating: prev.rating === rating ? 0 : rating }))}
          >
            {rating}+ stars
          </FilterChip>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textSecondary">Discount</p>
      <div className="flex flex-wrap gap-2">
        {[10, 25, 40].map((discount) => (
          <FilterChip
            key={discount}
            active={filters.discount === discount}
            onClick={() => setFilters((prev) => ({ ...prev, discount: prev.discount === discount ? 0 : discount }))}
          >
            {discount}%+
          </FilterChip>
        ))}
      </div>
    </div>

    <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-textPrimary">
      <input
        type="checkbox"
        checked={filters.inStock}
        onChange={(event) => setFilters((prev) => ({ ...prev, inStock: event.target.checked }))}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      In stock only
    </label>
  </div>
);

export const ProductList = ({
  title = "All products",
  description = "Explore the full catalog with simple filters, lighter surfaces, and cleaner product comparison.",
  baseFilters,
  headerContent = null,
}) => {
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [productFetchStatus, setProductFetchStatus] = useState("idle");
  const stableBaseFilters = useMemo(() => baseFilters || EMPTY_BASE_FILTERS, [baseFilters]);
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
        if (!isActive) return;

        setProducts(Array.isArray(response.data) ? response.data : []);
        setTotalResults(Number(response.totalResults || 0));
        setProductFetchStatus("fulfilled");
      })
      .catch(() => {
        if (!isActive) return;

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
    if (!products.length) {
      return [];
    }

    const uniqueBrands = new Map();

    products.forEach((product) => {
      const brand = product?.brand;
      if (!brand) return;

      if (typeof brand === "object") {
        const key = String(brand._id || brand.name || "");
        if (key) uniqueBrands.set(key, brand);
        return;
      }

      const key = String(brand);
      if (key) uniqueBrands.set(key, { _id: brand, name: key });
    });

    if (brands.length) {
      return Array.from(uniqueBrands.keys())
        .map((key) => brands.find((item) => String(item._id) === key || item.name === key) || uniqueBrands.get(key))
        .filter(Boolean);
    }

    return Array.from(uniqueBrands.values());
  }, [brands, products]);

  const activeChips = useMemo(() => {
    const chips = [];
    const categoryFiltersLocked =
      normalizedBaseCategory.length &&
      filters.category.length === normalizedBaseCategory.length &&
      filters.category.every((item) => normalizedBaseCategory.includes(item));

    if (!categoryFiltersLocked) {
      filters.category.forEach((categoryId) => {
        const category = categories.find((item) => item._id === categoryId);
        if (category) chips.push({ key: `category-${categoryId}`, label: category.name });
      });
    }

    filters.brand.forEach((brandId) => {
      const brand = brands.find((item) => item._id === brandId);
      if (brand) chips.push({ key: `brand-${brandId}`, label: brand.name });
    });

    if (filters.rating) chips.push({ key: "rating", label: `${filters.rating}+ stars` });
    if (filters.discount) chips.push({ key: "discount", label: `${filters.discount}% off` });
    if (filters.inStock) chips.push({ key: "stock", label: "In stock" });

    return chips;
  }, [brands, categories, filters, normalizedBaseCategory]);

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
    <PageWrapper className="py-6 md:py-8">
      <Section className="pt-2">
        <div className="flex flex-col gap-5 rounded-[36px] border border-border bg-white px-6 py-6 shadow-card lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">Catalog</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary sm:text-4xl">{title}</h1>
            <p className="body-copy max-w-2xl">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-textPrimary">
              {totalResults} products
            </span>
            <Button variant="secondary" icon={<FiFilter />} className="xl:hidden" onClick={() => setMobileFiltersOpen(true)}>
              Filters
            </Button>
          </div>
        </div>

        {headerContent ? <div className="mt-5 border-t border-border pt-5">{headerContent}</div> : null}
      </Section>

      <Section className="pt-4">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
          <div className="hidden w-full max-w-[300px] xl:block">
            <div className="sticky top-28 rounded-[30px] border border-border bg-white p-6 shadow-card">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                availableBrands={availableBrands}
                lockedCategoryIds={normalizedBaseCategory}
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col gap-4 rounded-[30px] border border-border bg-white px-5 py-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {activeChips.length ? (
                  <>
                    {activeChips.map((chip) => (
                      <span key={chip.key} className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-textPrimary">
                        {chip.label}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-full px-4 py-2 text-sm font-medium text-textSecondary transition hover:bg-surface hover:text-textPrimary"
                    >
                      Clear all
                    </button>
                  </>
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

            {productFetchStatus === "pending" ? (
              <LoadingState />
            ) : products.length ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
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
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-textPrimary hover:border-primary/15",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <Button
                    variant="secondary"
                    disabled={page === totalPages}
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

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm xl:hidden"
          >
            <motion.div
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              className="ml-auto h-full w-full max-w-sm border-l border-border bg-background p-5 shadow-premium"
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

              <div className="rounded-[28px] border border-border bg-white p-5 shadow-card">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  availableBrands={availableBrands}
                  lockedCategoryIds={normalizedBaseCategory}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageWrapper>
  );
};
