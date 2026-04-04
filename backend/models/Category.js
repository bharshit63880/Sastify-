const mongoose = require("mongoose");
const { Schema } = mongoose;
const { slugify } = require("../utils/slugify");

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        slug: {
            type: String,
            unique: true,
            trim: true,
        },
        path: {
            type: String,
            unique: true,
            trim: true,
        },
        level: {
            type: Number,
            default: 0,
            min: 0,
        },
        description: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true, versionKey: false }
);

categorySchema.pre("validate", function buildSlug(next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name);
    }

    if (!this.path && this.slug) {
        this.path = this.slug;
    }

    next();
});

module.exports = mongoose.model("Category", categorySchema);
