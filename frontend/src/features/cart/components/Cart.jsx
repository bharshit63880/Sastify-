import React, { useMemo } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { Button } from "../../../components/ui/Button";
import { formatPrice } from "../../../utils/currencyFormatter";
import { DEFAULT_SHIPPING_CHARGE, DEFAULT_TAX_RATE, FREE_SHIPPING_THRESHOLD } from "../../../constants";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { ProductVisual } from "../../products/components/ProductVisual";
import {
  deleteCartItemByIdAsync,
  removeGuestCartItem,
  resetCartByUserIdAsync,
  selectCartItems,
  selectIsGuestCart,
  updateCartItemByIdAsync,
  updateGuestCartItem,
} from "../CartSlice";

export const Cart = ({ checkoutMode = false, hideActions = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const isGuestCart = useSelector(selectIsGuestCart);
  const loggedInUser = useSelector(selectLoggedInUser);

  const pricing = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : DEFAULT_SHIPPING_CHARGE;
    const tax = subtotal * DEFAULT_TAX_RATE;

    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
    };
  }, [items]);

  const handleQuantity = (item, nextQuantity) => {
    if (nextQuantity < 1) return;

    if (isGuestCart && !loggedInUser) {
      dispatch(updateGuestCartItem({ id: item._id, quantity: nextQuantity }));
      return;
    }

    dispatch(updateCartItemByIdAsync({ _id: item._id, quantity: nextQuantity }));
  };

  const handleRemove = (itemId) => {
    if (isGuestCart && !loggedInUser) {
      dispatch(removeGuestCartItem(itemId));
      return;
    }

    dispatch(deleteCartItemByIdAsync(itemId));
  };

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products from the catalog to start building your order."
        actionLabel="Shop now"
        actionTo="/products"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex-1 space-y-4 rounded-[32px] border border-border bg-white p-4 shadow-card md:p-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="grid gap-4 rounded-[26px] border border-border bg-surface p-4 md:grid-cols-[120px_1fr_auto] md:items-center"
          >
            <Link
              to={`/products/${item.product.slug || item.product._id}`}
              className="overflow-hidden rounded-[22px] border border-border bg-white"
            >
              <div className="h-28 w-full">
                <ProductVisual
                  product={item.product}
                  alt={item.product.name || item.product.title}
                  imageClassName="h-full w-full object-cover"
                />
              </div>
            </Link>

            <div className="min-w-0 space-y-3">
              <div className="space-y-1">
                <Link
                  to={`/products/${item.product.slug || item.product._id}`}
                  className="line-clamp-2 text-lg font-semibold tracking-tight text-textPrimary"
                >
                  {item.product.name || item.product.title}
                </Link>
                <p className="text-sm text-textSecondary">
                  {item.product.brand?.name || item.product.brandName || "Sastify"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-textSecondary">
                  {item.color ? <span>Color: {item.color}</span> : null}
                  {item.size ? <span>Size: {item.size}</span> : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
                  {formatPrice(item.product.price)}
                </p>
                {item.product.originalPrice > item.product.price ? (
                  <p className="text-sm text-textSecondary line-through">
                    {formatPrice(item.product.originalPrice)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-end">
              <button
                type="button"
                onClick={() => handleRemove(item._id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-[#c74d6f] transition hover:-translate-y-0.5"
              >
                <FiTrash2 />
              </button>

              <div className="inline-flex items-center gap-5 rounded-full border border-border bg-white px-5 py-3">
                <button type="button" onClick={() => handleQuantity(item, item.quantity - 1)} className="text-textPrimary">
                  <FiMinus />
                </button>
                <span className="min-w-[16px] text-center text-sm font-semibold text-textPrimary">{item.quantity}</span>
                <button type="button" onClick={() => handleQuantity(item, item.quantity + 1)} className="text-textPrimary">
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full rounded-[32px] border border-border bg-white p-6 shadow-card xl:sticky xl:top-28 xl:max-w-[360px]">
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Order summary</h2>
            <p className="mt-2 text-sm leading-6 text-textSecondary">
              Review your totals before moving to checkout.
            </p>
          </div>

          <div className="space-y-3 rounded-[24px] border border-border bg-surface p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Subtotal</span>
              <span className="font-semibold text-textPrimary">{formatPrice(pricing.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Shipping</span>
              <span className="font-semibold text-textPrimary">{pricing.shipping ? formatPrice(pricing.shipping) : "Free"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Estimated tax</span>
              <span className="font-semibold text-textPrimary">{formatPrice(pricing.tax)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[24px] bg-primary px-5 py-4 text-white">
            <span className="text-base font-semibold">Total</span>
            <span className="text-3xl font-semibold tracking-[-0.04em]">{formatPrice(pricing.total)}</span>
          </div>

          {!hideActions ? (
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={() => {
                  if (!loggedInUser) {
                    navigate("/login", { state: { from: "/checkout" } });
                    return;
                  }

                  navigate("/checkout");
                }}
              >
                Checkout
              </Button>

              {!checkoutMode ? (
                <Button fullWidth variant="secondary" to="/products">
                  Continue shopping
                </Button>
              ) : null}

              {loggedInUser ? (
                <button
                  type="button"
                  onClick={() => dispatch(resetCartByUserIdAsync())}
                  className="w-full rounded-full px-4 py-3 text-sm font-medium text-textSecondary transition hover:bg-surface hover:text-textPrimary"
                >
                  Clear cart
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
