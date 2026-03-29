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

  const handleWishlist = () => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      const entry = wishlistItems.find((item) => item.product._id === product._id);
      if (entry) {
        dispatch(deleteWishlistItemByIdAsync(entry._id));
      }
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
    <Card className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-border bg-white p-0 shadow-[0_14px_28px_rgba(17,17,17,0.05)] sm:rounded-[28px] sm:shadow-[0_20px_40px_rgba(17,17,17,0.06)]">
      <div className="relative border-b border-border bg-[#f8f4ee]">
        <Link to={`/products/${product.slug || product._id}`} className="block">
          <motion.div
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ duration: 0.35 }}
            className="h-44 w-full p-3 sm:h-56 sm:p-4 lg:h-72 lg:p-6"
          >
            <ProductVisual
              product={product}
              alt={product.name || product.title}
              imageClassName="h-full w-full object-contain mix-blend-multiply"
            />
          </motion.div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
          {product.discountPercent > 0 ? (
            <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
              {product.discountPercent}% off
            </span>
          ) : null}
          {stock > 0 && stock < 8 ? (
            <span className="rounded-full border border-[#e6d7c3] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a5a24] sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
              Low stock
            </span>
          ) : null}
        </div>

        <button
          onClick={handleWishlist}
          className={[
            "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm transition sm:right-4 sm:top-4 sm:h-11 sm:w-11 sm:text-base",
            isWishlisted
              ? "border-[#f0c5d1] bg-[#fff1f5] text-[#d14d72]"
              : "border-border bg-white text-textPrimary hover:border-[#111111]",
          ].join(" ")}
          type="button"
        >
          <FiHeart className={isWishlisted ? "fill-current" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-5">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary sm:text-[11px] sm:tracking-[0.22em]">
            {product.brand?.name || product.brandName || "Shopco"}
          </p>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-textPrimary transition hover:text-[#444444] sm:min-h-[3rem] sm:text-base sm:leading-6"
          >
            {product.name || product.title}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-textSecondary sm:gap-2 sm:text-sm">
          <span className="inline-flex items-center gap-1">
            <FiStar className="fill-current text-[#f5b301]" />
            <span className="font-medium text-textPrimary">{rating.toFixed(1)}</span>
          </span>
          <span>({reviewCount})</span>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-textPrimary sm:text-xl">{formatPrice(product.price)}</p>
            {product.originalPrice > product.price ? (
              <p className="text-xs text-textSecondary line-through sm:text-sm">{formatPrice(product.originalPrice)}</p>
            ) : null}
          </div>
          <p className={stock > 0 ? "text-xs text-textSecondary" : "text-xs text-[#d14d72]"}>
            {stock > 0 ? `${stock} available` : "Out of stock"}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2 sm:gap-3">
          <Button
            fullWidth
            variant={isInCart ? "secondary" : "primary"}
            icon={<FiShoppingBag />}
            disabled={stock === 0}
            onClick={handleAddToCart}
            className="rounded-full px-3 py-2.5 text-xs sm:px-5 sm:py-3 sm:text-sm"
          >
            {isInCart ? "In cart" : "Add to cart"}
          </Button>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-textPrimary transition hover:border-[#111111] hover:bg-[#f8f4ee] sm:h-12 sm:w-12"
          >
            <FiEye />
          </Link>
        </div>
      </div>
    </Card>
  );
};
