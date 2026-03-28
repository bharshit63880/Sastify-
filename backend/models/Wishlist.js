const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        note: {
            type: String,
            default: "",
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
