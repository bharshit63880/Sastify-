const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        slug: String,
        name: String,
        brand: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
        },
        brandName: String,
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
        },
        categoryName: String,
        image: String,
        quantity: Number,
        unitPrice: Number,
        originalPrice: Number,
        discountPercent: Number,
        totalPrice: Number,
        selectedVariant: {
            size: String,
            color: String,
        },
    },
    { _id: false }
);

const trackingSchema = new Schema(
    {
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "returned",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
        },
        pricing: {
            subtotal: Number,
            shipping: Number,
            tax: Number,
            couponCode: String,
            couponDiscount: Number,
            totalSavings: Number,
            total: Number,
        },
        addressSnapshot: {
            fullName: String,
            phoneNumber: String,
            line1: String,
            line2: String,
            landmark: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            addressType: String,
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "online", "wallet", "upi"],
            required: true,
        },
        paymentGateway: {
            type: String,
            default: "",
        },
        paymentGatewayOrderId: {
            type: String,
            default: "",
        },
        paymentGatewayPaymentId: {
            type: String,
            default: "",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "created", "authorized", "paid", "failed", "cod_pending", "refunded"],
            default: "pending",
        },
        paymentVerified: {
            type: Boolean,
            default: false,
        },
        transactionMeta: {
            type: Schema.Types.Mixed,
            default: {},
        },
        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "returned",
            ],
            default: "pending",
        },
        trackingHistory: {
            type: [trackingSchema],
            default: [],
        },
        cancellationReason: {
            type: String,
            default: "",
        },
        returnRequested: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Order", orderSchema);
