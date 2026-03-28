const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
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
        quantity: {
            type: Number,
            default: 1,
        },
        size: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            default: "",
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Cart", cartSchema);
