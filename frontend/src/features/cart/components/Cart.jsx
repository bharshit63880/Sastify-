import React, { useMemo } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
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
    if (nextQuantity < 1) {
      return;
    }

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
      <Card
        hover={false}
        className="flex-1 rounded-[28px] border border-border bg-white p-4 shadow-[0_18px_40px_rgba(17,17,17,0.04)] md:rounded-[32px] md:p-6"
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item._id}
              className={[
                "grid gap-4 rounded-[26px] bg-[#faf7f2] p-4 md:grid-cols-[140px_1fr_auto] md:items-center md:p-5",
                index !== items.length - 1 ? "" : "",
              ].join(" ")}
            >
              <Link
                to={`/products/${item.product.slug || item.product._id}`}
                className="overflow-hidden rounded-[22px] bg-white p-4"
              >
                <div className="h-32 w-full">
                  <ProductVisual
                    product={item.product}
                    alt={item.product.name || item.product.title}
                    imageClassName="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>
              </Link>

                <div className="min-w-0 space-y-3">
                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.product.slug || item.product._id}`}
                      className="line-clamp-2 text-lg font-semibold text-textPrimary transition hover:text-[#444444]"
                    >
                      {item.product.name || item.product.title}
                    </Link>
                  <p className="text-sm text-textSecondary">
                    {item.product.brand?.name || item.product.brandName || "Shopco"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-textSecondary">
                    {item.color ? <span>Color: {item.color}</span> : null}
                    {item.size ? <span>Size: {item.size}</span> : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-black text-textPrimary">{formatPrice(item.product.price)}</p>
                  {item.product.originalPrice > item.product.price ? (
                    <p className="text-sm text-textSecondary line-through">{formatPrice(item.product.originalPrice)}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-end">
                <button
                  type="button"
                  onClick={() => handleRemove(item._id)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#d14d72] transition hover:bg-[#fff1f5]"
                >
                  <FiTrash2 />
                </button>

                <div className="inline-flex items-center gap-5 rounded-full bg-white px-5 py-3">
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
      </Card>

      <Card
        hover={false}
        className="w-full rounded-[28px] border border-border bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:p-6 md:rounded-[32px] xl:sticky xl:top-28 xl:max-w-[360px]"
      >
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-textPrimary">Order Summary</h2>
            <p className="mt-2 text-sm leading-6 text-textSecondary">
              Final totals, shipping changes, and coupon adjustments are still validated on the server during checkout.
            </p>
          </div>

          <div className="space-y-3 border-y border-border py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Subtotal</span>
              <span className="font-semibold text-textPrimary">{formatPrice(pricing.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Shipping Fee</span>
              <span className="font-semibold text-textPrimary">{pricing.shipping ? formatPrice(pricing.shipping) : "Free"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Estimated Tax</span>
              <span className="font-semibold text-textPrimary">{formatPrice(pricing.tax)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-textPrimary">Total</span>
            <span className="text-3xl font-black text-textPrimary">{formatPrice(pricing.total)}</span>
          </div>

          {!hideActions ? (
            <div className="space-y-3">
              <Button
                fullWidth
                className="rounded-full"
                onClick={() => {
                  if (!loggedInUser) {
                    navigate("/login", { state: { from: "/checkout" } });
                    return;
                  }

                  navigate("/checkout");
                }}
              >
                Go to Checkout
              </Button>

              {!checkoutMode ? (
                <Button fullWidth variant="secondary" to="/products" className="rounded-full">
                  Continue Shopping
                </Button>
              ) : null}

              {loggedInUser ? (
                <button
                  type="button"
                  onClick={() => dispatch(resetCartByUserIdAsync())}
                  className="w-full rounded-full px-4 py-3 text-sm font-semibold text-textSecondary transition hover:text-textPrimary"
                >
                  Clear cart
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
