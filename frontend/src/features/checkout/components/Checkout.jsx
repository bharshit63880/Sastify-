import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../../components/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { PageWrapper } from "../../../components/ui/PageWrapper";
import { formatPrice } from "../../../utils/currencyFormatter";
import { addAddressAsync, selectAddresses } from "../../address/AddressSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { fetchCartByUserIdAsync, selectCartItems, selectIsGuestCart } from "../../cart/CartSlice";
import { createPaymentOrder, getPaymentConfig, verifyPayment } from "../CheckoutApi";
import {
  createOrderAsync,
  getCheckoutPreviewAsync,
  resetCurrentOrder,
  selectCheckoutPreview,
  selectCurrentOrder,
} from "../../order/OrderSlice";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector(selectLoggedInUser);
  const addresses = useSelector(selectAddresses);
  const cartItems = useSelector(selectCartItems);
  const checkoutPreview = useSelector(selectCheckoutPreview);
  const currentOrder = useSelector(selectCurrentOrder);
  const isGuestCart = useSelector(selectIsGuestCart);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [paymentConfig, setPaymentConfig] = useState({
    enabled: false,
    provider: "mock",
    publicKey: "",
    testMode: false,
    label: "",
  });
  const [paymentError, setPaymentError] = useState("");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: loggedInUser?.name || "",
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phoneNumber: loggedInUser?.phone || "",
      addressType: "home",
      isDefault: false,
    },
  });

  useEffect(() => {
    const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    getPaymentConfig()
      .then(setPaymentConfig)
      .catch(() =>
        setPaymentConfig({
          enabled: false,
          provider: "mock",
          publicKey: "",
          testMode: false,
          label: "",
        })
      );
  }, []);

  useEffect(() => {
    if (selectedAddressId) {
      dispatch(getCheckoutPreviewAsync({ addressId: selectedAddressId, couponCode }));
    }
  }, [couponCode, dispatch, selectedAddressId]);

  useEffect(() => {
    if (currentOrder?._id) {
      navigate(`/order-success/${currentOrder._id}`);
      dispatch(resetCurrentOrder());
    }
  }, [currentOrder, dispatch, navigate]);

  const summary = useMemo(() => {
    if (checkoutPreview?.pricing) {
      return checkoutPreview.pricing;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      subtotal,
      shipping: 0,
      tax: 0,
      couponDiscount: 0,
      total: subtotal,
    };
  }, [cartItems, checkoutPreview]);

  const handleAddAddress = (data) => {
    dispatch(addAddressAsync(data));
    reset();
  };

  const placeCODOrder = () => {
    if (!selectedAddressId) {
      setPaymentError("Please select a delivery address");
      return;
    }

    dispatch(createOrderAsync({ addressId: selectedAddressId, couponCode }));
  };

  const placeOnlineOrder = async () => {
    if (!selectedAddressId) {
      setPaymentError("Please select a delivery address");
      return;
    }

    if (!paymentConfig.enabled) {
      setPaymentError("Online payment is not configured on this server yet. Please use Cash on Delivery for now.");
      return;
    }

    if (paymentConfig.provider === "mock") {
      const paymentOrder = await createPaymentOrder({ addressId: selectedAddressId, couponCode });
      const verification = await verifyPayment({
        gatewayOrderId: paymentOrder.gatewayOrderId,
        gatewayPaymentId: paymentOrder.testMeta?.paymentId,
        gatewaySignature: paymentOrder.testMeta?.signature,
        verificationToken: paymentOrder.testMeta?.verificationToken,
        addressId: selectedAddressId,
        couponCode,
      });

      dispatch(fetchCartByUserIdAsync());
      navigate(`/order-success/${verification.order._id}`);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaymentError("Unable to load the payment gateway. Please try again or use COD.");
      return;
    }

    const paymentOrder = await createPaymentOrder({ addressId: selectedAddressId, couponCode });
    const options = {
      key: paymentOrder.key,
      amount: paymentOrder.amount * 100,
      currency: paymentOrder.currency,
      name: "Sastify Marketplace",
      description: "Order payment",
      order_id: paymentOrder.gatewayOrderId,
      handler: async (response) => {
        const verification = await verifyPayment({
          ...response,
          addressId: selectedAddressId,
          couponCode,
        });
        dispatch(fetchCartByUserIdAsync());
        navigate(`/order-success/${verification.order._id}`);
      },
      prefill: {
        name: loggedInUser?.name,
        email: loggedInUser?.email,
        contact: loggedInUser?.phone,
      },
      theme: {
        color: "#111111",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (!cartItems.length && isGuestCart) {
    return (
      <EmptyState
        title="Sign in to complete checkout"
        description="Guest browsing is enabled, but secure checkout requires an account so we can save addresses and orders."
        actionLabel="View cart"
        actionTo="/cart"
      />
    );
  }

  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Card
        hover={false}
        className="rounded-[28px] border border-border bg-white px-5 py-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)] sm:px-6 sm:py-7 md:rounded-[32px] lg:px-8"
      >
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-border bg-[#faf7f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-textPrimary">
          Checkout
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-textPrimary md:text-4xl">Secure your order</h1>
          <p className="text-sm text-textSecondary">Review saved addresses, choose a payment method, and confirm pricing from live backend data.</p>
        </div>
      </Card>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card hover={false} className="rounded-[28px] border border-border bg-white p-5 sm:p-6 md:rounded-[32px]">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-textPrimary">Delivery address</h2>
                <p className="mt-2 text-sm text-textSecondary">Choose where the order should be delivered.</p>
              </div>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-[24px] border p-4 transition sm:gap-4 sm:rounded-3xl",
                      selectedAddressId === address._id
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-[#faf7f2]",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-textPrimary">{address.fullName || loggedInUser?.name}</p>
                      <p className="text-sm text-textSecondary">
                        {address.line1 || address.street}, {address.city}, {address.state} - {address.postalCode}
                      </p>
                      <p className="text-sm text-textSecondary">{address.phoneNumber}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Card hover={false} className="rounded-[28px] border border-border bg-white p-5 sm:p-6 md:rounded-[32px]">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-textPrimary">Add new address</h2>
                <p className="mt-2 text-sm text-textSecondary">Save a new address to your account before completing checkout.</p>
              </div>
              <form onSubmit={handleSubmit(handleAddAddress)} className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-6">
                  <Input label="Full name" {...register("fullName", { required: true })} />
                </div>
                <div className="md:col-span-6">
                  <Input label="Phone number" {...register("phoneNumber", { required: true })} />
                </div>
                <div className="md:col-span-12">
                  <Input label="Address line 1" {...register("line1", { required: true })} />
                </div>
                <div className="md:col-span-12">
                  <Input label="Address line 2" {...register("line2")} />
                </div>
                <div className="md:col-span-6">
                  <Input label="Landmark" {...register("landmark")} />
                </div>
                <div className="md:col-span-6">
                  <Input label="Address type" {...register("addressType")} />
                </div>
                <div className="md:col-span-4">
                  <Input label="City" {...register("city", { required: true })} />
                </div>
                <div className="md:col-span-4">
                  <Input label="State" {...register("state", { required: true })} />
                </div>
                <div className="md:col-span-4">
                  <Input label="Postal code" {...register("postalCode", { required: true })} />
                </div>
                <div className="md:col-span-12">
                  <Input label="Country" {...register("country", { required: true })} />
                </div>
                <div className="md:col-span-12">
                  <Button type="submit" variant="secondary" className="rounded-full">
                    Save address
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <Card hover={false} className="rounded-[28px] border border-border bg-white p-5 sm:p-6 md:rounded-[32px]">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-textPrimary">Payment method</h2>
                <p className="mt-2 text-sm text-textSecondary">Choose how you want to pay for this order.</p>
              </div>
              <div className="grid gap-3">
                <label
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-[24px] border p-4 transition sm:gap-4 sm:rounded-3xl",
                    paymentMethod === "cod" ? "border-primary/30 bg-primary/10" : "border-border bg-[#faf7f2]",
                  ].join(" ")}
                >
                  <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-primary" />
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">Cash on Delivery</p>
                    <p className="text-sm text-textSecondary">Pay once your order arrives.</p>
                  </div>
                </label>
                <label
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-[24px] border p-4 transition sm:gap-4 sm:rounded-3xl",
                    paymentMethod === "online" ? "border-primary/30 bg-primary/10" : "border-border bg-[#faf7f2]",
                  ].join(" ")}
                >
                  <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="accent-primary" />
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">
                      {paymentConfig.testMode
                        ? "Online Payment (Local test mode)"
                        : `Online Payment${paymentConfig.enabled ? " (Card / UPI / NetBanking)" : " (not configured locally)"}`}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {paymentConfig.testMode
                        ? "No real money will be charged in local test mode."
                        : "Use the configured gateway when available."}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        <Card
          hover={false}
          className="rounded-[28px] border border-border bg-white p-5 sm:p-6 md:rounded-[32px] xl:sticky xl:top-28 xl:h-fit"
        >
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-textPrimary">Order summary</h2>
              <p className="mt-2 text-sm text-textSecondary">All totals reflect live backend pricing and selected delivery address rules.</p>
            </div>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 pr-3 text-textSecondary">
                    {item.product.name || item.product.title} × {item.quantity}
                  </span>
                  <span className="shrink-0 text-textPrimary">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Input
              label="Coupon code"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="Enter coupon"
            />

            <div className="space-y-3 border-y border-border py-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Subtotal</span>
                <span className="text-textPrimary">{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Shipping</span>
                <span className="text-textPrimary">{summary.shipping ? formatPrice(summary.shipping) : "Free"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Tax</span>
                <span className="text-textPrimary">{formatPrice(summary.tax || 0)}</span>
              </div>
              {summary.couponDiscount > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-textSecondary">Coupon discount</span>
                  <span className="text-accent">- {formatPrice(summary.couponDiscount)}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-textPrimary">Total payable</span>
              <span className="text-2xl font-semibold text-textPrimary">{formatPrice(summary.total)}</span>
            </div>

            {paymentError ? <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-600">{paymentError}</p> : null}

            <Button
              fullWidth
              className="rounded-full"
              onClick={() => {
                setPaymentError("");
                if (paymentMethod === "online") {
                  placeOnlineOrder().catch((error) => {
                    if (error?.status === 401) {
                      setPaymentError("Your session expired. Please sign in again to continue with online payment.");
                      navigate("/login", { state: { from: "/checkout" } });
                      return;
                    }

                    setPaymentError(error?.message || "Payment could not be initiated");
                  });
                } else {
                  placeCODOrder();
                }
              }}
            >
              {paymentMethod === "online"
                ? paymentConfig.testMode
                  ? "Test online payment"
                  : "Pay securely"
                : "Place COD order"}
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};
