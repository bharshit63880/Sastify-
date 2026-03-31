import React from "react";
import { motion } from "framer-motion";
import { FiEye, FiHeart, FiStar } from "react-icons/fi";
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
    <Card className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#e9dfd1] bg-white p-0 shadow-[0_16px_34px_rgba(17,17,17,0.05)] sm:rounded-[34px]">
      <div className="relative bg-white px-6 pt-6">
        <Link to={`/products/${product.slug || product._id}`} className="block">
          <motion.div
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ duration: 0.35 }}
            className="h-[270px] w-full rounded-[28px] border border-[#efe6d9] bg-[#f8f4ee] p-6 sm:h-[290px]"
          >
            <ProductVisual
              product={product}
              alt={product.name || product.title}
              imageClassName="h-full w-full rounded-[20px] object-contain mix-blend-multiply"
            />
          </motion.div>
        </Link>

        <div className="absolute left-12 top-12 flex flex-wrap gap-2">
          {product.discountPercent > 0 ? (
            <span className="rounded-full bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {product.discountPercent}% off
            </span>
          ) : null}
          {stock > 0 && stock < 8 ? (
            <span className="rounded-full border border-[#e6d7c3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a24]">
              Low stock
            </span>
          ) : null}
        </div>

        <button
          onClick={handleWishlist}
          className={[
            "absolute right-12 top-12 inline-flex h-14 w-14 items-center justify-center rounded-full border text-base transition",
            isWishlisted
              ? "border-[#f0c5d1] bg-[#fff1f5] text-[#d14d72]"
              : "border-border bg-white text-textPrimary hover:border-[#111111]",
          ].join(" ")}
          type="button"
        >
          <FiHeart className={isWishlisted ? "fill-current" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-textSecondary">
            {product.brand?.name || product.brandName || "Shopco"}
          </p>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="line-clamp-2 min-h-[5.5rem] text-[21px] font-semibold leading-[1.32] tracking-[-0.02em] text-textPrimary transition hover:text-[#444444]"
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
            <p className="text-[2.2rem] font-bold leading-none tracking-[-0.04em] text-textPrimary">{formatPrice(product.price)}</p>
            {product.originalPrice > product.price ? (
              <p className="pb-1 text-lg text-textSecondary line-through">{formatPrice(product.originalPrice)}</p>
            ) : null}
          </div>
          <p className={stock > 0 ? "text-base font-medium text-textSecondary" : "text-base font-medium text-[#d14d72]"}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-1">
          <Button
            fullWidth
            variant={isInCart ? "secondary" : "primary"}
            disabled={stock === 0}
            onClick={handleAddToCart}
            className="min-h-[64px] rounded-full px-6 py-4 text-[18px] font-semibold"
          >
            {isInCart ? "In cart" : "Add to cart"}
          </Button>
          <Link
            to={`/products/${product.slug || product._id}`}
            className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#e3d8ca] bg-white text-textPrimary transition hover:border-[#111111] hover:bg-[#f8f4ee]"
          >
            <FiEye className="text-xl" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
