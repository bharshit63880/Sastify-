import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiCreditCard, FiMapPin, FiPackage, FiPlus } from "react-icons/fi";
import { EmptyState } from "../../../components/EmptyState";
import { Button } from "../../../components/ui/Button";
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
import { ProductVisual } from "../../products/components/ProductVisual";

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

const sectionClassName = "rounded-[30px] border border-border bg-white p-5 shadow-card sm:p-6";

export const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = useSelector(selectLoggedInUser);
  const addresses = useSelector(selectAddresses);
  const cartItems = useSelector(selectCartItems);
  const checkoutPreview = useSelector(selectCheckoutPreview);
  const currentOrder = useSelector(selectCurrentOrder);
  const isGuestCart = useSelector(selectIsGuestCart);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [onlineMode, setOnlineMode] = useState("upi");
  const [couponCode, setCouponCode] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
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
    if (!addresses.length) {
      setShowAddressForm(true);
    }
  }, [addresses.length]);

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
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get("payment");
    const paymentMessage = searchParams.get("message");

    if (paymentStatus === "failed") {
      setPaymentError(paymentMessage || "Payment failed. Please try again.");
    }
  }, [location.search]);

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

  const paymentModes = useMemo(
    () => [
      { id: "upi", title: "UPI" },
      { id: "card", title: "Card" },
      { id: "banking", title: "Net banking" },
    ],
    []
  );

  const selectedPaymentLabel = useMemo(() => {
    if (paymentMethod === "cod") {
      return "Cash on delivery";
    }

    const modeLabel = paymentModes.find((mode) => mode.id === onlineMode)?.title || "Online payment";
    return `${modeLabel} payment`;
  }, [onlineMode, paymentMethod, paymentModes]);

  const handleAddAddress = (data) => {
    dispatch(addAddressAsync(data));
    reset({
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
    });
    setShowAddressForm(false);
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

    if (paymentConfig.provider === "payu") {
      const paymentOrder = await createPaymentOrder({ addressId: selectedAddressId, couponCode });
      const redirect = paymentOrder.redirect;

      if (!redirect?.action || !redirect?.fields) {
        setPaymentError("PayU checkout payload is unavailable. Please try again.");
        return;
      }

      const form = document.createElement("form");
      form.method = redirect.method || "POST";
      form.action = redirect.action;
      form.style.display = "none";

      Object.entries(redirect.fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
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
    <PageWrapper className="py-6 md:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className={sectionClassName}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">Checkout</p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary sm:text-4xl">Complete your order</h1>
                <p className="max-w-2xl text-sm leading-6 text-textSecondary">
                  Keep it simple: choose an address, pick a payment method, and review the total before confirming.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-textPrimary">
                  {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-textPrimary">
                  {selectedPaymentLabel}
                </span>
              </div>
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Delivery address</h2>
                <p className="mt-2 text-sm text-textSecondary">Select a saved address or add a new one for this order.</p>
              </div>

              <Button
                variant="secondary"
                icon={<FiPlus />}
                onClick={() => setShowAddressForm((prev) => !prev)}
                className="w-full sm:w-auto"
              >
                {showAddressForm ? "Hide form" : "Add address"}
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {addresses.length ? (
                addresses.map((address) => (
                  <label
                    key={address._id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-[24px] border px-4 py-4 transition",
                      selectedAddressId === address._id
                        ? "border-primary bg-surface"
                        : "border-border bg-white hover:border-primary/15",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-textPrimary">{address.fullName || loggedInUser?.name}</p>
                        {address.isDefault ? (
                          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-textSecondary">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-textSecondary">
                        {address.line1 || address.street}, {address.city}, {address.state} - {address.postalCode}
                      </p>
                      <p className="text-sm text-textSecondary">{address.phoneNumber}</p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-surface px-4 py-5 text-sm text-textSecondary">
                  No saved addresses yet. Add one to continue.
                </div>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleSubmit(handleAddAddress)} className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-12">
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
                <div className="md:col-span-12 flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" variant="primary" className="sm:w-auto">
                    Save address
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)} className="sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}
          </section>

          <section className={sectionClassName}>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Payment method</h2>
              <p className="text-sm text-textSecondary">Choose one payment option. Everything else stays out of the way.</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={[
                  "rounded-[24px] border px-5 py-5 text-left transition",
                  paymentMethod === "cod"
                    ? "border-primary bg-surface"
                    : "border-border bg-white hover:border-primary/15",
                ].join(" ")}
              >
                <p className="text-base font-semibold text-textPrimary">Cash on Delivery</p>
                <p className="mt-2 text-sm leading-6 text-textSecondary">Place the order now and pay when it arrives.</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={[
                  "rounded-[24px] border px-5 py-5 text-left transition",
                  paymentMethod === "online"
                    ? "border-primary bg-surface"
                    : "border-border bg-white hover:border-primary/15",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <FiCreditCard className="text-textPrimary" />
                  <p className="text-base font-semibold text-textPrimary">
                    {paymentConfig.testMode ? "Online Payment (Test mode)" : "Online Payment"}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-textSecondary">
                  {paymentConfig.testMode
                    ? "Use gateway test mode locally without charging real money."
                    : "Continue in the secure gateway for UPI, card, or net banking."}
                </p>
              </button>
            </div>

            {paymentMethod === "online" ? (
              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-sm font-medium text-textPrimary">Choose a mode</p>
                <div className="flex flex-wrap gap-2">
                  {paymentModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setOnlineMode(mode.id)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        onlineMode === mode.id
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-textPrimary hover:border-primary/15 hover:bg-surface",
                      ].join(" ")}
                    >
                      {mode.title}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-textSecondary">
                  {paymentConfig.enabled
                    ? "You’ll be redirected to the configured secure payment provider after confirming the order."
                    : "Online payment is not configured on this server yet, so Cash on Delivery is the safe option for now."}
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className={`${sectionClassName} xl:sticky xl:top-28 xl:h-fit`}>
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Order summary</h2>
              <p className="text-sm text-textSecondary">Compact review before you confirm.</p>
            </div>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start gap-3 rounded-[22px] border border-border bg-surface p-3">
                  <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[18px] border border-border bg-white p-2">
                    <ProductVisual
                      product={item.product}
                      alt={item.product.name || item.product.title}
                      imageClassName="h-full w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-textPrimary">
                      {item.product.name || item.product.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-textSecondary">
                      <span className="inline-flex items-center gap-1">
                        <FiPackage />
                        Qty {item.quantity}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Input
              label="Coupon code"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="Enter coupon"
            />

            <div className="rounded-[24px] border border-border bg-surface px-4 py-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0 text-textPrimary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-textPrimary">Delivery</p>
                  <p className="mt-1 text-sm leading-6 text-textSecondary">
                    {selectedAddressId
                      ? "Address selected and pricing updated for checkout."
                      : "Select a delivery address to continue."}
                  </p>
                </div>
              </div>
            </div>

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
                  <span className="text-[#2f8f5b]">- {formatPrice(summary.couponDiscount)}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-textPrimary">Total</span>
              <span className="text-2xl font-semibold tracking-tight text-textPrimary">{formatPrice(summary.total)}</span>
            </div>

            <div className="rounded-[24px] border border-border bg-surface px-4 py-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-0.5 shrink-0 text-[#2f8f5b]" />
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{selectedPaymentLabel}</p>
                  <p className="mt-1 text-sm leading-6 text-textSecondary">
                    {paymentMethod === "online"
                      ? "Secure payment window opens after confirmation."
                      : "Your order is confirmed first and payment happens on delivery."}
                  </p>
                </div>
              </div>
            </div>

            {paymentError ? (
              <p className="rounded-2xl border border-[#e9b4b4] bg-[#fff1f1] px-4 py-3 text-sm text-[#9b4242]">
                {paymentError}
              </p>
            ) : null}

            <Button
              fullWidth
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
                : "Place order"}
            </Button>
          </div>
        </aside>
      </div>
    </PageWrapper>
  );
};
