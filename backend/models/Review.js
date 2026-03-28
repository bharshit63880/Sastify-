const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            default: "",
        },
        comment: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["published", "hidden"],
            default: "published",
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Review", reviewSchema);
