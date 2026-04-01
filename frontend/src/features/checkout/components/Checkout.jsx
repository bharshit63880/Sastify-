import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPackage,
  FiShield,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
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
      {
        id: "upi",
        title: "UPI",
        description: "Fastest checkout using supported UPI apps.",
        icon: <FiSmartphone />,
      },
      {
        id: "card",
        title: "Card",
        description: "Visa, Mastercard and other supported cards.",
        icon: <FiCreditCard />,
      },
      {
        id: "banking",
        title: "Net banking",
        description: "Continue with your bank's secure payment flow.",
        icon: <FiShield />,
      },
    ],
    []
  );

  const checkoutHighlights = useMemo(
    () => [
      {
        title: "Secure checkout",
        description: paymentMethod === "online" ? "Your payment is processed through the configured gateway." : "Your order will be confirmed with secure order tracking.",
        icon: <FiShield />,
      },
      {
        title: "Fast dispatch",
        description: "Live cart pricing and delivery details are applied before confirmation.",
        icon: <FiTruck />,
      },
      {
        title: "Order updates",
        description: "You'll receive order status updates after the payment or COD confirmation.",
        icon: <FiClock />,
      },
    ],
    [paymentMethod]
  );

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
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Card
        hover={false}
        className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] px-5 py-6 shadow-[0_24px_56px_rgba(0,0,0,0.28)] sm:px-6 sm:py-7 md:rounded-[32px] lg:px-8"
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-textPrimary">
              Checkout
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight text-textPrimary md:text-4xl">
              Payment & delivery details
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-textSecondary">
              Enter shipping details, review live pricing, and continue with a premium secure payment flow that still uses the existing backend logic.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {checkoutHighlights.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-textPrimary">
                    {item.icon}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-textPrimary">{item.title}</p>
                  <p className="mt-1 text-xs leading-6 text-textSecondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,40,0.94),rgba(11,16,26,0.94))] p-5 sm:p-6">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#89a8cc]">Payment information</p>
              <div className="grid grid-cols-3 gap-3">
                {paymentModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod("online");
                      setOnlineMode(mode.id);
                    }}
                    className={[
                      "rounded-[22px] border p-4 text-left transition",
                      paymentMethod === "online" && onlineMode === mode.id
                        ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.18),rgba(104,138,255,0.18))] shadow-[0_12px_30px_rgba(104,138,255,0.16)]"
                        : "border-white/10 bg-white/[0.04] hover:border-[#8cc4ea]",
                    ].join(" ")}
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#8ebaf0]">
                      {mode.icon}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-textPrimary">{mode.title}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">Email</p>
                    <p className="mt-2 text-sm font-medium text-textPrimary">{loggedInUser?.email || "Sign in to continue"}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">Card holder</p>
                    <p className="mt-2 text-sm font-medium text-textPrimary">{loggedInUser?.name || "Guest checkout disabled"}</p>
                  </div>
                  <div className="sm:col-span-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#89a8cc]">Selected payment</p>
                        <p className="mt-2 text-sm font-medium text-textPrimary">
                          {paymentMethod === "online"
                            ? `${paymentModes.find((mode) => mode.id === onlineMode)?.title || "Online payment"} will continue in the secure gateway window`
                            : "Cash on Delivery selected"}
                        </p>
                      </div>
                      <FiCheckCircle className="shrink-0 text-2xl text-[#55d48d]" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs leading-6 text-[#7f9bbd]">
                This section is styled like a premium payment form, but the actual transaction still runs through the configured secure gateway or COD flow.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card hover={false} className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-5 sm:p-6 md:rounded-[32px]">
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
                        ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.18),rgba(104,138,255,0.14))] shadow-[0_12px_28px_rgba(104,138,255,0.12)]"
                        : "border-white/8 bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-textPrimary">{address.fullName || loggedInUser?.name}</p>
                        {address.isDefault ? (
                            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-textPrimary">
                              Default
                            </span>
                        ) : null}
                      </div>
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

          <Card hover={false} className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-5 sm:p-6 md:rounded-[32px]">
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

          <Card hover={false} className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-5 sm:p-6 md:rounded-[32px]">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-textPrimary">Payment method</h2>
                <p className="mt-2 text-sm text-textSecondary">Choose how you want to pay for this order.</p>
              </div>
              <div className="grid gap-3">
                <label
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-[24px] border p-4 transition sm:gap-4 sm:rounded-3xl",
                    paymentMethod === "cod" ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.18),rgba(104,138,255,0.14))]" : "border-white/8 bg-white/[0.04]",
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
                    paymentMethod === "online" ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.18),rgba(104,138,255,0.14))]" : "border-white/8 bg-white/[0.04]",
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

              {paymentMethod === "online" ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {paymentModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setOnlineMode(mode.id)}
                      className={[
                        "rounded-[22px] border p-4 text-left transition",
                        onlineMode === mode.id
                          ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.24),rgba(104,138,255,0.18))] text-white"
                          : "border-white/10 bg-white/[0.05] text-textPrimary hover:border-accent/25",
                      ].join(" ")}
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-inherit">
                        {mode.icon}
                      </div>
                      <p className="mt-3 text-sm font-semibold">{mode.title}</p>
                      <p className={["mt-1 text-xs leading-5", onlineMode === mode.id ? "text-white/70" : "text-textSecondary"].join(" ")}>
                        {mode.description}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <Card
          hover={false}
          className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-5 sm:p-6 md:rounded-[32px] xl:sticky xl:top-28 xl:h-fit"
        >
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-textPrimary">Order summary</h2>
              <p className="mt-2 text-sm text-textSecondary">All totals reflect live backend pricing and selected delivery address rules.</p>
            </div>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-white/[0.04] p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.06] p-2">
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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-textSecondary">
                      <span className="inline-flex items-center gap-1">
                        <FiPackage />
                        Qty {item.quantity}
                      </span>
                      {selectedAddressId ? (
                        <span className="inline-flex items-center gap-1">
                          <FiMapPin />
                          Delivery linked
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-textPrimary">{formatPrice(item.product.price * item.quantity)}</p>
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

            <div className="space-y-3 border-y border-white/8 py-4 text-sm">
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

            <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-textPrimary">
                  <FiShield />
                </div>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">
                    {paymentMethod === "online" ? "Secure gateway handoff" : "Cash on delivery confirmation"}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-textSecondary">
                    {paymentMethod === "online"
                      ? "After tapping the payment button, the secure provider window opens for UPI, card, or bank authorization."
                      : "Your order will be placed instantly and payment will happen at delivery."}
                  </p>
                </div>
              </div>
            </div>

            {paymentError ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{paymentError}</p> : null}

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
