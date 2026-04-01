import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FiEye, FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
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

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 180, damping: 22, mass: 0.4 });
  const springRotateY = useSpring(rotateY, { stiffness: 180, damping: 22, mass: 0.4 });

  const isWishlisted = wishlistItems.some((item) => item.product._id === product._id);
  const isInCart = cartItems.some((item) => item.product._id === product._id);
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount || 0);
  const stock = Number(product.stock || product.stockQuantity || 0);
  const showUrgency = stock > 0 && stock <= 5;
  const categoryLabel = product.category?.name || product.categoryName || "Curated pick";
  const productLabel = product.name || product.title;
  const brandLabel = product.brand?.name || product.brandName || "Sastify";

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

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateX.set(((centerY - y) / centerY) * 5.5);
    rotateY.set(((x - centerX) / centerX) * 7);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, scale: 1.01 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetTilt}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1400,
      }}
      className="group relative h-full min-h-[500px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,22,35,0.98),rgba(9,13,20,0.96))] shadow-[0_30px_80px_rgba(0,0,0,0.42)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(104,138,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(200,139,74,0.18),transparent_28%)] opacity-80" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/6" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-accent/25 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col p-[14px]">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,30,44,0.92),rgba(10,15,24,0.88))] p-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,139,74,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(104,138,255,0.16),transparent_30%)]" />
          <Link to={`/products/${product.slug || product._id}`} className="relative block">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="aspect-[4/5] overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,rgba(248,248,248,0.96),rgba(226,231,237,0.92))]"
            >
              <ProductVisual
                product={product}
                alt={productLabel}
                imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
              />
            </motion.div>
          </Link>

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              {product.discountPercent > 0 ? (
                <span className="inline-flex w-fit rounded-full border border-white/12 bg-black/68 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/92 backdrop-blur-xl">
                  {product.discountPercent}% off
                </span>
              ) : null}
              <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/76 backdrop-blur-xl">
                {categoryLabel}
              </span>
              {showUrgency ? (
                <span className="inline-flex w-fit rounded-full border border-[#ff8cab]/40 bg-[#2a0f1b]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9bb6]">
                  Only few left
                </span>
              ) : null}
            </div>

            <button
              onClick={handleWishlist}
              className={[
                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/38 text-sm text-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-black/55",
                isWishlisted ? "text-[#ff6c94]" : "",
              ].join(" ")}
              type="button"
            >
              <FiHeart className={isWishlisted ? "fill-current" : ""} />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/12 bg-black/45 px-4 py-3 opacity-0 backdrop-blur-2xl group-hover:pointer-events-auto"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Quick view</span>
            <Link
              to={`/products/${product.slug || product._id}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/14"
            >
              <FiEye />
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-textSecondary">{brandLabel}</p>
            <Link
              to={`/products/${product.slug || product._id}`}
              className="line-clamp-2 min-h-[2.9rem] text-[1rem] font-semibold leading-[1.32] tracking-[-0.03em] text-textPrimary"
            >
              {productLabel}
            </Link>
            <p className="line-clamp-1 text-[13px] text-textSecondary">{categoryLabel}</p>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/82">
                <FiStar className="fill-current text-[#f5b301]" />
                <span className="font-medium text-textPrimary">{rating.toFixed(1)}</span>
              </span>
              <span className="text-textSecondary">({reviewCount})</span>
            </div>
            <p className={stock > 0 ? "text-sm font-medium text-textSecondary" : "text-sm font-medium text-[#ff829f]"}>
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[1.65rem] font-black leading-none tracking-[-0.05em] text-textPrimary">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice > product.price ? (
                <p className="text-sm text-textSecondary line-through">{formatPrice(product.originalPrice)}</p>
              ) : (
                <p className="text-[13px] text-textSecondary">Premium curated pricing</p>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 pt-3">
            <Button
              fullWidth
              variant={isInCart ? "secondary" : "primary"}
              disabled={stock === 0}
              onClick={handleAddToCart}
              icon={<FiShoppingBag />}
              className="min-h-[46px] rounded-full px-5 text-[0.95rem]"
            >
              {isInCart ? "In cart" : "Add to cart"}
            </Button>
            <Link
              to={`/products/${product.slug || product._id}`}
              className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/92 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              <FiEye className="text-lg" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
