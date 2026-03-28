import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCategories } from "../features/categories/CategoriesSlice";
import { ProductList } from "../features/products/components/ProductList";

export const CategoryPage = () => {
  const { slug } = useParams();
  const categories = useSelector(selectCategories);
  const category = categories.find((item) => item.slug === slug);
  const baseFilters = useMemo(() => ({ category: category ? [category._id] : [] }), [category]);

  return (
    <ProductList
      title={category?.name || "Category"}
      description={`Browse top picks, best sellers, and high-conversion products in ${category?.name || "this category"}.`}
      baseFilters={baseFilters}
    />
  );
};
