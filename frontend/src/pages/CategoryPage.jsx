import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ProductList } from "../features/products/components/ProductList";
import { selectCategories } from "../features/categories/CategoriesSlice";
import {
  buildCategoryTree,
  getCategoryAncestors,
  getCategoryDescendants,
  getCategoryHref,
  getCategoryNode,
  getLeafCategories,
  getRootCategory,
  resolveCategoryFromSegments,
} from "../utils/categoryTree";

const emptyArray = [];

export const CategoryPage = () => {
  const { slug, parent, child, grandchild } = useParams();
  const categories = useSelector(selectCategories);

  const { roots, nodesById } = useMemo(() => buildCategoryTree(categories), [categories]);

  const category = useMemo(
    () => resolveCategoryFromSegments(categories, [slug, parent, child, grandchild]),
    [categories, slug, parent, child, grandchild]
  );

  const categoryNode = useMemo(() => getCategoryNode(category, nodesById), [category, nodesById]);

  const leafScope = useMemo(() => {
    if (!categoryNode) return emptyArray;
    return getLeafCategories(categoryNode, nodesById);
  }, [categoryNode, nodesById]);

  const baseFilters = useMemo(
    () => ({ category: leafScope.map((item) => item._id) }),
    [leafScope]
  );

  const ancestry = useMemo(() => {
    if (!categoryNode) return emptyArray;
    return [...getCategoryAncestors(categoryNode, nodesById), categoryNode];
  }, [categoryNode, nodesById]);

  const relatedCategories = useMemo(() => {
    if (!categoryNode) return roots.slice(0, 4);

    if (categoryNode.children.length) {
      return categoryNode.children;
    }

    const parentNode = categoryNode.parentId ? nodesById.get(String(categoryNode.parentId)) : null;

    if (parentNode?.children.length) {
      return parentNode.children.filter((item) => String(item._id) !== String(categoryNode._id));
    }

    const rootNode = getRootCategory(categoryNode, nodesById);
    return roots.filter((item) => String(item._id) !== String(rootNode?._id)).slice(0, 4);
  }, [categoryNode, nodesById, roots]);

  const headerContent = useMemo(() => {
    const categoryCount = categoryNode?.children.length || leafScope.length || 0;
    const description = categoryNode
      ? categoryNode.children.length
        ? `Shop across ${categoryCount} focused subcategories in ${categoryNode.name}.`
        : `A refined edit of best-value picks in ${categoryNode.name}.`
      : "Explore curated departments with cleaner navigation and faster filtering.";

    const relatedLabel = categoryNode?.children.length ? "Subcategories" : "Keep browsing";

    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.78fr)]">
        <div className="rounded-[28px] border border-border bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            {ancestry.length ? (
              ancestry.map((item, index) => (
                <React.Fragment key={item._id}>
                  <Link
                    to={getCategoryHref(item)}
                    className={[
                      "inline-flex rounded-full border px-4 py-2 text-sm transition",
                      index === ancestry.length - 1
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-textSecondary hover:bg-white hover:text-textPrimary",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                  {index < ancestry.length - 1 ? (
                    <span className="text-sm text-textSecondary">/</span>
                  ) : null}
                </React.Fragment>
              ))
            ) : (
              roots.slice(0, 4).map((item) => (
                <Link
                  key={item._id}
                  to={getCategoryHref(item)}
                  className="inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm text-textSecondary transition hover:bg-white hover:text-textPrimary"
                >
                  {item.name}
                </Link>
              ))
            )}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-textSecondary">{description}</p>
        </div>

        {relatedCategories.length ? (
          <div className="rounded-[28px] border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{relatedLabel}</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-textPrimary">
                  {categoryNode?.children.length ? "Explore the next layer" : "Nearby categories"}
                </p>
              </div>
              <span className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-textPrimary">
                {relatedCategories.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {relatedCategories.slice(0, 4).map((item) => {
                const previewItems = item.children.length ? getCategoryDescendants(item, nodesById) : [item];
                const leafPreview = previewItems.filter((entry) => !entry.children.length).slice(0, 2);

                return (
                  <Link
                    key={item._id}
                    to={getCategoryHref(item)}
                    className="rounded-[24px] border border-border bg-white px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <p className="text-base font-semibold tracking-tight text-textPrimary">{item.name}</p>
                    <p className="mt-2 text-sm leading-6 text-textSecondary">
                      {leafPreview.length
                        ? leafPreview.map((entry) => entry.name).join(" • ")
                        : "Browse the full department"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }, [ancestry, categoryNode, leafScope.length, nodesById, relatedCategories, roots]);

  return (
    <ProductList
      title={category?.name || "Category"}
      description={
        category?.name
          ? `Browse premium picks, sharper pricing, and cleaner product discovery across ${category.name}.`
          : "Browse premium picks, sharper pricing, and cleaner product discovery across the marketplace."
      }
      baseFilters={baseFilters}
      headerContent={headerContent}
    />
  );
};
