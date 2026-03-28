const mongoose = require("mongoose");
const { Schema } = mongoose;
const { slugify } = require("../utils/slugify");

const specSchema = new Schema(
    {
        label: String,
        value: String,
    },
    { _id: false }
);

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            trim: true,
        },
        shortDescription: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            required: true,
        },
        highlights: {
            type: [String],
            default: [],
        },
        specs: {
            type: [specSchema],
            default: [],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
        discountPercent: {
            type: Number,
            default: 0,
        },
        discountPercentage: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        stockQuantity: {
            type: Number,
            min: 0,
        },
        thumbnail: {
            type: String,
            default: "",
        },
        images: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        trending: {
            type: Boolean,
            default: false,
        },
        bestseller: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["draft", "active", "inactive"],
            default: "active",
        },
        sizes: {
            type: [String],
            default: [],
        },
        colors: {
            type: [String],
            default: [],
        },
        shippingText: {
            type: String,
            default: "Free delivery in 2-4 days",
        },
        sellerName: {
            type: String,
            default: "Sastify Retail",
        },
        returnPolicy: {
            type: String,
            default: "7 day replacement available",
        },
        warranty: {
            type: String,
            default: "Brand warranty as applicable",
        },
        seoTitle: {
            type: String,
            default: "",
        },
        seoDescription: {
            type: String,
            default: "",
        },
        metaKeywords: {
            type: [String],
            default: [],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

productSchema.pre("validate", function syncProductFields(next) {
    if (!this.name && this.title) {
        this.name = this.title;
    }

    if (!this.title && this.name) {
        this.title = this.name;
    }

    if (!this.slug && (this.name || this.title)) {
        this.slug = slugify(this.name || this.title);
    }

    if (!this.images?.length && this.thumbnail) {
        this.images = [this.thumbnail];
    }

    if (!this.thumbnail && this.images?.length) {
        this.thumbnail = this.images[0];
    }

    if (!this.originalPrice) {
        this.originalPrice = this.price;
    }

    if (this.originalPrice < this.price) {
        this.originalPrice = this.price;
    }

    const computedDiscount = this.originalPrice
        ? Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
        : 0;

    if (!this.discountPercent && !this.discountPercentage) {
        this.discountPercent = computedDiscount;
        this.discountPercentage = computedDiscount;
    } else {
        this.discountPercent = Number(this.discountPercent || this.discountPercentage || computedDiscount);
        this.discountPercentage = this.discountPercent;
    }

    if (typeof this.stock !== "number" && typeof this.stockQuantity === "number") {
        this.stock = this.stockQuantity;
    }

    if (typeof this.stockQuantity !== "number" && typeof this.stock === "number") {
        this.stockQuantity = this.stock;
    }

    next();
});

module.exports = mongoose.model("Product", productSchema);
