import React from "react";
import { motion } from "framer-motion";
import { FiEye, FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { formatPrice } from "../../../utils/currencyFormatter";
import { addGuestCartItem, addToCartAsync, selectCartItems } from "../../cart/CartSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  selectWishlistItems,
} from "../../wishlist/WishlistSlice";
import { ProductVisual } from "./ProductVisual";

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const cartItems = useSelector(selectCartItems);

  const isWishlisted = wishlistItems.some((item) => item.product._id === product._id);
  const isInCart = cartItems.some((item) => item.product._id === product._id);
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount || 0);
  const stock = Number(product.stock || product.stockQuantity || 0);
  const categoryLabel = product.category?.name || product.categoryName || "Curated pick";

  const handleWishlist = () => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      const entry = wishlistItems.find((item) => item.product._id === product._id);
      if (entry) dispatch(deleteWishlistItemByIdAsync(entry._id));
      return;
    }

    dispatch(createWishlistItemAsync({ product: product._id }));
  };

  const handleAddToCart = () => {
    if (loggedInUser) {
      dispatch(addToCartAsync({ product: product._id, quantity: 1 }));
      return;
    }

    dispatch(addGuestCartItem({ product, quantity: 1 }));
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border-white/60 bg-white/58 p-0">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-20 rounded-full bg-accent/18 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative px-5 pt-5 sm:px-6 sm:pt-6">
        <Link to={`/products/${product.slug || product._id}`} className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="relative h-[250px] overflow-hidden rounded-[26px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,240,232,0.86))] p-5 sm:h-[280px]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,139,74,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(17,17,17,0.06),transparent_26%)]" />
            <motion.div
              className="relative z-[1] h-full"
              whileHover={{ scale: 1.06, rotate: -1.5 }}
              transition={{ duration: 0.4 }}
            >
              <ProductVisual
                product={product}
                alt={product.name || product.title}
                imageClassName="h-full w-full rounded-[22px] object-contain mix-blend-multiply"
              />
            </motion.div>

            <div className="absolute left-4 top-4 z-[2] flex flex-wrap gap-2">
              {product.discountPercent > 0 ? (
                <span className="rounded-full bg-button-gradient px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_12px_28px_rgba(17,17,17,0.18)]">
                  {product.discountPercent}% off
                </span>
              ) : null}
              <span className="rounded-full border border-white/60 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-textPrimary backdrop-blur-xl">
                {categoryLabel}
              </span>
            </div>

            <button
              onClick={handleWishlist}
              className={[
                "absolute right-4 top-4 z-[2] inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/75 text-base shadow-[0_10px_24px_rgba(17,17,17,0.08)] backdrop-blur-xl transition",
                isWishlisted ? "text-[#d14d72]" : "text-textPrimary hover:-translate-y-0.5",
              ].join(" ")}
              type="button"
            >
              <FiHeart className={isWishlisted ? "fill-current" : ""} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute inset-x-4 bottom-4 z-[2] flex items-center justify-between rounded-full border border-white/60 bg-white/76 px-4 py-3 shadow-[0_12px_26px_rgba(17,17,17,0.08)] backdrop-blur-xl opacity-0"
            >
              <span className="text-sm font-medium text-textPrimary">Quick actions</span>
              <Link
                to={`/products/${product.slug || product._id}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-button-gradient text-white"
              >
                <FiEye />
              </Link>
            </motion.div>
          </motion.div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-textSecondary">
            {product.brand?.name || product.brandName || "Shopco"}
          </p>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="line-clamp-2 min-h-[4.75rem] text-[1.45rem] font-semibold leading-[1.3] tracking-[-0.03em] text-textPrimary"
          >
            {product.name || product.title}
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-textSecondary">
          <span className="inline-flex items-center gap-1">
            <FiStar className="fill-current text-[#f5b301]" />
            <span className="font-medium text-textPrimary">{rating.toFixed(1)}</span>
          </span>
          <span>({reviewCount})</span>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            <p className="text-[2.2rem] font-black leading-none tracking-[-0.05em] text-textPrimary">{formatPrice(product.price)}</p>
            {product.originalPrice > product.price ? (
              <p className="pb-1 text-lg text-textSecondary line-through">{formatPrice(product.originalPrice)}</p>
            ) : null}
          </div>
          <p className={stock > 0 ? "text-sm font-medium text-textSecondary" : "text-sm font-medium text-[#d14d72]"}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <Button
            fullWidth
            variant={isInCart ? "secondary" : "primary"}
            disabled={stock === 0}
            onClick={handleAddToCart}
            icon={<FiShoppingBag />}
            className="min-h-[58px] rounded-full px-5 text-base"
          >
            {isInCart ? "In cart" : "Add to cart"}
          </Button>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/74 text-textPrimary shadow-[0_10px_24px_rgba(17,17,17,0.08)] transition hover:-translate-y-0.5"
          >
            <FiEye className="text-lg" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
