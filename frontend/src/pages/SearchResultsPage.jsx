import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductList } from "../features/products/components/ProductList";

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const baseFilters = useMemo(() => ({ search: query }), [query]);

  return (
    <ProductList
      title={`Search results for "${query}"`}
      description="Refine by price, rating, category, and brand to find the best fit faster."
      baseFilters={baseFilters}
    />
  );
};
