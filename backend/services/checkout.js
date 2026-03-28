const mongoose = require("mongoose");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Product = require("../models/Product");

const DEFAULT_SHIPPING_CHARGE = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const DEFAULT_TAX_RATE = 0.05;

const SHIPPING_STATUS_COPY = {
    pending: "Order placed and awaiting confirmation",
    confirmed: "Seller confirmed the order",
    packed: "Items packed at warehouse",
    shipped: "Shipment is on the way",
    out_for_delivery: "Shipment reached the local delivery hub",
    delivered: "Order delivered successfully",
    cancelled: "Order cancelled",
    returned: "Return completed",
};

const PAYMENT_STATUS_TITLES = {
    cod_pending: "Cash on delivery selected",
    paid: "Payment confirmed",
    failed: "Payment failed",
};

const formatMoney = (value) => Number((value || 0).toFixed(2));

const buildTrackingEntry = (status, title, description) => ({
    status,
    title,
    description,
    timestamp: new Date(),
});

const snapshotAddress = (addressDoc) => ({
    fullName: addressDoc.fullName || "",
    phoneNumber: addressDoc.phoneNumber,
    line1: addressDoc.line1 || addressDoc.street,
    line2: addressDoc.line2 || "",
    landmark: addressDoc.landmark || "",
    city: addressDoc.city,
    state: addressDoc.state,
    postalCode: addressDoc.postalCode,
    country: addressDoc.country,
    addressType: addressDoc.addressType || addressDoc.type || "home",
});

const getEffectiveProductValues = (product) => {
    const price = Number(product.price || 0);
    const originalPrice = Number(product.originalPrice || price);
    const discountPercent = Number(product.discountPercent || product.discountPercentage || 0);
    const stock = Number(product.stock || product.stockQuantity || 0);

    return { price, originalPrice, discountPercent, stock };
};

const createError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const getCartForCheckout = async (userId) => {
    const items = await Cart.find({ user: userId }).populate({
        path: "product",
        populate: ["brand", "category"],
    });

    if (!items.length) {
        throw createError("Your cart is empty");
    }

    return items;
};

const findAddressForUser = async (userId, addressId) => {
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
        return null;
    }

    return Address.findOne({ _id: addressId, user: userId });
};

const getCouponForCheckout = async (code) => {
    if (!code) {
        return null;
    }

    return Coupon.findOne({ code: code.trim().toUpperCase() });
};

const calculateCheckout = async ({ userId, addressId, couponCode }) => {
    const cartItems = await getCartForCheckout(userId);
    const address = await findAddressForUser(userId, addressId);

    if (!address) {
        throw createError("Please select a valid delivery address");
    }

    let subtotal = 0;
    let totalSavings = 0;

    const items = cartItems.map((cartItem) => {
        const product = cartItem.product;

        if (!product || product.isDeleted || product.status === "inactive") {
            throw createError("One or more products in your cart are unavailable");
        }

        const { price, originalPrice, discountPercent, stock } = getEffectiveProductValues(product);

        if (stock < cartItem.quantity) {
            throw createError(`Insufficient stock for ${product.name || product.title}`);
        }

        const totalPrice = formatMoney(price * cartItem.quantity);
        const savings = formatMoney((originalPrice - price) * cartItem.quantity);

        subtotal += totalPrice;
        totalSavings += savings;

        return {
            cartItemId: cartItem._id,
            product: product._id,
            slug: product.slug,
            name: product.name || product.title,
            brand: product.brand?._id || null,
            brandName: product.brand?.name || "",
            category: product.category?._id || null,
            categoryName: product.category?.name || "",
            image: product.thumbnail || product.images?.[0] || "",
            quantity: cartItem.quantity,
            unitPrice: price,
            originalPrice,
            discountPercent,
            totalPrice,
            selectedVariant: {
                size: cartItem.size || "",
                color: cartItem.color || "",
            },
        };
    });

    subtotal = formatMoney(subtotal);
    totalSavings = formatMoney(totalSavings);

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_CHARGE;
    const tax = formatMoney(subtotal * DEFAULT_TAX_RATE);

    let coupon = null;
    let couponDiscount = 0;

    if (couponCode) {
        coupon = await getCouponForCheckout(couponCode);

        if (!coupon || !coupon.active) {
            throw createError("Coupon is invalid or inactive");
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            throw createError("Coupon has expired");
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw createError("Coupon usage limit reached");
        }

        if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
            throw createError(`Coupon requires a minimum order of Rs. ${coupon.minOrderValue}`);
        }

        if (coupon.discountType === "percentage") {
            couponDiscount = formatMoney((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount) {
                couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
            }
        } else {
            couponDiscount = formatMoney(coupon.discountValue);
        }
    }

    const total = formatMoney(Math.max(subtotal + shipping + tax - couponDiscount, 0));

    return {
        cartItems,
        address,
        addressSnapshot: snapshotAddress(address),
        items,
        coupon,
        pricing: {
            subtotal,
            shipping,
            tax,
            couponDiscount,
            totalSavings,
            total,
        },
    };
};

const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

const createOrderFromCheckout = async ({
    userId,
    addressId,
    couponCode,
    paymentMethod,
    paymentGateway,
    paymentGatewayOrderId,
    paymentGatewayPaymentId,
    paymentStatus,
    paymentVerified,
    transactionMeta,
}) => {
    const checkout = await calculateCheckout({ userId, addressId, couponCode });

    const order = await Order.create({
        orderNumber: generateOrderNumber(),
        user: userId,
        items: checkout.items,
        pricing: {
            ...checkout.pricing,
            couponCode: checkout.coupon?.code || "",
        },
        addressSnapshot: checkout.addressSnapshot,
        paymentMethod,
        paymentGateway: paymentGateway || "",
        paymentGatewayOrderId: paymentGatewayOrderId || "",
        paymentGatewayPaymentId: paymentGatewayPaymentId || "",
        paymentStatus,
        paymentVerified: Boolean(paymentVerified),
        transactionMeta: transactionMeta || {},
        orderStatus: paymentMethod === "cod" ? "confirmed" : "pending",
        trackingHistory: [
            buildTrackingEntry("pending", "Order placed", SHIPPING_STATUS_COPY.pending),
            buildTrackingEntry(
                paymentMethod === "cod" ? "confirmed" : "pending",
                paymentMethod === "cod" ? PAYMENT_STATUS_TITLES.cod_pending : PAYMENT_STATUS_TITLES.paid,
                paymentMethod === "cod"
                    ? "Cash will be collected at delivery"
                    : "Payment has been verified successfully"
            ),
        ],
    });

    for (const item of checkout.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: {
                stock: -item.quantity,
                stockQuantity: -item.quantity,
            },
        });
    }

    if (checkout.coupon) {
        await Coupon.findByIdAndUpdate(checkout.coupon._id, { $inc: { usageCount: 1 } });
    }

    await Cart.deleteMany({ user: userId });

    return order;
};

const canCancelOrder = (orderStatus = "") => ["pending", "confirmed", "packed"].includes(orderStatus);

module.exports = {
    PAYMENT_STATUS_TITLES,
    SHIPPING_STATUS_COPY,
    buildTrackingEntry,
    calculateCheckout,
    canCancelOrder,
    createOrderFromCheckout,
    formatMoney,
    getCartForCheckout,
};
