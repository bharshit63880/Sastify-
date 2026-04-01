const mongoose = require("mongoose");
const { Schema } = mongoose;

const bannerSchema = new Schema(
    {
        image: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            default: "",
            trim: true,
        },
        ctaText: {
            type: String,
            default: "",
            trim: true,
        },
        ctaLink: {
            type: String,
            default: "",
            trim: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Banner", bannerSchema);
