import React from "react";
import { useSelector } from "react-redux";
import { EmptyState } from "../components/EmptyState";
import { PageWrapper } from "../components/ui/PageWrapper";
import { ProductCard } from "../features/products/components/ProductCard";
import { selectWishlistItems } from "../features/wishlist/WishlistSlice";

export const WishlistPage = () => {
  const items = useSelector(selectWishlistItems);

  return (
    <PageWrapper className="py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Wishlist</h1>
        <p className="text-sm text-textSecondary">Save products here to compare later and keep your shortlist organized.</p>
      </div>

      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item._id} product={item.product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your wishlist is empty"
          description="Save products here to compare them later and keep your shortlist organized."
          actionLabel="Explore products"
          actionTo="/products"
        />
      )}
    </PageWrapper>
  );
};
