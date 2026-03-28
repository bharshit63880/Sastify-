const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        title: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        usageLimit: {
            type: Number,
            default: 0,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Coupon", couponSchema);
