const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["online", "cod", "wallet", "upi"],
            required: true,
        },
        paymentGateway: {
            type: String,
            default: "",
        },
        gatewayOrderId: {
            type: String,
            default: "",
        },
        gatewayPaymentId: {
            type: String,
            default: "",
        },
        gatewaySignature: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["created", "pending", "paid", "failed"],
            default: "created",
        },
        verified: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
        addressId: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },
        couponCode: {
            type: String,
            default: "",
        },
        amount: {
            type: Number,
            required: true,
        },
        meta: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Payment", paymentSchema);
