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
        slug: {
            type: String,
            unique: true,
            trim: true,
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

    next();
});

module.exports = mongoose.model("Category", categorySchema);
