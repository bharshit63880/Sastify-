import React from "react";
import { motion } from "framer-motion";
import { FiShoppingBag, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import { formatPrice } from "../../../utils/currencyFormatter";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { addGuestCartItem, addToCartAsync, selectCartItems } from "../../cart/CartSlice";
import { ProductVisual } from "./ProductVisual";

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItems = useSelector(selectCartItems);

  const isInCart = cartItems.some((item) => item.product?._id === product._id || item.product === product._id);
  const rating = Number(product.rating || 0);
  const stock = Number(product.stock || product.stockQuantity || 0);
  const productLabel = product.name || product.title;
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.price || 0);
  const discountPercent = Number(product.discountPercent || 0);

  const handleAddToCart = () => {
    if (!loggedInUser) {
      dispatch(addGuestCartItem({ product, quantity: 1 }));
      return;
    }

    dispatch(addToCartAsync({ product: product._id, quantity: 1 }));
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-card"
    >
      <div className="relative overflow-hidden bg-surface">
        <Link to={`/products/${product.slug || product._id}`} className="block">
          <div className="aspect-[4/4.35] overflow-hidden">
            <ProductVisual
              product={product}
              alt={productLabel}
              imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        </Link>

        <div className="absolute inset-x-4 bottom-4">
          <Button
            fullWidth
            variant={isInCart ? "secondary" : "primary"}
            onClick={handleAddToCart}
            disabled={stock <= 0}
            icon={<FiShoppingBag />}
            className="opacity-100 shadow-[0_14px_30px_rgba(17,17,17,0.16)] sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          >
            {stock <= 0 ? "Out of stock" : isInCart ? "Added to cart" : "Add to cart"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4">
        <Link
          to={`/products/${product.slug || product._id}`}
          className="line-clamp-1 text-[15px] font-semibold tracking-tight text-textPrimary"
        >
          {productLabel}
        </Link>

        <div className="flex items-center gap-2 text-sm text-textSecondary">
          <span className="inline-flex items-center gap-1">
            <FiStar className="fill-current text-[#d19b2d]" />
            <span className="font-medium text-textPrimary">{rating.toFixed(1)}</span>
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-textPrimary">{formatPrice(price)}</p>
            {originalPrice > price ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-textSecondary line-through">{formatPrice(originalPrice)}</span>
                <span className="font-medium text-[#2f8f5b]">{discountPercent}% off</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
